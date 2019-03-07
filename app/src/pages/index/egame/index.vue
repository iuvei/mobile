<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { NavBar, Swipe, SwipeItem, Button, Field, Row, Col, Toast } from 'vant'
import Notice from '@/components/notice/index.vue'
import api from '@/api'
import _ from 'lodash'
import { Mutation, State, namespace } from 'vuex-class'
import Base from '../base.vue'

const USER = namespace('user')

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Button.name]: Button,
    [Field.name]: Field,
    [Row.name]: Row,
    [Col.name]: Col,
    Notice
  }
})
export default class extends Base {
  @Mutation openService
  @Mutation loadingToggle
  @USER.State userType
  @State theme
  $refs!: {
    container: Element
    scroller: HTMLDivElement
  }
  /** 推荐游戏 - 棋牌类 */
  recommends: any[] = []
  scrollerStyle: any = {}
  scrollerTimer: any = 0
  /** 热门游戏 */
  get hotGame() {
    const hot: any = _.find(this.games, { name: '热门' })
    return hot && hot.is_display && hot.list && hot.list.length ? hot.list : []
  }
  onTypeChanged() {}

  reword: string = '288,788,964.20'
  /** 六大类游戏 */
  get otherGame() {
    let games = this.games
      .filter((v: any) => v.name !== '热门' && v.is_display)
      .map((v: any) => {
        let name = ''
        let route = ''
        let className = ''
        let englishName = ''

        switch (v.name) {
          case '真人':
            name = '真人视讯'
            route = `/category-live`
            className = 'live'
            englishName = 'Video Signal'
            break
          case '体育':
            name = '体育博弈'
            route = `/category-sport`
            className = 'sport'
            englishName = 'Sports Event'
            break
          case '棋牌':
            name = '棋牌对战'
            route = `/category-card`
            className = 'card'
            englishName = 'Chess and Card'
            break
          case '电竞':
            name = '电竞竞猜'
            route = `/category-esport`
            className = 'esport'
            englishName = 'Electronic Sports'
            break
          case '电子':
            name = '电子游艺'
            route = `/category-egame`
            className = 'egame'
            englishName = 'Entertainment'
            break
          case '彩票':
            name = '彩票游戏'
            route = `/category-lottery`
            className = 'lottery'
            englishName = 'Lottery Game'
            break
        }
        return { ...v, name, route, className, englishName }
      })
    if ((games.length > 0 && games.length < 3) || (games.length > 3 && games.length < 6)) {
      games.push({ name: '敬请期待', className: 'wait' })
    }
    return games
  }
  /** 中奖榜单 */
  winnerList: any = []

  mounted() {
    this.requireRecommends()
    this.requireWinner()
    this.requestHotGames()
  }
  beforeDestroy() {
    clearTimeout(this.scrollerTimer)
  }
  /** 获取推荐游戏列表 */
  requireRecommends() {
    // 首页推荐列表长度
    const recommondationListLength = 9

    api.getEgameRecommend({ game_type: 1, page_size: recommondationListLength }).then((res: any) => {
      if (res.code === 0) {
        let { list } = res.data
        list = Array.isArray(list) ? list.slice(0, recommondationListLength) : []

        if (list.length === recommondationListLength) {
          list[recommondationListLength - 1] = {
            game_name: '更多游戏',
            img_url: require('../img/egame/index-recommend-more.png'),
            isMore: true
          }
        }

        this.recommends = list
      } else {
        this.recommends = []
      }
    })
  }
  /** 获取本地图片路径 */
  getImgSrc(item) {
    let src = ''
    try {
      if (item.category === 4) {
        const hcgame = item.game_id ? this.hcgame.find(v => v.game_id == item.game_id) : item
        src = require('../img/logo/' + hcgame.iconkey + '_1.png')
      } else {
        src = require('../img/logo/' + item.iconkey + '_1.png')
      }
    } catch (err) {
      src = require('../img/logo/default.png')
    }
    return src
  }
  /** 获取中奖榜单信息 */
  requireWinner() {
    api.getWinners().then((res: any) => {
      if (res.code === 0) {
        this.winnerList = res.data || []
        if (this.winnerList.length > 5) {
          this.winnerList = [...this.winnerList, ...this.winnerList.slice(0, 5)]
          this.scrollStart()
        }
      }
    })
  }
  /** 中奖榜单开始滚动 */
  scrollStart() {
    clearTimeout(this.scrollerTimer)
    this.scrollerStyle = {}
    this.$nextTick(() => {
      const SCROLLER = this.$refs.scroller // 滚动内容
      const SCROLLER_PARENT = SCROLLER.parentNode as HTMLDivElement // 滚动容器
      const CONTENT_HEIGHT = SCROLLER_PARENT.offsetHeight // 滚动容器高度
      const SCROLLER_HEIGHT = SCROLLER.offsetHeight // 滚动内容高度
      const SCROLL_NUMBER = this.winnerList.length // 滚动条数
      const SCROLL_TIME = SCROLL_NUMBER / 2 // 滚动一次所需的时间

      this.scrollerStyle = {
        transition: `transform ${SCROLL_TIME}s linear`,
        transform: `translateY(-${SCROLLER_HEIGHT - CONTENT_HEIGHT}px)`
      }

      this.scrollerTimer = setTimeout(() => {
        this.scrollStart()
      }, SCROLL_TIME * 1000)
    })
  }
  /** 获取第三方全称 */
  getPartnerFullName(item) {
    //category 1.电子，2.视讯，3.体育，4.电竞，5.彩票，6.棋牌'
    let full_name = item.partner_name
    switch (item.game_type) {
      case 1:
        full_name += '电子'
        break
      case 2:
        full_name += '视讯'
        break
      case 3:
        full_name += '体育'
        break
      case 4:
        full_name += '电竞'
        break
      case 5:
        full_name += '彩票'
        break
      case 6:
        full_name += '棋牌'
        break
    }
    return full_name
  }
  /** 访问一个游戏 */
  toOneGame(item) {
    if (item.isMore) {
      this.$router.push({ path: '/game/recommend', query: { game_type: '1' } })
    } else {
      this.gotoAPI({
        partner_id: item.partner_id,
        partner_name: item.partner_name.toLocaleLowerCase(),
        game_code: item.game_code,
        category: item.game_type,
        support_demo: item.support_demo,
        return_url: item.game_url
      })
    }
  }

  requestHotGames() {
    api.homeHotGames().then((response: any) => {
      if (response.code === 0) {
        const sum = response.data.jackpot_sum
        this.reword = sum ? this.$fmoney(sum, 2) : ''
      }
    })
  }
}
</script>