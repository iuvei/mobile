<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'
import { NavBar, Cell, CellGroup, Field, Actionsheet, Picker, Icon, Button, Collapse, CollapseItem, Toast } from 'vant'
import api from '@/api'
import BScroll from 'better-scroll'
import Passpop from '@/components/passpop/index.vue'

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Field.name]: Field,
    [Actionsheet.name]: Actionsheet,
    [Picker.name]: Picker,
    [Icon.name]: Icon,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [Button.name]: Button,
    Passpop
  }
})
export default class Withdrawal extends Vue {
  @Mutation loadingToggle

  nextStepShow: boolean = false // 预申请的下一步页面

  bank: string = '' //提现银行
  bankId: number = 0 //提现银行ID
  bankLogo: string = '' //提现银行logo
  bankColumns: any = [] //所有提现银行
  amount: any = null //输入的提现金额
  minAmount: number = 0 //最小可提现余额
  maxAmount: number = 0 //最大可提现余额
  totalAmount: number = 0 //可提现余额
  noFeeTimes: number = 0 //剩余免手续费次数
  withdrawPwd: string = '' //提现密码
  errorMsg: string = '' //提现密码的错误信息

  actionsheetShow: boolean = false // 下拉弹框

  administrativeFee: number = 0 // 行政费
  procedureFee: number = 0 //手续费
  couponFee: number = 0 // 扣除存款优惠
  result: number = 0 // 稽核结果
  applyTime: any = '' //预申请时间

  collapseName: string[] = ['1'] // 折叠面板
  visibleDetail: boolean = false // 稽核详情的显示隐藏状态
  arrowDirection: string = 'down' // 稽核详情箭头方向
  auditList: any = [] //稽核详情列表
  disabled: boolean = false
  effecBetDetail: boolean = false // 是否显示有效投注详情
  betdetail: any = [] //稽核详情列表

  // 设置提现密码弹框的设置
  passpop: any = {
    title: '提现密码',
    number: 4, //限制输入密码个数
    isShow: false, //是否显示密码输入框
    callback: (password, fn) => {
      fn()
      this.getWithdrawPwd(password)
    },
    item: null
  }

  $refs!: {
    container: Element
  }
  created() {}

  activated() {
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
    this.getWithdrawData()
    this.getDisabled()
  }

  /*
   * 获取-提现的数据
   */
  getWithdrawData() {
    this.loadingToggle()
    api
      .getBankWalletWithdraw()
      .then((res: any) => {
        if (res.code == 0) {
          if (res.data && res.data.bank_list && res.data.bank_list.length == 0) {
            this.$dialog
              .confirm({
                message: '请先绑定银行卡'
              })
              .then(() => {
                this.$router.push('/my/bank-card')
              })
              .catch(() => {
                this.$router.go(-1)
              })
          } else if (res.data && res.data.bank_list && !res.data.check_withdraw) {
            this.$dialog
              .alert({
                message: '没有绑定手机/邮箱或不在提现时间范围'
              })
              .then(() => {
                this.$router.go(-1)
              })
          } else {
            this.totalAmount = Number(res.data.balance)
            this.minAmount = Number(res.data.min)
            this.maxAmount = Number(res.data.max)
            this.noFeeTimes = res.data.no_fee_time
            this.bankColumns = res.data.bank_list.map(item => {
              item.name2 = item.name + '(' + item.card_number + ')'
              return item
            })
            this.bank = res.data.bank_list[0].name + '(' + res.data.bank_list[0].card_number + ')'
            this.bankId = res.data.bank_list[0].id
            this.bankLogo = res.data.bank_list[0].h5_logo
          }
        } else {
          Toast.fail(res.msg)
        }
        this.loadingToggle()
      })
      .catch(error => {
        this.loadingToggle()
      })
  }

  /*
   * 选择-提现银行/取消
   */
  onConfirmBank(value, index) {
    this.bank = value.name + '(' + value.card_number + ')'
    this.bankId = value.id
    this.actionsheetShow = false
  }

  /*
   * 点击-全部提现按钮
   */
  onClickFullAmount() {
    this.amount = Math.floor(this.totalAmount + 0.111)
  }

  /*
   * 提现预申请页面不支持小数点，做下限制
   */
  inputAmount() {
    if (!/^\d+$/.test(this.amount)) {
      this.amount = this.amount.split(/\D+/)[0]
    }
  }

  /*
   * 校验-预申请
   */
  checkPreApplication() {
    if (this.amount == null) {
      Toast.fail('请输入提现金额')
      return true
    } else if (this.amount > this.maxAmount || this.amount < this.minAmount) {
      Toast.fail('提现范围为' + this.minAmount + '~' + this.maxAmount + '元')
      return true
    } else if (this.amount > this.totalAmount) {
      Toast.fail('可提现余额不足')
      return true
    } else if (this.withdrawPwd == '') {
      Toast.fail('请输入提现密码')
      return true
    }
  }
  /*
   * 点击-预申请
   */
  preApplication() {
    if (this.checkPreApplication()) {
      return false
    }
    this.loadingToggle()
    let params = {
      money: this.amount,
      password: this.withdrawPwd
    }
    api
      .getPreApplication(params)
      .then((res: any) => {
        if (res.code == 0) {
          this.administrativeFee = Number(res.data.admin_fee) // 行政费
          this.procedureFee = Number(res.data.fee) //手续费
          this.couponFee = Number(res.data.coupon_fee) //优惠扣除
          this.result = res.data.result // 1-稽核通过 0 -不通过
          this.auditList = res.data.list.map(item => {
            item.showEffec = false
            return item
          }) // 稽核详情列表
          this.applyTime = res.data.apply_time // 预申请时间
          this.nextStepShow = true
        } else {
          Toast.fail(res.msg)
        }
        this.loadingToggle()
      })
      .catch(error => {
        this.loadingToggle()
      })
  }

  /*
   * 点击-确认提现
   */
  confirmWithdradal() {
    if (this.disabled) return false
    this.loadingToggle()
    let params = {
      withdraw_money: this.amount,
      withdraw_pwd: this.withdrawPwd,
      withdraw_card: this.bankId,
      remark: ''
    }
    api
      .confirmWithdrawal(params)
      .then((res: any) => {
        if (res.code == 0) {
          Toast.success('提款成功')
          this.nextStepShow = false
          this.amount = null
          this.withdrawPwd = ''
          this.getWithdrawData()
          this.setDisabled()
        } else {
          Toast.fail(res.msg)
        }
        this.loadingToggle()
      })
      .catch(error => {
        this.loadingToggle()
      })
  }
  /** 从本地获取上次充值、提现或额度转换请求的时间戳，若间隔小于2s，禁用请求 */
  getDisabled() {
    const requestLimitStr = localStorage.getItem('requestLimit') || '{ "prev": 0 }',
      requestLimit = JSON.parse(requestLimitStr),
      time = 2000 - (new Date().getTime() - requestLimit.prev)
    if (time > 0) {
      this.disabled = true
      const timer = setTimeout(() => {
        this.disabled = false
        clearTimeout(timer)
      }, time)
    }
  }
  /** 把此次请求的时间戳存于本地，并禁用请求，在2后解禁 */
  setDisabled() {
    this.disabled = true
    localStorage.setItem('requestLimit', JSON.stringify({ prev: new Date().getTime() }))
    const timer = setTimeout(() => {
      this.disabled = false
      clearTimeout(timer)
    }, 2000)
  }

  showPasspop() {
    this.passpop.isShow = true
  }

  getWithdrawPwd(password) {
    this.withdrawPwd = password
  }

  /* 展开/隐藏 投注详情的开关 */
  toggleEffectBet(item) {
    item.showEffec = item.showEffec ? false : true
  }
}
</script>
