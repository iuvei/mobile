<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { NavBar, Cell, CellGroup } from 'vant'
import Edit from './components/edit/index.vue'
import Passpop from '@/components/passpop/index.vue'
import FailToSteam from './components/fail-to-steam/index.vue'
import api from '@/api'
import { Mutation } from 'vuex-class'

@Component({
  components: {
    Edit,
    Passpop,
    FailToSteam,
    [NavBar.name]: NavBar,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup
  }
})
export default class Security extends Vue {
  @Mutation loadingToggle
  /*************data***********/
  //安全中心数据源
  dataSource: any = {}

  // 安全中心的文字提示
  dataSourceLabel: any = {
    email: '安全邮箱',
    mobile: '手机号码',
    question: '安全问题',
    id_card: '实名认证',
    active_pwd: '动态密码',
    withdraw_password: '提现密码',
    password: '登录密码',
    steam_auth: 'Steam账号设置'
  }

  // 列表的文字提示
  status0: string = '设置'
  status1: string = '修改'
  codeText: string = '秒后重新获取'

  //显示列表还是显示编辑
  type: string = 'list'

  //编辑的参数对象
  editObj: any = {}
  // 前一次的编辑参数对象
  beforeEditObj: any = {}

  //提交表单对象
  form: any = {}
  beforeForm: any = {}

  // 为提现密码校验的手机身份验证和邮箱身份验证
  withdrawVerfication: any = {
    mobileVer: false,
    emailVer: false
  }

  // 设置提现密码弹框的设置
  passpop: any = {
    title: '设置提现密码',
    number: 4, //限制输入密码个数
    isShow: false, //是否显示密码输入框
    callback: (password, fn) => {
      // 设置提现密码
      this.bindWithdrawPwd(password, fn)
    }
  }

  // steam跳转的地址
  steamUrl: string = ''

  // 供查看steam绑定对应的用户信息用
  openid_mode: string = ''
  openid_identity: string = ''
  // steam绑定的错误信息
  steamFailMes: string = ''

  // 作为是否可以进行下一步的验证步骤，传给后台
  check: string = ''

  $refs!: {}

  // 获取邮箱/手机验证码的定时器
  timer: any = null

  // 密码
  @Watch('form.pwd')
  onFormPasswordChanged(newVal, oldVal) {
    if (newVal) {
      if (this.editObj.cellGroup[0].title !== '登录密码') {
        this.checkFormForKey(newVal, 0, '请输入4位数字密码', /^[0-9]{4}$/)
      } else {
        this.checkFormForKey(newVal, 0, '请输入6-16位数字或字母的密码', /^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$/)
      }
    }
  }
  @Watch('form.old_pwd')
  onFormOldPwdChanged(newVal, oldVal) {
    if (newVal) {
      if (this.editObj.title === '修改提现密码') {
        this.checkFormForKey(newVal, 0, '请输入4位数字密码', /^[0-9]{4}$/)
      } else {
        this.checkFormForKey(newVal, 0, '请输入6-16位数字或字母的密码', /^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$/)
      }
    }
  }
  @Watch('form.new_pwd')
  onFormNewPwdChanged(newVal, oldVal) {
    if (newVal) {
      if (this.editObj.title === '修改提现密码') {
        this.checkFormForKey(newVal, 1, '请输入4位数字密码', /^[0-9]{4}$/)
      } else {
        this.checkFormForKey(newVal, 1, '请输入6-16位数字或字母的密码', /^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$/)
      }
    }
  }
  @Watch('form.new_pwd_confirm')
  onFormNewPwdConfirmChanged(newVal, oldVal) {
    if (newVal) {
      this.checkForNewPwd(newVal, this.form.new_pwd, '两次输入的密码不一样，请重新输入', 2)
    }
  }
  // 真实姓名
  @Watch('form.realname')
  onFormRealNameChanged(newVal, oldVal) {
    if (newVal && newVal.indexOf('*') === -1) {
      this.checkFormForKey(newVal, 0, '请输入2-10个汉字', /^[\u4E00-\u9FA5]{2,10}$/)
    }
  }

  // 身份证号
  @Watch('form.idcard')
  onFormIdCardChanged(newVal, oldVal) {
    if (newVal) {
      this.checkFormForKey(
        newVal,
        1,
        '请输入合理的身份证号',
        /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[X|x])$)$/
      )
    }
  }

  // 手机
  @Watch('form.mobile')
  onFormMobileChanged(newVal, oldVal) {
    if (newVal && (this.editObj.title === '绑定手机号码' || this.editObj.cellGroup[0].title === '新邮箱')) {
      this.checkFormForKey(newVal, 0, '请输入合理的手机号码', /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/)
    }
  }

  // 验证码
  @Watch('form.code')
  onFormCodeChanged(newVal, oldVal) {
    if (newVal) {
      this.checkFormForKey(newVal, 1, '')
    }
  }

  // 邮箱
  @Watch('form.email')
  onFormEmailChanged(newVal, oldVal) {
    if (newVal && (this.editObj.title === '邮箱设置' || this.editObj.cellGroup[0].title === '新邮箱')) {
      this.checkFormForKey(newVal, 0, '请输入合理的邮箱地址', /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/)
    }
  }

  /***************表单校验************/
  // 所有的表单验证
  // val：需要校验的值
  // index：为了取到对应的title
  // reg：正则规则
  // errorMessmage：文字提示
  checkFormForKey(val, index, errorMessmage, reg?: RegExp) {
    let tempError = ''
    if (!val) {
      tempError = '请输入' + this.editObj.cellGroup[index].title
    } else {
      if (reg && reg.test(val)) {
        tempError = ''
      } else {
        tempError = errorMessmage
      }
    }
    this.$set(this.editObj['cellGroup'][index], 'errorMes', tempError)
    if (tempError.length) {
      return false
    } else {
      return true
    }
  }
  // 校验输入的密码两次是否一致
  // value_confirm:本次需要校验的值
  // value：和这个值比较一不一样
  // errorMes：错误提示
  // index ：本次需要校验的值在editObj的cellGrop中的下标
  checkForNewPwd(value_confirm, value, errorMes, index) {
    let tempError = ''
    if (!value_confirm) {
      tempError = '请输入' + this.editObj['cellGroup'][index].title
    } else {
      if (value_confirm !== value) {
        tempError = errorMes
      } else {
        tempError = ''
      }
    }
    this.$set(this.editObj['cellGroup'][index], 'errorMes', tempError)

    if (tempError.length) {
      return false
    } else {
      return true
    }
  }
  /*************life-cycle***********/
  activated() {
    this.requestSecurity()

    //steam账号设置问题
    // this.getSteamUrl(window.location.origin + '/my/security')

    // 从第三方网站steam登陆后跳回该页面需要执行的逻辑，
    // 需要校验下该steam是否绑定成功
    // const tempSearch = window.location.search
    // if (tempSearch.indexOf('openid') > -1) {
    //   let openidList = tempSearch.split('&')
    //   this.openid_mode = openidList.filter(openidList => openidList.includes('openid.mode'))[0].split('=')[1]
    //   let openid_identity1 = openidList.filter(openidList => openidList.includes('openid.identity'))[0].split('=')[1]
    //   this.openid_identity = decodeURIComponent(openid_identity1)
    //   window.sessionStorage.setItem('openid_mode', this.openid_mode)
    //   window.sessionStorage.setItem('openid_identity', this.openid_identity)
    //   if (window.sessionStorage.getItem('changeSteam')) {
    //     this.bindSteam(this.openid_mode, this.openid_identity)
    //   }
    // }
  }

  /*************methods***********/
  // 请求安全中心的数据
  requestSecurity(reflashRouter?: boolean) {
    this.loadingToggle()
    if (reflashRouter) {
      this.type = 'list'
      this.$router.go(-1)
    }
    api
      .userSafety()
      .then((res: any) => {
        this.loadingToggle()
        const { code, data } = res
        if (code == 0 && data) {
          this.beforeForm = {}
          this.beforeEditObj = {}
          // 组装数据 [[],[]]
          this.withdrawVerfication = {
            mobileVer: data['mobile'].status === '0' ? true : false,
            emailVer: data['email'].status === '0' ? true : false
          }
          let bigArr: any = []
          let oneArr: object[] = []
          let twoArr: object[] = []
          for (const key in data) {
            const tempObj = data[key]
            data[key] = { ...tempObj, title: this.dataSourceLabel[key], key }
            if (key === 'withdraw_password' || key === 'password' || key === 'steam_auth') {
              twoArr.push(data[key])
            } else if (key === 'google_auth' || key === 'question' || key === 'active_pwd') {
            } else {
              oneArr.push(data[key])
            }
          }
          bigArr.push(oneArr)
          bigArr.push(twoArr)
          this.dataSource = bigArr
          // if (this.type !== 'list') {
          //   this.type = 'list'
          // }

          // 根据对应的路由跳到对应的安全操作
          const { key, status } = this.$route.query
          if (key && status) {
            if (data[key].status === status) {
              this.onClickCell(data[key])
            } else {
              this.$dialog.alert({
                message: `${data[key].title}为${status !== '0' ? '设置' : '修改'}状态，无法进行${status === '0' ? '设置' : '修改'}`
              })
            }
          }
        }
      })
      .catch(error => {
        this.loadingToggle()
      })
  }

  // 获取steam账号跳转地址
  getSteamUrl(url) {
    api
      .apiVcodeGetSteamAuthLink({ url })
      .then((res: any) => {
        const { state, data } = res
        if (state === 0) {
          this.steamUrl = data.url
        }
      })
      .catch((error: any) => {})
  }

  // 获取steam绑定用户的信息
  bindSteam(openid_mode, openid_identity) {
    api
      .apiVcodeBindSteam({ openid_mode, openid_identity })
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          this.$toast.success('steam绑定成功')
        } else {
          this.type = 'failSteam'
          this.steamFailMes = msg
        }
      })
      .catch((error: any) => {})
  }

  onClickLeft() {
    this.$router.go(-1)
  }

  returnToList() {
    if (JSON.stringify(this.beforeEditObj) !== '{}') {
      this.editObj = { ...this.beforeEditObj }
      this.form = { ...this.beforeForm }
      this.beforeEditObj = {}
      this.beforeForm = {}
    } else {
      this.requestSecurity(true)
    }
    // 清楚定时器的问题

    this.clearTimer()
  }

  // 清楚定时器的问题
  clearTimer() {
    if (this.timer) {
      if (this.editObj.cellGroup[1] && this.editObj.cellGroup[1].disabled) {
        this.form.code = ''
        this.editObj.cellGroup[1].button = '获取验证码'
        this.editObj.cellGroup[1].disabled = false
      }
      clearInterval(this.timer)
    }
  }
  onClickCell(obj) {
    const { key, status } = obj
    this.$router.push({ path: '/my/security', query: { key, status } })

    if (key === 'steam_auth') {
      this.type = 'list'
    } else {
      this.type = key + status
    }
    switch (key) {
      case 'id_card':
        this.idCard(obj)
        break
      case 'mobile':
        this.mobile(obj)
        break
      case 'email':
        this.email(obj)
        break
      case 'withdraw_password':
        this.withdrawPwd(obj)
        break
      case 'password':
        this.password(obj)
        break
      case 'steam_auth':
        window.location.href = this.steamUrl
        window.sessionStorage.setItem('changeSteam', 'true')
        break
    }
  }

  // ************
  // 实名认证
  idCard(obj) {
    const { status } = obj
    switch (status) {
      // 设置
      case '0':
        this.loadingToggle()
        api
          .getUserRealname()
          .then((res: any) => {
            this.loadingToggle()
            const { code, data } = res
            if (code === 0) {
              this.editObj = {
                title: '实名认证',
                cellGroup: [
                  {
                    title: '真实姓名',
                    prop: 'realname',
                    type: 'field',
                    placeholder: '请输入您的真实姓名',
                    Disable: data ? true : false
                  },
                  {
                    title: '身份证号',
                    prop: 'idcard',
                    type: 'field',
                    placeholder: '请输入您的身份证号'
                  }
                ],
                btn: {
                  title: '确定',
                  type: 'button',
                  event: item => {
                    this.confirmIdCard(item)
                  }
                },
                footer: obj.value
              }
              this.form = {
                realname: data ? data : '',
                idcard: ''
              }
            }
          })
          .catch((error: any) => {
            this.loadingToggle()
          })

        break
      // 查看
      default:
        this.editObj = {}
        this.loadingToggle()
        api
          .getUserRealname()
          .then((res: any) => {
            this.loadingToggle()
            const { code, data } = res
            if (code === 0) {
              this.editObj = {
                title: '实名认证',
                cellGroup: [
                  {
                    title: '真实姓名',
                    type: 'cell',
                    value: data
                  },
                  {
                    title: '身份证号',
                    type: 'cell',
                    value: obj.value.split(':')[1]
                  }
                ]
              }
            }
          })
          .catch((error: any) => {
            this.loadingToggle()
          })
    }
  }
  // 确定实名认证的事件
  confirmIdCard(obj) {
    const { realname, idcard } = obj
    let param = { idcard }
    // 先校验
    let isOk1: boolean = true
    if (realname.indexOf('*') === -1) {
      isOk1 = this.checkFormForKey(realname, 0, '请输入2-10个汉字', /^[\u4E00-\u9FA5]{2,10}$/)
      param['realname'] = realname
    }
    const isOk2 = this.checkFormForKey(
      idcard,
      1,
      '请输入合理的身份证号',
      /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/
    )
    if (!isOk1 || !isOk2) {
      return
    }
    this.loadingToggle()
    // 提交
    api
      .userIdcard(param)
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg } = res
        if (code === 0) {
          this.$toast.success('实名认证成功')
          this.type = 'list'
          this.requestSecurity(true)
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {
        this.loadingToggle()
        this.$toast.fail('实名认证失败')
      })
  }

  // ************
  // 手机
  mobile(obj) {
    const { status, key } = obj
    switch (status) {
      // 设置
      case '0':
        this.validLoginPWdEditObjAndForm('mobile', '绑定手机号码')
        break
      // 修改
      case '1':
        this.editObj = {}
        this.form = {}
        this.loadingToggle()
        api
          .getMobile()
          .then((res: any) => {
            this.loadingToggle()
            const { code, data } = res
            if (code === 0) {
              this.editObj = {
                title: '修改手机号',
                cellGroup: [
                  {
                    title: '旧手机号',
                    prop: 'mobile',
                    type: 'field',
                    placeholder: '请输入已绑定的手机号',
                    Disable: true
                  },
                  {
                    title: '验证码',
                    prop: 'code',
                    type: 'field',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'mobile',
                    disabled: false,
                    event: mobile => {
                      // 获取手机验证码
                      this.getMobileCode(mobile)
                    }
                  }
                ],
                btn: {
                  title: '下一步',
                  type: 'button',
                  event: item => {
                    this.editMobileNext(item)
                  }
                },
                footer: '绑定手机号主要用于密码找回及短信通知'
              }
              this.form = {
                mobile: data,
                code: ''
              }
            }
          })
          .catch(error => {})
    }
  }

  // 验证登录密码
  verificationPassword(obj, key) {
    // 先校验
    if (!this.checkFormForKey(this.form.pwd, 0, '请输入6-16位数字和字母组合的密码', /^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$/)) {
      return
    }
    this.loadingToggle()
    // 请求
    this.check = ''
    api
      .userPassword(obj)
      .then((res: any) => {
        this.loadingToggle()
        const { code, data, msg } = res
        if (code === 0) {
          this.beforeEditObj = { ...this.editObj }
          this.beforeForm = { ...this.form }
          this.check = data

          switch (key) {
            case 'mobile':
              this.editObj = {
                title: '绑定手机号码',
                cellGroup: [
                  {
                    title: '手机号',
                    prop: 'mobile',
                    type: 'field',
                    placeholder: '请输入您的手机号'
                  },
                  {
                    title: '验证码',
                    prop: 'code',
                    type: 'field',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'mobile',
                    disabled: false,
                    event: mobile => {
                      // 获取手机验证码
                      this.getMobileCode(mobile)
                    }
                  }
                ],
                btn: {
                  title: '绑定手机号',
                  type: 'button',
                  event: item => {
                    this.bindMobile(item)
                  }
                },
                footer: '绑定手机号主要用于密码找回及短信通知'
              }
              this.form = {
                mobile: '',
                code: ''
              }
              break
            case 'email':
              this.editObj = {
                title: '邮箱设置',
                cellGroup: [
                  {
                    title: '邮箱',
                    prop: 'email',
                    type: 'field',
                    placeholder: '请输入您的邮箱'
                  },
                  {
                    title: '验证码',
                    prop: 'code',
                    type: 'field',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'email',
                    disabled: false,
                    event: email => {
                      // 获取邮箱验证码
                      this.getEmailCode(email)
                    }
                  }
                ],
                btn: {
                  title: '绑定邮箱',
                  type: 'button',
                  event: item => {
                    this.bindEmail(item)
                  }
                },
                footer: '绑定邮箱主要用于密码找回及邮箱通知'
              }
              this.form = {
                email: '',
                code: ''
              }
              break
            case 'withdraw_password':
              this.dealWithdrawPwdForStatus()
          }
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {
        this.loadingToggle()
      })
  }
  // 获取手机验证码
  getMobileCode(mobile) {
    let params = {}
    //校验
    if (mobile.indexOf('*') === -1) {
      if (!this.checkFormForKey(mobile, 0, '请输入合理的手机号码', /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/)) {
        return
      } else {
        params['mobile'] = mobile
      }
    }
    this.editObj.cellGroup[1].disabled = true
    this.loadingToggle()

    // 请求
    api
      .getVcodeMobile(params)
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          this.$toast.success('验证码已发送')
          let time = 60
          this.editObj.cellGroup[1].button = time + this.codeText
          this.timer = setInterval(() => {
            time--
            if (time === 0) {
              this.clearTimer()
            } else {
              this.editObj.cellGroup[1].button = time + this.codeText
            }
          }, 1000)
        } else {
          this.editObj.cellGroup[1].disabled = false
          this.$toast.fail(msg)
        }
        this.loadingToggle()
      })
      .catch((error: any) => {
        this.editObj.cellGroup[1].disabled = false
        this.loadingToggle()
        this.$toast.fail('获取验证码失败，请稍后重试')
      })
  }
  // 绑定手机号码
  bindMobile(obj) {
    const { mobile, code } = obj
    const isOk1 = this.checkFormForKey(mobile, 0, '请输入合理的手机号码', /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/)
    const isOk2 = this.checkFormForKey(code, 1, '')
    if (!isOk1 || !isOk2) {
      return
    }
    this.loadingToggle()
    obj['check'] = this.check
    api
      .setUserMobile(obj)
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg } = res
        if (code === 0) {
          this.type = 'list'
          this.$toast.success('绑定手机号码成功')
          this.requestSecurity(true)

          this.clearTimer()
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {
        this.loadingToggle()
      })
  }
  // 先校验旧的手机号，再进行修改手机号操作
  editMobileNext(obj, key?: string) {
    const { code } = obj

    const isOk1 = this.checkFormForKey(code, 1, '')
    if (!isOk1) {
      return
    }

    this.loadingToggle()
    api
      .userVerificationMobile({ code })
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg, data } = res
        if (code === 0) {
          this.check = data
          switch (key) {
            case 'withdraw_password':
              this.dealWithdrawPwdForStatus()
              break
            default:
              this.beforeEditObj = { ...this.editObj }
              this.beforeForm = { ...this.form }

              this.clearTimer()

              this.editObj = {
                title: '修改手机号',
                cellGroup: [
                  {
                    title: '新手机号',
                    prop: 'mobile',
                    type: 'field',
                    placeholder: '请输入您的新手机号码'
                  },
                  {
                    title: '验证码',
                    prop: 'code',
                    type: 'field',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'mobile',
                    disabled: false,
                    event: mobile => {
                      // 获取手机验证码
                      this.getMobileCode(mobile)
                    }
                  }
                ],
                btn: {
                  title: '确定修改',
                  type: 'button',
                  event: item => {
                    this.editMobil(item)
                  }
                },
                footer: '绑定手机号主要用于密码找回及短信通知'
              }
              this.form = {
                mobile: '',
                code: ''
              }
          }
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {
        this.loadingToggle()
      })
  }
  editMobil(obj) {
    const { mobile, code } = obj
    const isOk1 = this.checkFormForKey(mobile, 0, '请输入合理的手机号码', /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/)
    const isOk2 = this.checkFormForKey(code, 1, '')
    if (!isOk1 || !isOk2) {
      return
    }
    obj.check = this.check
    this.loadingToggle()
    api
      .ediltUserMobile(obj)
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg } = res
        if (code === 0) {
          this.type = 'list'
          this.$toast.success('修改手机号码成功')
          this.requestSecurity(true)

          this.clearTimer()
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {
        this.loadingToggle()
        this.$toast.fail('修改手机号码失败')
      })
  }
  // *************
  // 邮箱
  email(obj) {
    const { status, key } = obj
    switch (status) {
      // 设置
      case '0':
        this.validLoginPWdEditObjAndForm('email', '邮箱设置')
        break
      // 修改
      case '1':
        this.editObj = {}
        this.form = {}
        this.loadingToggle()
        api
          .getEmail()
          .then((res: any) => {
            this.loadingToggle()

            const { data, code } = res
            if (code === 0) {
              this.editObj = {
                title: '修改邮箱',
                cellGroup: [
                  {
                    title: '旧邮箱',
                    prop: 'email',
                    type: 'field',
                    placeholder: '请输入已绑定的邮箱',
                    Disable: true
                  },
                  {
                    title: '验证码',
                    prop: 'code',
                    type: 'field',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'email',
                    disabled: false,
                    event: email => {
                      // 获取邮箱验证码
                      this.getEmailCode(email)
                    }
                  }
                ],
                btn: {
                  title: '下一步',
                  type: 'button',
                  event: item => {
                    this.editEmailNext(item)
                  }
                },
                footer: '绑定邮箱主要用于密码找回及邮箱通知'
              }
              this.form = {
                email: data,
                code: ''
              }
            }
          })
          .catch((error: any) => {})
    }
  }
  // 获取邮箱验证码
  getEmailCode(email) {
    let params = {}
    if (email.indexOf('*') === -1) {
      if (!this.checkFormForKey(email, 0, '请输入合理的邮箱地址', /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/)) {
        return
      } else {
        params['email'] = email
      }
    }
    this.editObj.cellGroup[1].disabled = true
    this.loadingToggle()
    api
      .getVcodeEmail(params)
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg } = res
        if (code === 0) {
          this.$toast.success('验证码已发送')
          let time = 60
          this.editObj.cellGroup[1].button = time + this.codeText
          this.timer = setInterval(() => {
            time--
            if (time === 0) {
              this.clearTimer()
            } else {
              this.editObj.cellGroup[1].button = time + this.codeText
            }
          }, 1000)
        } else {
          this.editObj.cellGroup[1].disabled = false
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {
        this.loadingToggle()
        this.editObj.cellGroup[1].disabled = false
        this.$toast.fail('发送邮箱验证失败，请稍后重试')
      })
  }
  // 邮箱绑定
  bindEmail(obj) {
    const { email, code } = obj
    const isOk1 = this.checkFormForKey(email, 0, '请输入合理的邮箱地址', /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/)
    const isOk2 = this.checkFormForKey(code, 1, '')
    if (!isOk1 || !isOk2) {
      return
    }
    this.loadingToggle()
    obj['check'] = this.check
    api
      .setUserEmail(obj)
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg } = res
        if (code === 0) {
          this.type = 'list'
          this.requestSecurity(true)
        } else {
          this.$toast.fail(msg)
        }

        this.clearTimer()
      })
      .catch((error: any) => {
        this.loadingToggle()
        this.$toast.fail('邮箱绑定失败，请稍后重试')
      })
  }
  editEmail(obj) {
    const { email, code } = obj
    const isOk1 = this.checkFormForKey(email, 0, '请输入合理的邮箱地址', /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/)
    const isOk2 = this.checkFormForKey(code, 1, '')
    if (!isOk1 || !isOk2) {
      return
    }
    this.loadingToggle()
    api
      .ediltUserEmail(obj)
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg } = res
        if (code === 0) {
          this.type = 'list'
          this.requestSecurity(true)
        } else {
          this.$toast.fail(msg)
        }

        this.clearTimer()
      })
      .catch((error: any) => {
        this.loadingToggle()
        this.$toast.fail('邮箱绑定失败，请稍后重试')
      })
  }
  // 先校验旧的邮箱，再进行修改邮箱操作
  editEmailNext(obj, key?: string) {
    const { code } = obj

    const isOk1 = this.checkFormForKey(code, 1, '')
    if (!isOk1) {
      return
    }
    api
      .userVerificationEmail({ code })
      .then((res: any) => {
        const { code, msg, data } = res
        if (code === 0) {
          this.check = data
          switch (key) {
            case 'withdraw_password':
              this.dealWithdrawPwdForStatus()
              break
            default:
              this.clearTimer()

              this.beforeEditObj = { ...this.editObj }
              this.beforeForm = { ...this.form }
              this.editObj = {
                title: '修改邮箱',
                cellGroup: [
                  {
                    title: '新邮箱',
                    prop: 'email',
                    type: 'field',
                    placeholder: '请输入您的新邮箱'
                  },
                  {
                    title: '验证码',
                    prop: 'code',
                    type: 'field',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'email',
                    disabled: false,
                    event: email => {
                      // 获取邮箱验证码
                      this.getEmailCode(email)
                    }
                  }
                ],
                btn: {
                  title: '绑定邮箱',
                  type: 'button',
                  event: item => {
                    this.editEmail({ ...item, check: data })
                  }
                },
                footer: '绑定邮箱主要用于密码找回及邮箱通知'
              }
              this.form = {
                email: '',
                code: ''
              }
          }
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {})
  }
  // ************
  // 修改登录密码
  password(obj) {
    this.editObj = {
      title: '修改登录密码',
      cellGroup: [
        {
          title: '旧密码',
          prop: 'old_pwd',
          type: 'field',
          password: true,
          placeholder: '请输入旧密码',
          icon: 'password-not-view',
          iconClick: item => {
            item.icon = item.icon === 'password-view' ? 'password-not-view' : 'password-view'
            item.password = item.icon === 'password-view' ? false : true
          }
        },
        {
          title: '新密码',
          prop: 'new_pwd',
          type: 'field',
          password: true,
          placeholder: '请输入新密码',
          icon: 'password-not-view',
          iconClick: item => {
            item.icon = item.icon === 'password-view' ? 'password-not-view' : 'password-view'
            item.password = item.icon === 'password-view' ? false : true
          }
        },
        {
          title: '确认新密码',
          prop: 'new_pwd_confirm',
          type: 'field',
          password: true,
          placeholder: '请输入新密码',
          icon: 'password-not-view',
          iconClick: item => {
            item.icon = item.icon === 'password-view' ? 'password-not-view' : 'password-view'
            item.password = item.icon === 'password-view' ? false : true
          }
        }
      ],
      btn: {
        title: '确定修改',
        type: 'button',
        event: item => {
          this.bindPassword(item)
        }
      }
    }
    this.form = {
      old_pwd: '',
      new_pwd: '',
      new_pwd_confirm: ''
    }
  }
  // 设置修改登录密码的
  bindPassword(obj) {
    // 校验
    const { old_pwd, new_pwd, new_pwd_confirm } = obj
    const isOk1 = this.checkFormForKey(old_pwd, 0, '请输入6-16位数字或字母的密码', /^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$/)
    const isOk2 = this.checkFormForKey(new_pwd, 1, '请输入6-16位数字或字母的密码', /^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$/)
    const isOk3 = this.checkForNewPwd(new_pwd_confirm, new_pwd, '两次输入的密码不一样，请重新输入', 2)
    if (!isOk1 || !isOk2 || !isOk3) {
      return
    }
    const tempObj = {
      old_pwd,
      new_pwd,
      device: 2 //0unknow,1pc,2mobile
    }
    this.loadingToggle()
    // 修改
    api
      .setUserPassword(tempObj)
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg } = res
        if (code === 0) {
          //修改成功后执行退出逻辑
          this.$dialog
            .alert({
              message: '修改登录密码成功'
            })
            .then(() => {
              this.logout()
            })
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {
        this.loadingToggle()
        this.$dialog.alert({
          message: '修改登录密码失败，请稍后重试'
        })
      })
  }
  // 退出
  logout() {
    this.loadingToggle()
    api
      .logout()
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg } = res
        if (code === 0) {
          this.$store.commit('user/updateToken')
          this.$store.commit('user/updateMessage')
          this.$toast.success('退出成功')
          window.location.href = '/my/login'
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {
        this.loadingToggle()
        this.$toast.fail('退出失败，请稍后重试')
      })
  }

  // *************
  // 提现密码
  withdrawPwd(obj) {
    const { status } = obj
    switch (status) {
      case '0':
        this.onTabs('登录密码')
        this.editObj.tabs = this.returnTabs()
        break
      case '1':
        this.editObj = {
          title: '修改提现密码',
          cellGroup: [
            {
              title: '旧提现密码',
              prop: 'old_pwd',
              type: 'field',
              password: true,
              placeholder: '请输入旧提现密码',
              icon: 'password-not-view',
              iconClick: item => {
                item.icon = item.icon === 'password-view' ? 'password-not-view' : 'password-view'
                item.password = item.icon === 'password-view' ? false : true
              }
            },
            {
              title: '新提现密码',
              prop: 'new_pwd',
              type: 'field',
              password: true,
              placeholder: '请输入新提现密码',
              icon: 'password-not-view',
              iconClick: item => {
                item.icon = item.icon === 'password-view' ? 'password-not-view' : 'password-view'
                item.password = item.icon === 'password-view' ? false : true
              }
            },
            {
              title: '确认新密码',
              prop: 'new_pwd_confirm',
              password: true,
              type: 'field',
              placeholder: '请输入新密码',
              icon: 'password-not-view',
              iconClick: item => {
                item.icon = item.icon === 'password-view' ? 'password-not-view' : 'password-view'
                item.password = item.icon === 'password-view' ? false : true
              }
            }
          ],
          btn: {
            title: '确定修改',
            type: 'button',
            event: item => {
              const { old_pwd, new_pwd, new_pwd_confirm } = item
              const isOk1 = this.checkFormForKey(old_pwd, 0, '请输入4位数字密码', /^[0-9]{4}$/)
              const isOk2 = this.checkFormForKey(new_pwd, 1, '请输入4位数字密码', /^[0-9]{4}$/)
              const isOk3 = this.checkForNewPwd(new_pwd_confirm, new_pwd, '两次输入的密码不一样，请重新输入', 2)
              if (!isOk1 || !isOk2 || !isOk3) {
                return
              }
              this.editWithdrawPwd({ old_pwd, new_pwd })
            }
          }
        }
        this.form = {
          old_pwd: '',
          new_pwd: '',
          new_pwd_confirm: ''
        }
    }
  }
  // 提现密码的三种校验方式
  onTabs(title) {
    this.clearTimer()

    switch (title) {
      case '登录密码':
        this.validLoginPWdEditObjAndForm('withdraw_password', '设置提现密码')
        this.editObj.tabs = this.returnTabs()
        break
      case '手机身份验证':
        this.loadingToggle()
        api
          .getMobile()
          .then((res: any) => {
            this.loadingToggle()
            const { data, code } = res
            if (code === 0) {
              if (!data) {
                this.onTabs('登录密码')
                this.editObj.tabs = this.returnTabs()
                this.$toast.fail('该用户没有绑定手机号码，请选择其他验证方式')
              }
              const tempBoolean = data ? false : true
              this.$set(this.editObj, 'cellGroup', [
                {
                  title: '手机号',
                  prop: 'mobile',
                  type: 'field',
                  placeholder: '请输入您绑定的手机号',
                  Disable: true
                },
                {
                  title: '验证码',
                  prop: 'code',
                  type: 'field',
                  placeholder: '请输入验证码',
                  // 右侧按钮问题
                  button: '获取验证码',
                  buttonProp: 'mobile',
                  disabled: tempBoolean,
                  event: mobile => {
                    // 获取手机验证码
                    this.getMobileCode(mobile)
                  }
                }
              ])
              this.$set(this.editObj, 'btn', {
                title: '下一步',
                type: 'button',
                disabled: tempBoolean,
                event: item => {
                  this.editMobileNext(item, 'withdraw_password')
                }
              })
              this.$set(this.editObj, 'footer', '如果您的手机号或邮箱没有进行绑定，将无法进行密码修改，您可以进行绑定操作或者联系在线客服。')
              this.form = {
                mobile: data || '您未绑定手机号码',
                code: ''
              }
            }
          })
          .catch((error: any) => {
            this.loadingToggle()
          })

        break
      case '邮箱身份验证':
        this.loadingToggle()

        api
          .getEmail()
          .then((res: any) => {
            this.loadingToggle()
            const { data, code } = res
            if (code === 0) {
              if (!data) {
                this.onTabs('登录密码')
                this.editObj.tabs = this.returnTabs()
                this.$toast.fail('该用户没有绑定邮箱，请选择其他验证方式')
              }
              const tempBoolean = data ? false : true
              this.$set(this.editObj, 'cellGroup', [
                {
                  title: '邮箱',
                  prop: 'email',
                  type: 'field',
                  placeholder: '请输入您绑定的邮箱',
                  Disable: true
                },
                {
                  title: '验证码',
                  prop: 'code',
                  type: 'field',
                  placeholder: '请输入验证码',
                  // 右侧按钮问题
                  button: '获取验证码',
                  buttonProp: 'email',
                  disabled: tempBoolean,
                  event: email => {
                    // 获取邮箱验证码
                    this.getEmailCode(email)
                  }
                }
              ])
              this.$set(this.editObj, 'btn', {
                title: '下一步',
                type: 'button',
                disabled: tempBoolean,
                event: item => {
                  this.editEmailNext(item, 'withdraw_password')
                }
              })
              this.$set(this.editObj, 'footer', '如果您的手机号或邮箱没有进行绑定，将无法进行密码修改，您可以进行绑定操作或者联系在线客服。')
              this.form = {
                email: data || '您未绑定邮箱',
                code: ''
              }
            }
          })
          .catch((error: any) => {
            this.loadingToggle()
          })
    }
  }
  // 提现密码的三种校验方式
  returnTabs() {
    return [
      {
        title: '登录密码'
      },
      {
        title: '手机身份验证'
      },
      {
        title: '邮箱身份验证'
      }
    ]
  }
  // 提现密码的分设置
  dealWithdrawPwdForStatus() {
    this.clearTimer()

    this.type = 'list'
    this.$set(this.passpop, 'isShow', true)
  }

  // 设置提现密码
  bindWithdrawPwd(pwd, fn?: any) {
    this.loadingToggle()
    api
      .setUserWithdrawpwd({ pwd, check: this.check })
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg } = res
        if (code === 0) {
          this.$toast.success('设置提现密码成功')
          this.requestSecurity(true)
          if (fn) {
            fn()
          }
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {
        this.loadingToggle()
        this.$toast.fail('设置提现密码失败，请稍后重试')
      })
  }

  // 编辑提现密码
  editWithdrawPwd(obj) {
    this.loadingToggle()
    api
      .editUserWithdrawpwd(obj)
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg } = res
        if (code === 0) {
          this.$toast.success('修改提现密码成功')
          this.requestSecurity(true)
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {
        this.loadingToggle()
        this.$toast.fail('修改提现密码失败，请稍后重试')
      })
  }

  // 验证登录密码的editObj和form的设置
  validLoginPWdEditObjAndForm(key, title) {
    this.editObj = {
      title,
      cellGroup: [
        {
          title: '登录密码',
          prop: 'pwd',
          type: 'field',
          password: true,
          placeholder: '请输入您的登录密码',
          errorMes: '',
          icon: 'password-not-view',
          iconClick: item => {
            item.icon = item.icon === 'password-view' ? 'password-not-view' : 'password-view'
            item.password = item.icon === 'password-view' ? false : true
          }
        }
      ],
      btn: {
        title: '确定',
        type: 'button',
        event: item => {
          this.verificationPassword(item, key)
        }
      },
      footer: '输入登录密码验证身份'
    }
    this.form = {
      pwd: ''
    }
  }
}
</script>
