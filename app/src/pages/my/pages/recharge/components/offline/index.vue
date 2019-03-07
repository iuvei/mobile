<template lang="pug" src="./index.pug"></template>

<style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Collapse, CollapseItem, CellGroup, Cell, Switch, Toast, Field, Popup, Picker } from 'vant'
import BScroll from 'better-scroll'
import VueClipboard from 'vue-clipboard2'
import api from '@/api'
import { setTimeout, clearTimeout } from 'timers'

Vue.use(VueClipboard)

@Component({
  components: {
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [CellGroup.name]: CellGroup,
    [Cell.name]: Cell,
    [Switch.name]: Switch,
    [Field.name]: Field,
    [Popup.name]: Popup,
    [Picker.name]: Picker
  }
})
export default class RechargeOffline extends Vue {
  @Prop(Object) data: any
  @Prop(Boolean) disabled!: boolean

  formData: FormData = {
    type: 1,
    money: '',
    receive_bank_id: '',
    pay_name: '',
    remark: '',
    active_id: '0',
    active_money: 0,
    active_type: 0,
    active_prize: 0,
    upper_limit: 0
  }
  accounts: any[] = []
  accountIndex: number = 0
  minDepositMoney: number = 10
  maxDepositMoney: number = 1000
  discountActiveShow: string = '1'
  discountActives: any[] = [] /** 优惠活动 */
  reapProfit: number = 0
  isSelectBank: boolean = false
  decimal: number = 0
  decimalTimer: any = null
  nextStep: boolean = false
  mounted() {
    this.accounts = (this.data.receive_bank || []).map(v => ({ ...v, bank_label: `${v.bank_name}(${v.card.slice(-4)})` }))
    this.accountIndexChange()
    this.discountActives = (this.data.active || []).filter(v => v.id != '0')
    this.discountActives.length && this.selectDiscountActive(this.discountActives[0])
  }
  get isQrcode() {
    const { bank_id } = this.accounts[this.accountIndex]
    return bank_id == 100 || bank_id == 101 || bank_id == 103 || bank_id == 145
  }
  get resultQrcode() {
    const obj = this.accounts[this.accountIndex]
    return (obj && obj.qrcode) || ''
  }
  @Watch('accountIndex')
  accountIndexChange() {
    if (this.accounts[this.accountIndex]) {
      const { once_min_limit, once_max_limit, id } = this.accounts[this.accountIndex]
      this.formData.receive_bank_id = id
      this.minDepositMoney = once_min_limit
      this.maxDepositMoney = once_max_limit
    }
  }
  inputMoney() {
    // 控制输入的长度
    const { money } = this.formData
    if (!/^[+]?(0|([1-9]\d*))(\.\d+)?$|^[0-9]\d*(\.|[0-9])$/g.test(money)) {
      this.formData.money = money.replace(/\D/g, '')
    }
    const isDote = /\./.test(money)
    const tempLen = money.length
    if (!isDote && tempLen > 9) {
      this.formData.money = money.slice(0, 9)
    } else if (isDote && tempLen > 12) {
      this.formData.money = money.slice(0, 12)
    }
    /** 输入充值金额 */
    if (this.formData.money && !/\./.test(this.formData.money)) {
      clearTimeout(this.decimalTimer)
      this.decimalTimer = setTimeout(() => this.getDecimal(this.formData.money), 300)
    } else {
      clearTimeout(this.decimalTimer)
      this.decimal = 0
      if (!/^([1-9]\d*|0)(\.\d{1,2})?$/.test(money)) {
        this.formData.money = this.formData.money.substring(0, money.indexOf('.') + 3)
      }

      this.updateDiscount()
    }
  }
  getDecimal(money) {
    api
      .getBankWalletOfflineMoney({ money })
      .then((res: any) => {
        if (res.code === 0) this.decimal = Number(res.data)
        this.updateDiscount()
      })
      .catch(err => this.updateDiscount())
  }
  updateDiscount() {
    /** 更新获得优惠 */
    const { active_id } = this.formData
    let money = Number(this.formData.money) + this.decimal
    if (active_id !== '0') {
      api
        .getBankWalletCoupon({
          type: 1,
          active_id,
          money
        })
        .then((res: any) => {
          if (res.code === 0) {
            this.reapProfit = Number(res.data.coupon_amount)
          } else {
            this.reapProfit = 0
          }
        })
    } else {
      this.reapProfit = 0
    }
  }
  selectDiscountActive(item) {
    /** 选择优惠 */
    const { active_id } = this.formData
    if (active_id === item.id) {
      this.formData = {
        ...this.formData,
        active_id: '0',
        active_money: 0,
        active_type: 0,
        active_prize: 0,
        upper_limit: 0
      }
    } else {
      this.formData = {
        ...this.formData,
        active_id: item.id,
        active_money: item.rule[0].money,
        active_type: item.rule[0].type,
        active_prize: item.rule[0].prize,
        upper_limit: item.rule[0].upper_limit
      }
    }
    this.updateDiscount()
  }
  toNextStep() {
    if (!this.accounts[this.accountIndex]) {
      Toast.fail('请选择收款账号！')
    } else if (!this.formData.money) {
      Toast.fail('请输入充值金额！')
    } else if (Number(this.formData.money) + this.decimal < this.minDepositMoney || Number(this.formData.money) + this.decimal > this.maxDepositMoney) {
      Toast.fail(`充值金额最低${this.minDepositMoney}元，最高${this.maxDepositMoney}元！`)
    } else if (this.formData.pay_name === '') {
      Toast.fail('请输入存款人！')
    } else if (this.formData.pay_name.length > 20) {
      Toast.fail('存款人不能超过20个字符！')
    } else if (this.formData.remark && this.formData.remark.length > 100) {
      Toast.fail('存款说明不能超过100个字符！')
    } else {
      this.nextStep = true
    }
  }
  submit() {
    const data = {
      ...this.formData
    }
    data.money = (parseFloat(data.money) + this.decimal).toFixed(2)
    if (this.formData.active_id === '0') {
      const keys = ['active_money', 'active_type', 'active_prize', 'upper_limit']
      keys.map(key => {
        data.hasOwnProperty(key) && delete data[key]
      })
    }
    this.$emit('sumbit', { data, type: 'offline', cb: this.submitCallback })
  }
  submitCallback() {
    this.nextStep = false
    this.reapProfit = 0
    this.decimal = 0
    this.formData.money = ''
    this.formData.pay_name = ''
    this.formData.remark = ''
  }
  onCopySuccess(e) {
    Toast.success(e.text)
  }
  onCopyError(e) {
    Toast.fail(e.text)
  }
  get selectAccountName() {
    return this.accounts[this.accountIndex] ? this.accounts[this.accountIndex].bank_label : ''
  }
  selectBank() {
    this.isSelectBank = !this.isSelectBank
  }
  selectBankConfirm(value, index) {
    this.accountIndex = index
    this.selectBank()
  }
  selectBankCancel() {
    this.selectBank()
  }
}
interface FormData {
  type: number
  money: string
  receive_bank_id: string
  pay_name: string
  remark: string
  active_id: string
  active_money: number
  active_type: number
  active_prize: number
  upper_limit: number
}
</script>
