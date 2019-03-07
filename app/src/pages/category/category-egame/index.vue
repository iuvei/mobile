<template lang="pug" src="./index.pug"></template>

<style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import _ from 'lodash'
import api from '@/api/index.ts'
import { NavBar, Swipe, SwipeItem } from 'vant'
import BScroll from 'better-scroll'
import { State, namespace, Mutation } from 'vuex-class'

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

  isLoading: boolean = false

  $refs!: {
    container: Element
  }

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
      .gameBanners({ type: 2 })
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

  // 电子游艺的数据
  requestData() {
    api
      .game({ game_type: 1 })
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
    const { partner_name, partner_id, game_type } = obj
    this.$router.push({ path: `/game?type=${partner_name.toLocaleUpperCase()}&partner_id=${partner_id}&typ=3&category=${game_type}` })
  }

  // 返回上一页
  onClickLeft() {
    this.$router.go(-1)
  }
}
</script>
