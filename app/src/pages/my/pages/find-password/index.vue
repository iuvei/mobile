<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import Edit from './../security/components/edit/index.vue'
import api from '@/api'
import { Mutation } from 'vuex-class'

@Component({
  components: {
    Edit
  }
})
export default class FindPassword extends Vue {
  @Mutation loadingToggle
  /*************data***********/
  //编辑的参数对象
  editObj: any = {}

  // 前一次的编辑参数对象
  beforeEditObj: any = {}

  //提交表单对象
  form: any = {}
  beforeForm: any = {}

  // 列表的文字提示
  codeText: string = '秒后重新获取'

  // 手机号和邮箱
  mobile: string = ''
  email: string = ''

  // 获取邮箱/手机验证码的定时器
  timer: any = null

  //
  check: string = ''

  // 用户的标识
  id: number = 0

  //
  isReturn: number = 0

  /*************@Watch***********/

  // 账号
  @Watch('form.data')
  onFormUsernameChanged(newVal, oldVal) {
    if (newVal) {
      this.checkFormForKey(newVal, 0, '')
    }
  }

  // 验证码
  @Watch('form.code')
  onFormValueChanged(newVal, oldVal) {
    if (newVal) {
      this.checkFormForKey(newVal, 1, '')
    }
  }

  // 密码
  @Watch('form.password')
  onFormPasswordChanged(newVal, oldVal) {
    if (newVal) {
      this.checkFormForKey(newVal, 0, '请输入6-16位数字或字母的密码', /^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$/)
    }
  }

  // 校验确认新密密和新密是否一样
  @Watch('form.pasword_confirm')
  onFormPaswordConfirmChanged(newVal, oldVal) {
    if (newVal) {
      this.checkForNewPwd(newVal, this.form.password, '两次输入的密码不一样，请重新输入', 1)
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
    this.editObj = {
      title: `忘记密码`,
      cellGroup: [
        {
          title: '账号',
          prop: 'data',
          type: 'field',
          placeholder: `用户名\\手机\\邮箱登录`
        }
      ],
      btn: {
        title: '下一步',
        type: 'button',
        event: item => {
          this.checkUsername(item)
        }
      },
      footer: '如果您的手机号或邮箱没有进行绑定，将无法进行密码修改，您可以进行绑定操作或者联系在线客服。'
    }
    this.form = {
      data: ''
    }
  }
  /*************methods***********/
  returnToList() {
    this.clearTimerFun()

    if (JSON.stringify(this.beforeEditObj) !== '{}') {
      this.editObj = { ...this.beforeEditObj }
      this.form = { ...this.beforeForm }
      this.beforeEditObj = {}
      this.beforeForm = {}
    } else {
      this.editObj = {
        title: `忘记密码`,
        cellGroup: [
          {
            title: '账号',
            prop: 'data',
            type: 'field',
            placeholder: `用户名\\手机\\邮箱登录`
          }
        ],
        btn: {
          title: '下一步',
          type: 'button',
          event: item => {
            this.checkUsername(item)
          }
        },
        footer: '如果您的手机号或邮箱没有进行绑定，将无法进行密码修改，您可以进行绑定操作或者联系在线客服。'
      }
      this.form = {
        data: ''
      }
      this.isReturn++
    }
    if (this.isReturn === 1) {
      this.$router.go(-1)
    }
  }
  checkUsername(obj) {
    // 判断该账号是否绑定了手机或者邮箱
    if (!this.checkFormForKey(obj.data, 0, '')) {
      return
    }
    this.loadingToggle()
    api
      .getUserResetpwd(obj)
      .then((res: any) => {
        this.loadingToggle()
        const { code, data, msg } = res
        if (code === 0) {
          const { mobile, email, id } = data
          this.mobile = mobile
          this.email = email
          this.id = id
          this.onTabs('手机身份验证')
          this.isReturn--
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch(error => {
        this.loadingToggle()
      })
  }
  onTabs(title) {
    if (JSON.stringify(this.beforeEditObj) !== '{}' && JSON.stringify(this.beforeForm) !== '{}') {
      this.beforeEditObj = { ...this.editObj }
      this.beforeForm = { ...this.form }
    }
    this.clearTimerFun()
    switch (title) {
      case '手机身份验证':
        this.editObj = {
          title: `修改登录密码`,
          cellGroup: [
            {
              title: '手机号',
              prop: 'mobile',
              type: 'field',
              placeholder: '该用户未绑定手机\\邮箱，请联系客服',
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
                this.getMobileCode()
              }
            }
          ],
          btn: {
            title: '下一步',
            type: 'button',
            event: item => {
              this.changeNewPassword(item)
            }
          },
          footer: '如果您的手机号或邮箱没有进行绑定，将无法进行密码修改，您可以进行绑定操作或者联系在线客服。',
          tabs: [
            {
              title: '手机身份验证'
            },
            {
              title: '邮箱身份验证'
            }
          ]
        }
        this.form = {
          code: '',
          mobile: this.mobile
        }
        break
      case '邮箱身份验证':
        this.$set(this.editObj, 'cellGroup', [
          {
            title: '邮箱',
            prop: 'email',
            type: 'field',
            placeholder: '该用户未绑定手机\\邮箱，请联系客服',
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
              this.getEmailCode()
            }
          }
        ])
        this.$set(this.editObj, 'btn', {
          title: '下一步',
          type: 'button',
          event: item => {
            this.changeNewPassword(item)
          }
        })
        this.$set(this.editObj, 'footer', '如果您的手机号或邮箱没有进行绑定，将无法进行密码修改，您可以进行绑定操作或者联系在线客服。')
        this.form = {
          code: '',
          email: this.email
        }
    }
  }

  // 获取手机验证码
  getMobileCode() {
    // 请求
    api
      .getVcodeMobile({ id: this.id })
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          this.$toast.success('验证码已发送')
          let time = 60
          this.clearTimerFun()
          this.editObj.cellGroup[1].button = time + this.codeText
          this.editObj.cellGroup[1].disabled = true
          this.timer = setInterval(() => {
            time--
            if (time === 0) {
              this.clearTimerFun()
            } else {
              this.editObj.cellGroup[1].button = time + this.codeText
            }
          }, 1000)
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {})
  }

  // 获取邮箱验证码
  getEmailCode() {
    api
      .getVcodeEmail({ id: this.id })
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          this.$toast.success('验证码已发送')
          let time = 60
          this.clearTimerFun()
          this.editObj.cellGroup[1].button = time + this.codeText
          this.editObj.cellGroup[1].disabled = true
          this.timer = setInterval(() => {
            time--
            if (time === 0) {
              this.clearTimerFun()
            } else {
              this.editObj.cellGroup[1].button = time + this.codeText
            }
          }, 1000)
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {})
  }

  // 下一步修改密码
  changeNewPassword(obj) {
    //
    const { mobile, code, email } = obj

    // 校验
    let isOk1 = true
    isOk1 = this.checkFormForKey(code, 1, '')
    if (!isOk1) {
      return
    }
    const temp = obj.hasOwnProperty('mobile') ? 'userVerificationMobile' : 'userVerificationEmail'
    obj.id = this.id
    api[temp]({ code, id: this.id })
      .then((res: any) => {
        const { code, msg, data } = res
        if (code === 0) {
          this.check = data
          clearInterval(this.timer)
          this.beforeEditObj = { ...this.editObj }
          this.beforeForm = { ...this.form }
          this.editObj = {
            title: `设置登录密码`,
            cellGroup: [
              {
                title: '新密码',
                prop: 'password',
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
                prop: 'password_confirm',
                type: 'field',
                password: true,
                placeholder: '请输入确认新密码',
                icon: 'password-not-view',
                iconClick: item => {
                  item.icon = item.icon === 'password-view' ? 'password-not-view' : 'password-view'
                  item.password = item.icon === 'password-view' ? false : true
                }
              }
            ],
            btn: {
              title: '确认',
              type: 'button',
              event: item => {
                const { password, password_confirm } = item
                const isOk1 = this.checkFormForKey(password, 0, '请输入6-16位数字或字母的密码', /^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$/)
                const isOk2 = this.checkForNewPwd(password_confirm, this.form.password, '两次输入的密码不一样，请重新输入', 1)
                if (!isOk1 || !isOk2) {
                  return
                }
                this.getNewPassword(item)
              }
            }
          }
          this.form = {
            password: '',
            pasword_confirm: ''
          }
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {})
  }

  // 修改新密码的请求
  getNewPassword(obj) {
    const params = {
      check: this.check,
      new_pwd: obj.password,
      id: this.id
    }
    this.loadingToggle()
    api
      .setUserPassword(params)
      .then((res: any) => {
        this.loadingToggle()
        const { code, msg } = res
        if (code === 0) {
          this.$toast.success('修改登录密码成功！')
          this.$router.push({ path: '/my/login' })
        } else {
          this.$toast.fail(msg)
        }
      })
      .catch((error: any) => {
        this.loadingToggle()
      })
  }
  clearTimerFun() {
    if (this.timer) {
      if (this.editObj && this.editObj.cellGroup[1] && this.editObj.cellGroup[1].disabled) {
        this.editObj.cellGroup[1].button = '获取验证码'
        this.editObj.cellGroup[1].disabled = false
        this.form.code = ''
      }
      clearInterval(this.timer)
    }
  }
}
</script>
