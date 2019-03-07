<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Mutation, namespace, Action, State } from 'vuex-class'
import { NavBar, CellGroup, Field, Cell, Button, Picker, DatetimePicker, Actionsheet, Checkbox, Toast } from 'vant'
import api from '@/api'
import BScroll from 'better-scroll'
const USER = namespace('user')

@Component({
  name: 'register',
  components: {
    [NavBar.name]: NavBar,
    [CellGroup.name]: CellGroup,
    [Field.name]: Field,
    [Cell.name]: Cell,
    [Button.name]: Button,
    [Picker.name]: Picker,
    [DatetimePicker.name]: DatetimePicker,
    [Actionsheet.name]: Actionsheet,
    [Checkbox.name]: Checkbox
  }
})
export default class Register extends Vue {
  @Mutation loadingToggle

  @Mutation updateLoginNotice

  @USER.Mutation updateToken

  @USER.Mutation updateUsername

  @USER.Mutation updateMessage

  @USER.Action getMessageRead

  @State registerSwitch

  registerForms: any = [] // 注册所需要提交的字段信息

  forms: any = {
    username: '', //用户名
    password: '', //密码
    avatar_url: '', //头像
    birth: '', //出生日期
    sex: '', //性别
    email: '', //邮箱
    email_code: '', //邮箱验证码
    mobile: '', //手机号码
    mobile_code: '', //手机验证码
    invite_code: '', //邀请码
    qq: '', //QQ
    wechat: '', //微信
    skype: '',
    realname: '', //真实姓名
    withdraw_password: '' //提现密码
  }

  showSelectBirthday: boolean = false // 选取出生日期的下拉弹框
  showSelectSex: boolean = false // 下拉弹框-性别

  currentDate: any = new Date()
  minDate: any = new Date(1900, 1, 1)
  maxDate: any = new Date()
  sexColumns: any = [{ text: '男', id: 1 }, { text: '女', id: 2 }, { text: '保密', id: 3 }] //数据-选择国籍

  nowSelect: string = '' // 暂存当前点击的下拉选框

  validateEmail: boolean = false // 是否验证邮箱
  disabledEmailCodeBtn: boolean = false // 获取邮箱验证码按钮的是否可点击状态
  emailBtnText: string = '获取验证码' // 发送邮箱验证按钮文字

  validateMobile: boolean = false // 是否验证手机号
  disabledMobileCodeBtn: boolean = false // 获取手机短信验证码按钮的是否可点击状态
  msgBtnText: string = '获取验证码' // 发送手机短信验证按钮文字

  vcodeData: any = {} //获取到的图片验证码信息

  checked: boolean = true //接受服务条款与否
  psd: string = ''
  psd_c: string = ''

  vcodeHash: string = ''
  $refs!: {
    container: Element
  }
  @Watch('registerSwitch')
  onRegisterSwitchChange(value) {
    if (!value) {
      this.$dialog
        .alert({
          message: '该注册入口已被关闭！'
        })
        .then(() => {
          this.$router.push('/')
        })
    }
  }

  created() {
    this.setInvitCode()
    this.$store.dispatch('registerSetting')
  }

  mounted() {
    this.getGegisterForms()
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
  }

  /*
   * 获取-注册邀请码
   */
  setInvitCode() {
    const { code } = this.$route.query
    if (code) {
      sessionStorage.setItem('invite_code', code)
    }
  }

  /*
   * 获取-注册字段信息
   */
  getGegisterForms() {
    this.loadingToggle()
    api
      .getRegister()
      .then((res: any) => {
        this.loadingToggle()
        const { code, data, msg } = res
        if (code == 0) {
          this.changeRegisterData(data)
        } else {
          Toast.fail(msg)
        }
      })
      .catch(error => {
        this.loadingToggle()
      })
  }

  /*
   * 更改-获取到的注册字段信息
   * 1.新增用户名、密码、确认密码三项
   * 2.为其他项增加数据
   * 3.过滤掉头像选择
   */
  changeRegisterData(resData) {
    this.registerForms = [
      {
        name: '用户名',
        show: true,
        value: '',
        required: true,
        type: 'text',
        reg: '^(?![0-9]+$)[0-9a-zA-Z]{6,16}$',
        placeholder: '请输入6-16位数字和字母结合',
        isLink: false,
        readonly: false,
        clearable: true,
        errorMsg: '',
        item: 'username'
      },
      {
        name: '密码',
        show: true,
        value: '',
        required: true,
        type: 'password',
        reg: '^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$',
        placeholder: '请输入6-16位字符组合',
        isLink: false,
        readonly: false,
        clearable: true,
        errorMsg: '',
        item: 'password'
      },
      {
        name: '确认密码',
        show: true,
        value: '',
        required: true,
        type: 'password',
        placeholder: '请再次输入密码',
        isLink: false,
        readonly: false,
        clearable: true,
        errorMsg: '',
        item: 'psd_confirm'
      }
    ].concat(
      resData
        .map(obj => {
          obj.value = ''
          obj.type = 'text'
          obj.placeholder = '请输入' + obj.name
          obj.errorMsg = ''
          obj.isLink = false
          obj.readonly = false
          obj.clearable = true
          if (obj.item === 'email') {
            obj.reg = '^([0-9A-Za-z-_.]+)@([0-9a-z]+.[a-z]{2,3}(.[a-z]{2})?)$'
            if (obj.valid) {
              obj.vcode = ''
              obj.disabled = false
              obj.time = 60
              obj.btnText = '获取验证码'
              obj.vcodeErrorMsg = ''
            }
          } else if (obj.item === 'mobile') {
            obj.reg = '^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$'
            if (obj.valid) {
              obj.vcode = ''
              obj.disabled = false
              obj.time = 60
              obj.btnText = '获取验证码'
              obj.vcodeErrorMsg = ''
            }
          } else if (obj.item === 'birth') {
            obj.placeholder = '请选择' + obj.name
            obj.isLink = true
            obj.readonly = true
            obj.clearable = false
          } else if (obj.item === 'sex') {
            obj.placeholder = '请选择' + obj.name
            obj.isLink = true
            obj.readonly = true
            obj.clearable = false
          } else if (obj.item === 'withdraw_password') {
            obj.reg = '^[0-9]{4}$'
          } else if (obj.item === 'vcode') {
            obj.img = ''
            this.getVcode(obj)
          } else if (obj.item === 'realname') {
            obj.reg = /^[\u4E00-\u9FA5]{2,10}$/
          } else if (obj.item === 'invite_code') {
            obj.value = sessionStorage.getItem('invite_code') || ''
          } else if (obj.item === 'wechat') {
            obj.reg = '^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$'
          } else if (obj.item === 'skype') {
            obj.reg = '^.{1,50}$'
          } else if (obj.item === 'qq') {
            obj.reg = '^[1-9]\\d{4,14}$'
          }
          return obj
        })
        .filter(obj => obj.item !== 'avatar_url')
    )
  }

  /*
   * 点击-点击下拉弹框选项
   */
  onClickSelect(name) {
    switch (name) {
      case 'birth':
        this.showSelectBirthday = true
        this.nowSelect = name
        break
      case 'sex':
        this.showSelectSex = true
        this.nowSelect = name
        break
    }
  }

  /*
   * 点击-确认下拉弹框选择
   */
  onConfirm(values) {
    switch (this.nowSelect) {
      case 'birth':
        this.showSelectBirthday = false
        this.forms.birth = values.format('yyyy-MM-dd')
        this.registerForms.forEach(obj => {
          if (obj.item === this.nowSelect) {
            obj.value = values.format('yyyy-MM-dd')
            this.checkForm(obj.item)
          }
        })
        break
      case 'sex':
        this.showSelectSex = false
        this.forms.sex = values.id
        this.registerForms.forEach(obj => {
          if (obj.item === this.nowSelect) {
            obj.value = values.text
            this.checkForm(obj.item)
          }
        })
        break
    }
  }
  /*
   * 点击-获取验证码
   */
  countdown(item) {
    let interval = window.setInterval(() => {
      item.disabled = true
      item.btnText = item.time + 's'
      if (item.time-- <= 0) {
        item.time = 10
        window.clearInterval(interval)
        item.disabled = false
        item.btnText = '获取验证码'
      }
    }, 1000)
  }

  /*
   * 点击-获取验证码
   */
  getVcode(item) {
    if (item.item !== 'vcode') {
      this.checkForm(item.item)
      if (item.errorMsg !== '') {
        return false
      }
    }

    let params: object = {}
    params[item.item] = item.value
    if (item.item === 'email') {
      this.loadingToggle()
      api
        .getVcodeEmail(params)
        .then((res: any) => {
          this.loadingToggle()
          if (res.code == 0) {
            this.countdown(item)
            Toast.success('邮箱验证码已发送')
          } else {
            Toast.fail(res.msg)
          }
        })
        .catch(err => {
          this.loadingToggle()
        })
    } else if (item.item === 'mobile') {
      this.loadingToggle()
      api
        .getVcodeMobile(params)
        .then((res: any) => {
          this.loadingToggle()
          if (res.code == 0) {
            this.countdown(item)
            Toast.success('短信验证码已发送')
          } else {
            Toast.fail(res.msg)
          }
        })
        .catch(err => {
          this.loadingToggle()
        })
    } else if (item.item === 'vcode') {
      this.loadingToggle()
      item.disabled = true
      api
        .vcode()
        .then((res: any) => {
          this.loadingToggle()
          const { code, msg, data } = res
          if (code == 0) {
            const { hash, img } = data
            item.img = img
            this.vcodeHash = hash
          } else {
            Toast.fail(msg)
          }
          item.disabled = false
        })
        .catch(err => {
          this.loadingToggle()
        })
    }
  }

  /*
   * 校验-全部表单
   */
  checkForm(n) {
    this.registerForms.forEach(item => {
      if (item.item == 'password' && item.required) this.psd = item.value
      if (item.item == 'psd_confirm' && item.required) this.psd_c = item.value
      switch (n) {
        case 'username':
          if (item.item == n && item.show) {
            this.forms.username = item.value
            let regexp = new RegExp(item.reg).test(item.value)
            if (!regexp) {
              item.errorMsg = '账户为6-16位数字和字母结合'
            } else {
              item.errorMsg = ''
            }
          }
          break
        case 'password':
          if (item.item == n && item.show) {
            this.forms.password = item.value
            let regexp = new RegExp(item.reg).test(item.value)
            if (!regexp) {
              item.errorMsg = '密码为6-16位字符组合'
            } else {
              if (this.psd_c !== '') {
                if (this.psd_c !== item.value) {
                  item.errorMsg = '两次密码输入不一致'
                } else {
                  item.errorMsg = ''
                }
              }
              item.errorMsg = ''
            }
          }
          break
        case 'psd_confirm':
          if (item.item === n && item.show) {
            if (item.value == '') {
              item.errorMsg = '请再次输入密码'
            } else if (this.psd !== item.value) {
              item.errorMsg = '两次密码输入不一致'
            } else {
              item.errorMsg = ''
            }
          }
          break
        case 'email':
          if (item.item == n && item.show) {
            this.forms.email = item.value
            if (item.required || item.value !== '') {
              let regexp = new RegExp(item.reg).test(item.value)
              if (!regexp) {
                item.errorMsg = '邮箱格式不正确'
              } else {
                item.errorMsg = ''
              }
            }
            if (item.valid && item.required && item.show) {
              this.forms.email_code = item.vcode
              if (!item.vcode) {
                item.vcodeErrorMsg = '请输入验证码'
              } else {
                item.vcodeErrorMsg = ''
              }
            }
          }
          break
        case 'mobile':
          if (item.item == n && item.show) {
            this.forms.mobile = item.value
            if (item.required || item.value !== '') {
              let regexp = new RegExp(item.reg).test(item.value)
              if (!regexp) {
                item.errorMsg = '手机格式不正确'
              } else {
                item.errorMsg = ''
              }
            }
            if (item.valid && item.required && item.show) {
              this.forms.mobile_code = item.vcode
              if (!item.vcode) {
                item.vcodeErrorMsg = '请输入验证码'
              } else {
                item.vcodeErrorMsg = ''
              }
            }
          }
          break
        case 'invite_code':
          if (item.item == n && item.show) {
            this.forms.invite_code = item.value
            if (item.required) {
              if (item.value == '') {
                item.errorMsg = '请输入推荐码'
              } else {
                item.errorMsg = ''
              }
            }
          } else if (item.item == n && !item.show) {
            this.forms.invite_code = sessionStorage.getItem('invite_code') || ''
          }
          break
        case 'vcode':
          if (item.item == n && item.show) {
            this.forms.vcode = item.value
            if (item.value) {
              this.forms['hash'] = this.vcodeHash
            }
            if (item.required) {
              if (item.value == '') {
                item.errorMsg = '请输入验证码'
              } else {
                item.errorMsg = ''
              }
            }
          }
          break
        case 'qq':
          if (item.item == n && item.show) {
            this.forms.qq = item.value
            if (item.required || item.value !== '') {
              let regexp = new RegExp(item.reg).test(item.value)
              if (!regexp) {
                item.errorMsg = '请输入正确QQ号'
              } else {
                item.errorMsg = ''
              }
            }
          }
          break
        case 'wechat':
          if (item.item == n && item.show) {
            this.forms.wechat = item.value
            if (item.required || item.value !== '') {
              let regexp = new RegExp(item.reg).test(item.value)
              if (!regexp) {
                item.errorMsg = '请输入正确微信号'
              } else {
                item.errorMsg = ''
              }
            }
          }
          break
        case 'skype':
          if (item.item == n && item.show) {
            this.forms.skype = item.value
            if (item.required || item.value !== '') {
              let regexp = new RegExp(item.reg).test(item.value)
              if (!regexp) {
                item.errorMsg = '请输入正确skype号'
              } else {
                item.errorMsg = ''
              }
            }
          }
          break
        case 'realname':
          if (item.item == n && item.show) {
            this.forms.realname = item.value
            if (item.required || item.value !== '') {
              let regexp = new RegExp(item.reg).test(item.value)
              if (!regexp) {
                item.errorMsg = '请输入2~10个中文字'
              } else {
                item.errorMsg = ''
              }
            }
          }
          break
        case 'withdraw_password':
          if (item.item == n && item.show) {
            this.forms.withdraw_password = item.value
            if (item.required || item.value !== '') {
              let regexp = new RegExp(item.reg).test(item.value)
              if (!regexp) {
                item.errorMsg = '请输入4位数字'
              } else {
                item.errorMsg = ''
              }
            }
          }
          break
        case 'birth':
          if (item.item == n && item.show && item.required) {
            this.forms.birth = item.value
            if (item.value == '') {
              item.errorMsg = '请选择出生日期'
            } else {
              item.errorMsg = ''
            }
          }
          break
        case 'sex':
          if (item.item == n && item.show && item.required) {
            this.forms.sex = item.value
            if (item.value == '') {
              item.errorMsg = '请选择性别'
            } else {
              item.errorMsg = ''
            }
          }
          break
      }
    })
  }
  /*
   * 跳转-到服务条款页
   */
  gotoHelpCenter() {
    this.$router.push({ path: '/my/help-center' })
  }

  /*
   * 存储-注册数据
   */
  bindUser(data) {
    let user = {
      token: data.token,
      username: data.user.username
    }
    this.updateToken(data.token)
    this.updateUsername(data.user.username)
    this.updateLoginNotice(true)
    if (this.checked) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      sessionStorage.setItem('user', JSON.stringify(user))
    }
  }

  /*
   * 点击-立即注册
   */
  onClickRegister() {
    if (!this.checked) {
      this.$toast('请先阅读并同意服务条款')
      return
    }
    let isPassCheck = this.registerForms
      .map(item => {
        this.checkForm(item.item)
        return item
      })
      .some(item => item.errorMsg !== '')
    if (isPassCheck) {
      return
    }
    this.loadingToggle()
    let params = {}
    let obj = this.forms
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && (obj[key] == null || obj[key] == undefined || obj[key] == '')) {
        delete obj[key]
      }
    }
    params = Object.assign(params, obj)
    api
      .register(params)
      .then((res: any) => {
        this.loadingToggle()
        const { code, data, msg } = res
        if (code == 0) {
          Toast.success('注册成功')
          this.bindUser(data)
          // 获取会员未读会员消息
          this.getMessageRead()
          this.$router.push({ path: '/my' })
        } else if (code === 1) {
          this.$dialog
            .alert({
              message: msg
            })
            .then(() => {
              location.reload()
            })
        } else {
          Toast.fail(res.msg)
          // 如果有验证码的话，重新请求获取验证，
          if (obj.vcode) {
            for (let i = 0; i < this.registerForms.length; i++) {
              let tempItem = this.registerForms[i]
              if (tempItem.item === 'vcode') {
                this.getVcode(tempItem)
                break
              }
            }
          }
        }
      })
      .catch(error => {
        this.loadingToggle()
      })
  }
}
</script>
