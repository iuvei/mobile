<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State, namespace, Mutation, Action } from 'vuex-class'
import { Button, Field } from 'vant'
import api from '@/api'
import HcDialog from '@/components/hc-dialog'

const WALLET = namespace('wallet')

@Component({
  components: {
    [Button.name]: Button,
    [Field.name]: Field,
    HcDialog
  }
})
export default class ExchangeDialog extends Vue {
  @WALLET.State mainWallet
  @WALLET.State exchangeDialog
  @WALLET.State isOkExchange
  @WALLET.State isOneRecycle
  @WALLET.State isLoading
  @WALLET.Mutation updateExchangeDialog
  @WALLET.Mutation updateTimer

  @Mutation loadingToggle
  @Action openAPI
  @WALLET.Action requestMainWallet
  @WALLET.Action moneyConversion
  @WALLET.Action oneRecycle

  // 子钱包的名字和金额
  childWallet: ChildState = {
    transfer: ''
  }
  // 弹框的快速输入金额
  moneyArr: string[] = ['100', '500', '1000', '全部']

  @Watch('exchangeDialog.show', { deep: true })
  onExchangeDialog(val) {
    if (val) {
      // 请求主钱包的金额
      this.requestMainWallet()
    } else {
      this.childWallet.transfer = ''
    }
  }

  @Watch('isOkExchange')
  onupdateIsOkExchangeChanged(val) {
    if (val) {
      this.childWallet.transfer = ''
    }
  }

  @Watch('isOneRecycle')
  onIsShowWalletChanged(val) {
    if (!val) {
      this.updateTimer({ type: 'clear' })
    }
  }
  get btnAble() {
    return this.isLoading || this.isOneRecycle
  }
  /** methods */
  // 快速输入金额
  fastMoney(i) {
    switch (i) {
      case '全部':
        this.$set(this.childWallet, 'transfer', parseInt(String(this.mainWallet)))
        break
      default:
        this.$set(this.childWallet, 'transfer', i)
    }
  }

  // 校验金额
  enterMoney(val) {
    if (!/^[1-9][0-9]*$/.test(val)) {
      this.$set(this.childWallet, 'transfer', '')
    }
  }

  /** 去存款 */
  gotoRecharge() {
    this.updateExchangeDialog({ show: false })
    this.$router.push('/my/recharge')
  }

  // 快捷额度转换的确定事件
  confirmExchange() {
    const { transfer } = this.childWallet
    if (Number(transfer) === 0) {
      this.$toast.fail('请输入金额')
      return
    } else if (Number(transfer) > this.mainWallet) {
      this.$toast.fail('转换金额不能大于主钱包的金额')
      return
    }
    let param = {
      type: 1,
      cid: this.exchangeDialog.partner_id,
      amount: Number(transfer)
    }
    this.moneyConversion({ param })
  }

  // 直接进入游戏
  gotoContent() {
    this.updateExchangeDialog({ show: false })
    this.openAPI()
  }
}
interface ChildState {
  transfer: any
}
</script>
