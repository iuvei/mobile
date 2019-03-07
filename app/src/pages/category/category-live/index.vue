<template lang="pug" src="./index.pug"></template>

<style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import _ from 'lodash'
import api from '@/api/index.ts'
import { NavBar, Swipe, SwipeItem } from 'vant'
import BScroll from 'better-scroll'
import { State, namespace, Mutation, Action } from 'vuex-class'

const USER = namespace('user')
const WALLET = namespace('user')

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem
  }
})
export default class CategoryLive extends Vue {
  @USER.State token
  @USER.State userType
  @Mutation loadingToggle
  @WALLET.Mutation updateExchangeDialog
  @Action gotoAPI

  /** data*/
  // 默认的轮播图数据
  defaultSwipeData = [
    {
      img_h5: require('./img/banner1.png')
    }
  ]
  // 轮播图的数据源
  swipeData: any = []

  // 数据源
  list: any = []

  $refs!: {
    container: Element
  }

  isLoading: boolean = false
  /** life method*/
  activated() {
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
    this.requestBanner()
    this.requestData()
  }
  /** methods*/
  // banner
  requestBanner() {
    api
      .gameBanners({ type: 4 })
      .then((res: any) => {
        const { code, data } = res
        if (code === 0 && data.length > 0) {
          this.swipeData = data
        } else {
          this.swipeData = this.defaultSwipeData
        }
      })
      .catch(error => {})
  }

  // 真人视讯的数据
  requestData() {
    api
      .game({ game_type: 2 })
      .then((res: any) => {
        const { code, data } = res
        if (code === 0) {
          this.list = data
        }
        this.isLoading = true
      })
      .catch(error => {
        this.isLoading = true
      })
  }
  // go详情
  goDetail(obj) {
    const { support_demo, partner_name, partner_id } = obj
    // 已登录
    if (this.token) {
      // game_code: 电子，棋牌需要加
      this.gotoAPI({
        partner_id,
        partner_name: partner_name.toLowerCase(),
        game_code: '',
        category: 2,
        return_url: '',
        support_demo
      })
    } else {
      // 未登录
      this.$dialog.alert({ message: `请先登录！` }).then(() => {
        this.$router.push('/my/login')
      })
    }
  }

  // 返回上一页
  onClickLeft() {
    this.$router.go(-1)
  }
}
</script>
