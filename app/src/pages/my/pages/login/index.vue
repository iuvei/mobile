<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Mutation, namespace, State, Action } from 'vuex-class'
import { NavBar, Field, CellGroup, Checkbox, Button, Tab, Tabs, Toast } from 'vant'
import api from '@/api'

const USER = namespace('user')

@Component({
  name: 'login',
  components: {
    [NavBar.name]: NavBar,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Checkbox.name]: Checkbox,
    [Button.name]: Button,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs
  }
})
export default class Login extends Vue {
  @Mutation loadingToggle

  @Mutation updateLoginNotice

  @USER.Mutation updateUsername

  @USER.Mutation updateToken

  @USER.Mutation updateUserType

  @USER.Mutation updateMessage

  @State logo

  @USER.Action getMessageRead

  @State isFree

  @State registerSwitch

  @State steamSwitch

  username: string = localStorage.getItem('username') || '' //用户名
  password: string = '' //密码
  picCode: string = '' //图片验证码
  username2: string = localStorage.getItem('username2') || '' //手机or邮箱
  vcode: string = '' //短信/邮箱验证码

  isShowPicCode: boolean = false //是否展示图片验证码输入框
  vCodeData: any = {} // 图片验证码与hash的数据

  regDemo: RegExp = /^(game_)/ // 试用账户正则校验
  regEmail: RegExp = /^([0-9A-Za-z-_.]+)@([0-9a-z]+.[a-z]{2,3}(.[a-z]{2})?)$/ // 邮箱正则校验
  regMobile: RegExp = /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/ // 手机号正则校验

  tabActive: number = 0 // tab当前激活标签的索引

  visiblePwd: string = 'password-not-view' //密码可见与否
  inputType: string = 'password' // 密码的input类型
  disabledCodeBtn: boolean = false //获取验证码按钮可点击状态
  btnText: string = '获取验证码' //短信/邮箱验证码按钮文字
  checked: boolean = true //记住密码与否

  errorUsername: string = '' //用户名-错误信息
  errorPassword: string = '' //密码-错误信息
  errorPicCode: string = '' //图片验证码-校验
  errorUsername2: string = '' //-短信/邮箱错误信息
  errorVcode: string = '' //-短信/邮箱验证码错误信息

  created() {}

  mounted() {
    const activeLine = document.getElementsByClassName('van-tabs__line')[0]
    activeLine.setAttribute('class', 'van-tabs__line animation1')

    this.getNeedVcode()
  }

  /*
   * 监听-表单格式的是否合乎校验
   */
  @Watch('username')
  usernameWatch() {
    this.checkUsername()
  }
  @Watch('password')
  passwordWatch() {
    this.checkPassword()
  }
  @Watch('picCode')
  picCodeWatch() {
    this.checkPicCode()
  }
  @Watch('username2')
  usernameWatch2() {
    this.checkUsername2()
  }
  @Watch('vcode')
  vcodeWatch() {
    this.checkVCode()
  }

  /*
   * 获取-图片验证码是否为必填
   */
  getNeedVcode() {
    api
      .needVcode()
      .then((res: any) => {
        if (res.code == 0) {
          this.isShowPicCode = res.data.required
          if (this.isShowPicCode) {
            this.getPicCode()
          }
        }
      })
      .catch(error => {})
  }
  /*
   * 获取-图片验证码
   */
  getPicCode() {
    api
      .vcode()
      .then((res: any) => {
        if (res.code == 0) {
          this.vCodeData = res.data
        }
      })
      .catch(error => {})
  }

  /*
   * 点击-获取短信/邮箱验证码
   */
  getVcode() {
    if (this.errorUsername2 !== '') {
      return false
    }
    if (this.regEmail.test(this.username2)) {
      let params = {
        email: this.username2
      }
      this.loadingToggle()
      api
        .getVcodeEmail(params)
        .then((res: any) => {
          this.loadingToggle()
          if (res.code == 0) {
            this.countdown()
            Toast.success('邮箱验证码已发送')
          } else {
            Toast.fail(res.msg)
          }
        })
        .catch(err => {
          this.loadingToggle()
        })
    } else if (this.regMobile.test(this.username2)) {
      let params = {
        mobile: this.username2
      }
      this.loadingToggle()
      api
        .getVcodeMobile(params)
        .then((res: any) => {
          this.loadingToggle()
          if (res.code == 0) {
            this.countdown()
            Toast.success('手机验证码已发送')
          } else {
            Toast.fail(res.msg)
          }
        })
        .catch(err => {
          this.loadingToggle()
        })
    }
  }

  /* 倒计时 */
  countdown() {
    let self = this
    let time = 60
    this.disabledCodeBtn = true
    let interval = window.setInterval(function() {
      self.btnText = time + 's'
      if (time-- <= 0) {
        time = 60
        window.clearInterval(interval)
        self.disabledCodeBtn = false
        self.btnText = '获取验证码'
      }
    }, 1000)
  }

  /*
   * 点击-标签时触发
   */
  tabToggle(index, title) {
    this.tabActive = index
    const activeLine = document.getElementsByClassName('van-tabs__line')[0]
    this.$nextTick(() => {
      if (index) {
        activeLine.setAttribute('class', 'van-tabs__line animation2')
      } else {
        activeLine.setAttribute('class', 'van-tabs__line animation1')
      }
    })
  }

  /*
   * 切换-密码可见状态
   */
  toggleVisiblePwd() {
    this.visiblePwd = this.visiblePwd === 'password-not-view' ? 'password-view' : 'password-not-view'
    this.inputType = this.inputType === 'password' ? 'text' : 'password'
  }

  /*
   * 校验-表单-用户名
   */
  checkUsername() {
    if (this.username === '') {
      this.errorUsername = '用户名不能为空'
    } else {
      this.errorUsername = ''
    }
  }
  /*
   * 校验-表单-密码
   */
  checkPassword() {
    if (this.password === '') {
      this.errorPassword = '密码不能为空'
    } else {
      this.errorPassword = ''
    }
  }
  /*
   * 校验-表单-图片验证码
   */
  checkPicCode() {
    if (this.picCode == '') {
      this.errorPicCode = '验证码不能为空'
    } else {
      this.errorPicCode = ''
      return true
    }
    return true
  }

  /*
   * 校验-表单-邮箱or手机号
   */
  checkUsername2() {
    if (this.regEmail.test(this.username2) || this.regMobile.test(this.username2)) {
      this.errorUsername2 = ''
    } else {
      this.errorUsername2 = '请输入正确手机号或邮箱'
    }
  }

  /*
   * 校验-表单-短信/邮箱验证码
   */
  checkVCode() {
    if (this.vcode == '') {
      this.errorVcode = '验证码不能为空'
    } else {
      this.errorVcode = ''
    }
  }

  /*
   * 存储登录数据
   */
  bindUser(data) {
    let user = {
      token: data.token,
      username: data.user.username,
      userType: this.regDemo.test(this.username) ? '1' : ''
    }
    this.updateToken(data.token)
    this.updateLoginNotice(true)
    if (this.checked) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      sessionStorage.setItem('user', JSON.stringify(user))
    }
  }

  /*
   * 登录
   */
  onClickLogin() {
    let params
    if (this.tabActive == 0) {
      this.checkUsername()
      this.checkPassword()
      if (this.isShowPicCode) {
        this.checkPicCode()
      }
      if (this.errorUsername !== '' || this.errorPassword !== '' || (this.isShowPicCode && this.errorPicCode !== '')) {
        return false
      }
      if (this.regDemo.test(this.username)) {
        params = {
          demo: this.username,
          password: this.password,
          hash: this.vCodeData.hash,
          vcode: this.isShowPicCode ? this.picCode : ''
        }
      } else {
        params = {
          username: this.username,
          password: this.password,
          hash: this.vCodeData.hash,
          vcode: this.isShowPicCode ? this.picCode : ''
        }
      }
      this.loadingToggle()
      api
        .login(params)
        .then((res: any) => {
          this.loadingToggle()
          if (res.code == 0) {
            Toast.success('登录成功')
            this.bindUser(res.data)
            this.updateUsername(this.username)
            localStorage.setItem('username', this.username)
            if (this.regDemo.test(this.username)) {
              this.updateUserType('1')
            } else {
              // 获取会员未读会员消息
              this.getMessageRead()
            }

            this.$router.push({ path: '/' })
          } else {
            Toast.fail(res.msg)
            this.getPicCode()
          }
        })
        .catch(err => {
          this.loadingToggle()
        })
    } else if (this.tabActive == 1) {
      this.checkUsername2()
      this.checkVCode()
      if (this.errorUsername2 !== '' || this.errorVcode !== '' || this.errorPicCode !== '') {
        return false
      }
      if (this.regEmail.test(this.username2)) {
        params = {
          email: this.username2,
          code: this.vcode
        }
      } else if (this.regMobile) {
        params = {
          mobile: this.username2,
          code: this.vcode
        }
      }
      this.loadingToggle()
      api
        .loginByCode(params)
        .then((res: any) => {
          this.loadingToggle()
          if (res.code == 0) {
            Toast.success('登录成功')
            this.bindUser(res.data)
            this.updateUsername(this.username)
            localStorage.setItem('username2', this.username2)
            // 获取会员未读会员消息
            this.getMessageRead()
            this.$router.push({ path: '/' })
          } else {
            Toast.fail(res.msg)
          }
        })
        .catch(err => {
          this.loadingToggle()
        })
    }
  }

  /*
   * steam登录
   */
  onClickSteam() {}
}
</script>
