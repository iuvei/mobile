<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import _ from 'lodash'
import { NavBar, Field, CellGroup, Popup, Picker, NumberKeyboard, Button } from 'vant'
import api from '@/api/index.ts'
import { Mutation, State } from 'vuex-class'

@Component({
  name: 'add-bank-card',
  components: {
    [NavBar.name]: NavBar,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Popup.name]: Popup,
    [Picker.name]: Picker,
    [NumberKeyboard.name]: NumberKeyboard,
    [Button.name]: Button
  }
})
export default class AddBankCard extends Vue {
  @State isLoading
  @Mutation loadingToggle
  title: string = '添加银行卡'
  formData: FormData = {
    card: '',
    bank_id: '',
    address: '',
    name: '',
    withdraw_password: ''
  }
  nameReadonly: boolean = false
  errorInfo: ErrorInfo = {
    name: { state: false, msg: '' },
    card: { state: false, msg: '' },
    bank_id: { state: false, msg: '' },
    address: { state: false, msg: '' },
    withdraw_password: { state: false, msg: '' }
  }
  showBankList: boolean = false
  bankList: any[] = []
  prompt: string[] = ['银行卡用户必须与持卡人姓名一致', '尚未实名认证的客户，首次录入持卡人的姓名将同步至真实姓名，真实姓名提交后不可修改，请谨慎操作。']
  showKeyboard: boolean = false
  mounted() {
    /** 判断是否设置了提现密码，否则跳到提现密码页 */
    api
      .userSafety()
      .then((res: any) => {
        if (res.code === 0) {
          if (res.data && res.data.withdraw_password && res.data.withdraw_password.status == 1) {
            this.init()
          } else {
            this.$router.push({ path: '/my/security' })
          }
        }
      })
      .catch(err => {
        this.$error(err)
      })
  }
  goback() {
    this.$router.go(-1)
  }
  init() {
    api
      .getUserRealname()
      .then((res: any) => {
        if (res.code === 0) {
          this.formData.name = res.data || ''
          this.nameReadonly = !!this.formData.name
        }
      })
      .catch(err => {
        this.$error(err)
      })
    api
      .getProfileBanks()
      .then((res: any) => {
        if (res.code === 0) {
          this.bankList = (res.data || []).filter(v => v.is_online != 1)
        }
      })
      .catch(err => {
        this.$error(err)
      })
  }
  selectBank() {
    this.showBankList = !this.showBankList
  }
  getBankName(value) {
    const bank = this.bankList.find(v => v.id === value)
    return bank ? bank.name : value
  }
  selectBankConfirm(value, index) {
    this.formData.bank_id = value.id
    this.selectBank()
    this.checkItem('bank_id')
  }
  selectBankCancel() {
    this.selectBank()
    this.checkItem('bank_id')
  }
  keyboardInput(value) {
    if (this.formData.withdraw_password.length < 4) {
      this.formData.withdraw_password = [this.formData.withdraw_password, value].join('')
    }
  }
  keyboardDelete() {
    if (this.formData.withdraw_password.length > 0) {
      this.formData.withdraw_password = this.formData.withdraw_password.slice(0, -1)
    }
  }
  @Watch('showKeyboard')
  keyboardClose(newVal, oldVal) {
    !newVal && this.checkItem('withdraw_password')
  }
  submit() {
    if (this.isLoading) return false
    Object.keys(this.errorInfo).map(key => {
      this.checkItem(key)
    })
    const canSubmit = !_.toPairs(this.errorInfo)
      .map(([key, val]) => val)
      .some(v => v.state || !!v.msg)
    if (canSubmit) {
      this.loadingToggle()
      api
        .postProfileBank(this.formData)
        .then((res: any) => {
          if (res.code === 0) {
            this.$dialog.alert({ message: '添加成功！' }).then(v => {
              this.goback()
            })
          } else {
            this.$dialog.alert({ message: res.msg })
          }
          this.loadingToggle()
        })
        .catch(err => {
          this.$error(err)
          this.loadingToggle()
        })
    }
  }
  checkEmpty(key: string) {
    return !this.formData[key]
  }
  checkLength(key: string, min: number, max: number) {
    if (this.formData[key].length < min) {
      return `最少应输入${min}个字符！`
    } else if (this.formData[key].length > max) {
      return `最多输入${max}个字符！`
    } else {
      return ''
    }
  }
  checkCnLength(key: string, min: number, max: number) {
    return new RegExp(`^[\u4E00-\u9FA5]{${min},${max}}$`).test(this.formData[key]) ? '' : `请输入${min}-${max}个汉字`
  }
  checkItem(key) {
    let state = false,
      msg = ''
    switch (key) {
      case 'name':
        if (!this.nameReadonly) {
          state = this.checkEmpty(key)
          state ? (msg = '请输入真实姓名！') : (msg = this.checkCnLength(key, 2, 10))
        }
        break
      case 'card':
        state = this.checkEmpty(key)
        if (state) {
          msg = '请输入银行卡号！'
        } else if (!/^[0-9]{16,19}$/.test(this.formData[key])) {
          msg = '请输入16-19位数字！'
        } else {
          msg = ''
        }
        break
      case 'bank_id':
        state = this.checkEmpty(key)
        state && (msg = '请选择银行！')
        break
      case 'address':
        state = this.checkEmpty(key)
        state ? (msg = '请输入开户行！') : (msg = this.checkCnLength(key, 1, 50))
        break
      case 'withdraw_password':
        state = this.checkEmpty(key)
        state ? (msg = '请输入提现密码！') : (msg = this.checkLength(key, 4, 4))
        break
    }
    this.$set(this.errorInfo, key, { state, msg })
  }
}
interface FormData {
  card: string
  bank_id: string | number
  address: string
  name: string
  withdraw_password: string
}
interface ErrorInfo {
  [key: string]: {
    state: boolean
    msg: string
  }
}
</script>
