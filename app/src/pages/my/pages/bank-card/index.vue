<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { NavBar, CellGroup, Cell, Icon, Button } from 'vant'
import api from '@/api/index.ts'
import { Mutation, State } from 'vuex-class'
import Passpop from '@/components/passpop/index.vue'

@Component({
  components: {
    [NavBar.name]: NavBar,
    [CellGroup.name]: CellGroup,
    [Cell.name]: Cell,
    [Icon.name]: Icon,
    [Button.name]: Button,
    Passpop
  }
})
export default class BankCard extends Vue {
  @State isLoading
  @Mutation loadingToggle

  title: string = '银行卡'
  bankCards: any[] = []
  bankList: any = []
  prompt: string[] = ['提款银行最多只能绑定5张，如需绑定新银行卡请删减一张旧卡后再进行添加']
  hasPwd: boolean = false /** 是否设置了提现密码 */
  // 设置提现密码弹框的设置
  passpop: any = {
    title: '请输入提现密码',
    number: 4, //限制输入密码个数
    isShow: false, //是否显示密码输入框
    callback: (password, fn) => {
      // 设置提现密码
      this.unbind(password, fn)
    },
    item: null
  }
  activated() {
    api
      .userSafety()
      .then((res: any) => {
        if (res.code === 0) {
          this.hasPwd = res.data && res.data.withdraw_password && res.data.withdraw_password.status == 1
        }
        this.init()
      })
      .catch(err => {
        this.$error(err)
        this.init()
      })
  }
  goback() {
    this.$router.go(-1)
  }
  /** 获取绑定银行卡信息 */
  getProfileBanklist() {
    if (this.isLoading) return false
    this.loadingToggle()
    api
      .getProfileBanklist()
      .then((res: any) => {
        if (res.code === 0) {
          let bankCards = (res.data || []).filter(bankCard => {
            const bank = this.bankList.find(bank => bank.id === bankCard.bank_id)
            return bank && bank.is_online != 1
          })
          this.bankCards = bankCards
        }
        this.loadingToggle()
      })
      .catch(err => {
        this.$error(err)
        this.loadingToggle()
      })
  }
  /** 获取所有银行信息 */
  getProfileBanks() {
    return api
      .getProfileBanks()
      .then((res: any) => {
        if (res.code === 0) {
          this.bankList = res.data
        }
      })
      .catch(err => {
        this.$error(err)
      })
  }
  /** 根据id获取银行名称 */
  getBankName(item) {
    const bank = this.bankList.find(bank => bank.id === item.bank_id)
    return bank ? bank.name : ''
  }
  /** 根据id获取银行图标 */
  getBankIcon(item) {
    const bank = this.bankList.find(bank => bank.id === item.bank_id)
    return bank ? bank.h5_logo : ''
  }
  init() {
    this.getProfileBanks()
      .then(res => this.getProfileBanklist())
      .catch(err => this.getProfileBanklist())
  }
  /** 是否解除绑定？呼出提现密码键盘 */
  isUnbind(item) {
    if (this.isLoading) return false
    this.$dialog
      .confirm({
        message: '是否解除绑定？'
      })
      .then(() => {
        this.passpop.isShow = true
        this.passpop.item = item
      })
      .catch(() => {})
  }
  /** 解除绑定 */
  unbind(password, fn) {
    if (this.isLoading) return false
    fn && fn()
    const { item } = this.passpop
    this.loadingToggle()
    api
      .deleteProfileBank({ id: item.id, withdraw_password: password })
      .then((res: any) => {
        if (res.code === 0) {
          this.$dialog.alert({ message: res.msg || `您已成功删除尾号为${item.card.slice(-4)}的银行卡信息！` })
          this.$nextTick(() => this.getProfileBanklist())
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
  /** 去新建 */
  gotoAdd() {
    if (this.isLoading) return false
    if (this.bankCards.length >= 5) {
      this.$dialog.alert({ message: '最多只能绑定5张银行卡！' })
      return false
    }
    if (!this.hasPwd) {
      this.$dialog
        .confirm({ message: '请先设置提现密码' })
        .then(res => {
          /** 跳到设置提现密码 */
          this.$router.push({ path: '/my/security' })
        })
        .catch(() => {})
    } else {
      this.$router.push({ path: '/my/add-bank-card' })
    }
  }
}
</script>
