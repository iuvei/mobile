<template lang="pug" src="./index.pug"></template>

<style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { NavBar, Tab, Tabs, Toast } from 'vant'
import { Mutation, State } from 'vuex-class'
import Online from './components/online/index.vue'
import Offline from './components/offline/index.vue'
import Qrcode from './components/qrcode/index.vue'
import api from '@/api'
import { setTimeout, clearTimeout } from 'timers'

@Component({
  components: {
    Online,
    Offline,
    Qrcode,
    [NavBar.name]: NavBar,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs
  }
})
export default class Recharge extends Vue {
  @Mutation loadingToggle
  @State isLoading
  title: string = '充值'
  rightTitle: string = '存提记录'
  active: 0 | 1 = 0
  onlineData: any = null
  moneyList: number[] = []
  offlineData: any = null
  isQrcode: boolean = false
  qrcodeInfo: any = {
    url: '',
    money: 0,
    reapProfit: 0,
    orderNum: '',
    deposit_id: 0
  }
  disabled: boolean = false
  activated() {
    this.init()
    this.getDisabled()
  }

  goback() {
    this.$router.go(-1)
  }
  goto() {
    this.$router.push({ path: '/my/deposit' })
  }
  init() {
    this.loadingToggle()
    api
      .getBankWalletRecharge()
      .then((res: any) => {
        if (res.code === 0) {
          this.onlineData = (res.data && res.data.online_pay) || null
          // this.moneyList = (res.data && res.data.money_list) || []
          if (res.data && res.data.offline_pay && res.data.offline_pay.receive_bank && res.data.offline_pay.receive_bank.length) {
            this.offlineData = (res.data && res.data.offline_pay) || null
          }
        }
        this.loadingToggle()
      })
      .catch(err => {
        this.$error(err)
        this.loadingToggle()
      })
  }
  submit(option) {
    if (this.isLoading || this.disabled) return false
    this.loadingToggle()
    api
      .putBankWalletRecharge({
        ...option.data,
        url_return: location.origin
      })
      .then((res: any) => {
        if (res.code === 0) {
          if (option.type === 'online') {
            switch (res.data.url_type) {
              case 'jump_page':
                window.open(res.data.url)
              default:
                this.isQrcode = true
                this.qrcodeInfo = {
                  url: res.data.url,
                  money: Number(option.data.money),
                  reapProfit: option.reapProfit,
                  orderNum: res.data.order_number,
                  deposit_id: res.data.deposit_id
                }
            }
          } else if (option.type === 'offline') {
            Toast.success(res.msg || '回执提交成功！等待审核')
          }
          option.cb && option.cb()
          this.setDisabled()
        } else {
          Toast.fail(res.msg || '充值失败！')
        }
        this.loadingToggle()
      })
      .catch(err => {
        this.$error(err)
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
}
</script>
