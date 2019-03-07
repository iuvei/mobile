<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { NavBar, Cell, CellGroup, Button, Field, Popup, Picker } from 'vant'
import api from '@/api'
import { Mutation, namespace, Action } from 'vuex-class'
import BScroll from 'better-scroll'

const WALLET = namespace('wallet')

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button,
    [Field.name]: Field,
    [Popup.name]: Popup,
    [Picker.name]: Picker
  }
})
export default class Exchange extends Vue {
  @Mutation loadingToggle

  @WALLET.State totalBalance
  @WALLET.State mainWallet
  @WALLET.State childWalletArr
  @WALLET.State isOneRecycle
  @WALLET.State isLoading
  @WALLET.State childLenCount
  @WALLET.State isOkExchange
  @WALLET.Mutation updateTimer
  @WALLET.Action allRefresh
  @WALLET.Action oneRecycle
  @WALLET.Action reflreshChildWallet
  @WALLET.Action moneyConversion

  /*************data***********/
  // 默认文字
  defaultText: string = '请选择钱包类型'

  // 转出钱包value
  transferWalletObj: any = {
    name: this.defaultText
  }

  // 转入钱包value
  transferToWalletObj: any = {
    name: this.defaultText
  }

  // 是否显示picker
  popupObj: PopupState = {
    type: '',
    show: false
  }

  // 金额amount
  amount: any = ''

  $refs!: {
    picker: any
    container: Element
  }
  get btnAble() {
    return this.isLoading || this.isOneRecycle
  }

  @Watch('isOkExchange', { immediate: true })
  onIsOkExchanged(val) {
    if (val) {
      this.init()
    }
  }

  @Watch('isOneRecycle')
  onIsShowWalletChanged(val) {
    if (!val) {
      this.updateTimer({ type: 'clear' })
    }
  }
  /*************life-cycle***********/
  activated() {
    this.init()
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
    this.allRefresh()
  }
  beforeDestroy() {
    this.updateTimer({ type: 'clear' })
  }
  /*************methods***********/
  init() {
    this.transferToWalletObj = {
      name: this.defaultText
    }
    this.transferWalletObj = {
      name: this.defaultText
    }
    this.amount = ''
  }

  // 确定转换事件
  submit() {
    if (this.isOneRecycle) return false
    // 判断能否进行转化
    // 1、
    if (this.transferToWalletObj.name === this.defaultText || this.transferWalletObj.name === this.defaultText) {
      this.$dialog.alert({
        message: '请选择转换钱包'
      })
      return
    }

    // type:1 主转子，2 子转主
    const type = this.transferWalletObj.name === '主钱包' ? 1 : 2
    // 组装数据
    let param: ParamState = {
      type,
      cid: this.transferWalletObj.partner_id || this.transferToWalletObj.partner_id,
      amount: Number(this.amount)
    }
    let tempIndex = 0
    this.childWalletArr.map((obj: any, index: number) => {
      if (obj.partner_id === param.cid) {
        tempIndex = index
      }
    })
    // 3、额度转换时，如果是主转子是不支持小数的，如果是子转主是可以支持小数
    if (!this.amount.length) {
      this.$dialog.alert({
        message: '请填写转换金额'
      })
      return
    } else if (type === 1) {
      if (this.mainWallet < Number(this.amount)) {
        this.$dialog.alert({
          message: '主钱包转子钱包，输入的金额不能大于主钱包的金额'
        })
        return
      }
      if (!/^\+?[1-9]\d*$/.test(this.amount)) {
        this.$dialog.alert({
          message: '主钱包转子钱包，请填写正整数的金额'
        })
        return
      }
    } else if (type === 2) {
      if (this.childWalletArr[tempIndex].balance < Number(this.amount)) {
        this.$dialog.alert({
          message: '子钱包转主钱包，输入的金额不能大于子钱包的金额'
        })
        return
      }
      if (!/^\d+(\.\d{0,2})?$/.test(this.amount)) {
        this.$dialog.alert({
          message: '子钱包转主钱包，请填写整数或者保留两位小数的金额'
        })
        return
      }
    }
    this.moneyConversion({ param, index: tempIndex })
  }

  //点击转入和转出触发的 弹框picker
  // type:1是主钱包转入到子钱包 2是子钱包转入到主钱包
  onChangeCell(type, obj) {
    this.popupObj = {
      type,
      show: true
    }
    this.$nextTick(() => {
      this.$refs.picker.setValues(Array(obj.name === this.defaultText ? '主钱包' : obj.name))
    })
  }

  // onPopupCancel
  onPopupCancel() {
    this.popupObj.show = false
  }

  // onPopupConfirm
  onPopupConfirm(obj) {
    this.popupObj.show = false
    switch (this.popupObj.type) {
      case '1':
        this.transferWalletObj = obj
        if (this.transferToWalletObj.name === '主钱包' && obj.name === '主钱包') {
          this.transferToWalletObj = { name: this.defaultText }
        } else if (obj.name !== '主钱包') {
          this.transferToWalletObj = { name: '主钱包' }
        }
        break
      default:
        this.transferToWalletObj = obj
        if (this.transferWalletObj.name === '主钱包' && obj.name === '主钱包') {
          this.transferWalletObj = { name: this.defaultText }
        } else if (obj.name !== '主钱包') {
          this.transferWalletObj = { name: '主钱包' }
        }
    }
  }

  onClickLeft() {
    this.$router.go(-1)
  }
}

interface PopupState {
  type: string
  show: boolean
}
interface ParamState {
  type: number
  cid: number
  amount: number
}
</script>
