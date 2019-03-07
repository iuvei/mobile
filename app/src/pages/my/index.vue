<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { NavBar, Button, Cell, CellGroup, Toast } from 'vant'
import { Mutation, namespace, State, Action } from 'vuex-class'
import api from '@/api'
import userState from '@/store/modules/user/state'
import CountUp from './js/count-up.js'
import BScroll from 'better-scroll'

const USER = namespace('user')
const WALLET = namespace('wallet')

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Button.name]: Button,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup
  }
})
export default class My extends Vue {
  /*************data***********/
  @Mutation loadingToggle
  @USER.Mutation updateToken
  @USER.State messageNum
  @USER.State username
  @USER.State userType
  @USER.Action getMessageRead
  @State registerSwitch

  @WALLET.State totalBalance
  @WALLET.State mainWallet
  @WALLET.State childWalletArr
  @WALLET.State isOneRecycle
  @WALLET.State isLoading
  @WALLET.State childLenCount
  @WALLET.Mutation updateTimer
  @WALLET.Action allRefresh
  @WALLET.Action oneRecycle
  @WALLET.Action reflreshChildWallet

  $refs!: {
    container: Element
    children: Element
  }

  // 用户的个人信息对象
  user: any = {}

  // 列表的数据源
  list: any = [
    {
      records: { title: '账变记录', icon: 'icon-hc-money' },
      orders: { title: '投注记录', icon: 'icon-hc-record' },
      'effective-orders': { title: '有效投注', icon: 'icon-hc-tick' },
      sales: { title: '我的优惠', icon: 'icon-hc-coupon' }
    },
    {
      message: { title: '会员消息', icon: 'icon-hc-member-message' },
      'bank-card': { title: '银行卡管理', icon: 'icon-hc-card' },
      profile: { title: '个人资料', icon: 'icon-hc-personal-data' }
    },
    { security: { title: '安全中心', icon: 'icon-hc-security' }, 'help-center': { title: '帮助中心', icon: 'icon-hc-help-center' } }
  ]

  // 钱包的数据源
  childWalletDataSource: any = []

  // 是否显示子钱包
  isShowWallet: boolean = false

  // 试玩
  freePlayer = userState.userType

  // countup的配置项
  options = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.'
  }

  // 数字变化的对象
  demo: any = undefined

  // 外部的scroller
  wrapScroller: any = undefined

  // 内层的scroller
  innerScroller: any = undefined

  // 是否可以刷新
  get btnAble() {
    return this.isOneRecycle || this.isLoading
  }

  @Watch('totalBalance')
  onAllBalanceChanged(val) {
    this.demo && this.demo.update(val)
  }

  @Watch('isOneRecycle')
  onIsShowWalletChanged(val) {
    if (!val) {
      this.updateTimer({ type: 'clear' })
    }
  }
  /*************life-cycle*****/
  activated() {
    this.$nextTick(() => {
      if (this.freePlayer !== '1' && userState.token.length > 0) {
        this.loadingToggle()
        let apis = [this.allRefresh(), this.userBaseinfo()]
        // 获取会员未读会员消息
        this.getMessageRead()
        Promise.all(apis)
          .then(() => {
            this.loadingToggle()
            this.createdCountUp()
          })
          .catch(() => this.loadingToggle())
      } else {
        this.createdCountUp()
      }
    })
  }

  beforeDestroy() {
    this.demo = undefined
    this.updateTimer({ type: 'clear' })
  }

  /*************methods********/
  // new CountUp
  createdCountUp() {
    this.$nextTick(() => {
      this.demo = new CountUp('myTargetElement', 0, this.totalBalance, 2, 0.08, this.options)
      this.demo.start()
    })
  }

  userBaseinfo() {
    return api
      .userBaseinfo()
      .then((res: any) => {
        const { code, data } = res
        if (code == 0) {
          this.user = { ...this.user, ...data }
        }
      })
      .catch(error => {})
  }

  onLoginClick() {
    this.$router.push('/my/login')
  }

  onRegisterClick() {
    this.$router.push('/register')
  }

  /*
   * 路由跳转事件
   */
  changeRouter(link) {
    this.$router.push({
      path: link
    })
  }

  /*
   * 退出登录
   */
  onClickLogout() {
    this.loadingToggle()
    api
      .logout()
      .then((res: any) => {
        this.loadingToggle()
        if (res.code == 0) {
          this.$store.commit('user/updateToken')
          this.$store.commit('user/updateMessage')
          if (this.userType === '1') {
            this.$store.commit('user/updateUsername')
            this.$store.commit('user/updateUserType')
          }
          Toast.success('退出登录成功')
          this.$router.push('/')
          this.user = {}
        } else {
          Toast.fail(res.msg)
        }
      })
      .catch(error => {
        this.loadingToggle()
      })
  }

  // 点击显示子钱包的事件
  clickChildWallet() {
    if (this.freePlayer === '1') {
      this.$toast.fail('仅支持正式账号')
      return
    }
    this.isShowWallet = !this.isShowWallet
    if (this.isShowWallet && !this.innerScroller) {
      this.$nextTick(() => {
        this.innerScroller = new BScroll(this.$refs.children, { scrollX: false, scrollY: true, click: true, stopPropagation: true })
      })
    }
  }

  // 全部回收的方法
  oneRecycleFun() {
    this.demo = undefined
    this.demo = this.createdCountUp()
    this.oneRecycle()
  }
}
</script>
