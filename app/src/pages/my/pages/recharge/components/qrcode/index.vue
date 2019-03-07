<template lang="pug" src="./index.pug"></template> <style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NavBar, Toast } from 'vant'
import { Mutation, State } from 'vuex-class'
import api from '@/api'
import QrcodeVue from 'qrcode.vue'
import BScroll from 'better-scroll'
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)

@Component({
  components: {
    [NavBar.name]: NavBar,
    QrcodeVue
  }
})
export default class Qrcode extends Vue {
  @Prop(Object) info: any
  @Mutation loadingToggle
  @State isLoading
  $refs!: {
    content: HTMLElement
  }
  title: string = '扫码支付'
  timer: any = null
  timerLoading: boolean = false
  payStatus: number = 0
  qrcode: string = ''
  mounted() {
    this.pollingStart()
    this.$nextTick(() => {
      const canvas = this.$refs.content.getElementsByTagName('canvas')[0]
      this.qrcode = canvas.toDataURL('image/png', 1)
    })
  }
  beforeDestroy() {
    this.clearTimerFun()
  }
  goback() {
    this.$emit('close')
    this.clearTimerFun()
  }
  pollingStart() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      this.requestPayStatus()
    }, 3000)
  }
  requestPayStatus() {
    if (this.timerLoading) return false
    this.timerLoading = true
    api
      .getBankWalletPayStatus({ deposit_id: this.info.deposit_id })
      .then((res: any) => {
        if (res.code === 0) this.payStatus = res.data
        this.timerLoading = false
        this.$nextTick(() => {
          if (this.isLoading) {
            this.loadingToggle()
            if (this.payStatus !== 1) {
              this.payStatus === 0 ? Toast.success('提交成功，等待后台审核') : Toast.fail('充值失败')
              this.pollingStart()
            } else {
              this.success()
            }
          } else if (this.payStatus === 1) {
            this.success()
          } else {
            this.pollingStart()
          }
        })
      })
      .catch(err => {
        this.$error(err)
        this.timerLoading = false
        this.isLoading && this.loadingToggle()
        this.$nextTick(() => this.payStatus !== 1 && this.pollingStart())
      })
  }
  paySuccess() {
    if (this.isLoading) return false
    this.loadingToggle()
    if (!this.timerLoading || this.payStatus !== 1) {
      this.requestPayStatus()
    } else {
      this.success()
    }
  }
  success() {
    Toast.success('充值成功')
    this.clearTimerFun()
    const timerOut = setTimeout(() => {
      this.$emit('close')
      clearTimeout(timerOut)
    }, 3100)
  }
  clearTimerFun() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }
  onCopySuccess(e) {
    Toast.success(e.text)
  }
  onCopyError(e) {
    Toast.fail(e.text)
  }
}
</script>
