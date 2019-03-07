<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Mutation, namespace, State } from 'vuex-class'
import { NavBar, Field, CellGroup, Checkbox, Button } from 'vant'
import api from '@/api'
const USER = namespace('user')

@Component({
  name: 'trial',
  components: {
    [NavBar.name]: NavBar,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Checkbox.name]: Checkbox,
    [Button.name]: Button
  }
})
export default class Trial extends Vue {
  @USER.Mutation updateToken
  @USER.Mutation updateUserType
  @USER.Mutation updateUsername

  @Mutation loadingToggle

  @State logo

  @State isFree

  username: string = '' // 用户名

  password: string = '' // 密码

  pwdConfirm: string = '' // 密码确认

  errorPassword: string = '' //密码-校验

  errorPwdConfirm: string = '' //密码确认-校验

  visiblePwd: string = 'password-not-view' //密码可见与否
  visiblePwd2: string = 'password-not-view' //密码可见与否

  inputType: string = 'password' // 密码的input类型
  inputType2: string = 'password' // 密码的input类型

  /*
   * watch监听表单格式的是否合乎校验
   */
  @Watch('password')
  passwordWatch() {
    this.checkPassword()
  }
  @Watch('pwdConfirm')
  pwdConfirmWatch() {
    this.checkPwdConfirm()
  }

  @Watch('isFree')
  onIsFreeChange(value) {
    if (value !== 'true') {
      this.$dialog
        .alert({
          message: '该免费试玩入口已被关闭！'
        })
        .then(() => {
          this.$router.push('/')
        })
    }
  }
  /*
   * 校验表单
   */
  checkPassword() {
    let passwordRegExp = /^([0-9a-zA-Z]{6,16})$/i.test(this.password)
    if (this.password == '') {
      this.errorPassword = '请输入密码'
    } else if (!passwordRegExp) {
      this.errorPassword = '请输入6-16位数字和字母组合'
    } else {
      this.errorPassword = ''
      return true
    }
  }
  checkPwdConfirm() {
    if (this.pwdConfirm == '') {
      this.errorPwdConfirm = '请输入确认密码'
    } else if (this.pwdConfirm !== this.password) {
      this.errorPwdConfirm = '两次密码不一致'
    } else {
      this.errorPwdConfirm = ''
      return true
    }
  }

  mounted() {
    this.loadingToggle()
    api
      .getTrialUsername()
      .then((res: any) => {
        this.loadingToggle()
        const { code, data, msg } = res
        if (code === 0) {
          this.username = data
        } else {
          this.$toast.fail(msg + '请刷新当前页面')
        }
      })
      .catch((error: any) => {})
  }

  /*
   * 切换密码可见状态
   */
  toggleVisiblePwd() {
    this.visiblePwd = this.visiblePwd === 'password-not-view' ? 'password-view' : 'password-not-view'
    this.inputType = this.inputType === 'password' ? 'text' : 'password'
  }
  toggleVisiblePwd2() {
    this.visiblePwd2 = this.visiblePwd2 === 'password-not-view' ? 'password-view' : 'password-not-view'
    this.inputType2 = this.inputType2 === 'password' ? 'text' : 'password'
  }

  /*
   * 免费试玩
   */
  onClickTrial() {
    this.checkPassword()
    this.checkPwdConfirm()
    if (this.checkPassword() && this.checkPwdConfirm()) {
      const { username, password } = this
      api
        .postTrial({
          username,
          password
          // h5_pc: 'h5'
        })
        .then((res: any) => {
          const { code, data, msg } = res
          if (code === 0) {
            this.bindUser(data)
            this.updateToken(data.token)
            this.updateUserType('1')
            this.updateUsername(username)
            this.$router.push('/')
            this.$dialog.alert({
              title: '温馨提示',
              message: '您已经成功登录试玩账号！试玩账号不能进行充值、提现等操作，并且有可能存在彩票缺失的问题。体验完整内容请注册正式账号！'
            })
          }
        })
        .catch((error: any) => {})
    }
  }

  /*
   * 存储登录数据
   */
  bindUser(data) {
    const user = {
      token: data.token,
      userType: '1',
      username: this.username
    }
    localStorage.setItem('user', JSON.stringify(user))
  }
}
</script>
