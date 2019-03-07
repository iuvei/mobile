<template lang="pug" src="./index.pug"></template>

<style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NavBar, Swipe, SwipeItem, Icon, Tab, Tabs, Row, Col, Toast } from 'vant'
import _ from 'lodash'
import api from '@/api/index.ts'
import { Mutation, State, namespace, Action } from 'vuex-class'
import http from '@/utils/http'
const USER = namespace('user')
import BScroll from 'better-scroll'

@Component({
  name: 'game',
  components: {
    [NavBar.name]: NavBar,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Icon.name]: Icon,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Row.name]: Row,
    [Col.name]: Col
  }
})
export default class Game extends Vue {
  @Mutation loadingToggle
  @State isLoading
  @State hcgame
  @USER.State userType
  @USER.State token
  @Action gotoAPI
  @Prop(String) type!: string
  $refs!: {
    container: Element
  }
  title: string = '电子游戏中间页'
  actives: any = []
  tabActive: number = 0
  childTabActive: number = 0
  formData: any = {
    game_name: this.type,
    type_id: 1
  }
  recommends: any = []
  category: any[] = []
  childcategory: any[] = []
  list: any = []
  mounted() {
    this.getBanners()
    this.getRecommend()
    this.doQuery()
  }
  goback() {
    this.$router.go(-1)
  }
  /** 打开搜索游戏 */
  toSearch() {
    this.$router.push(`/game/search?type=${this.type}`)
  }
  get typeId() {
    const c = this.category.find((v, i) => this.tabActive == i)
    return c ? c.id : ''
  }
  get childTypeId() {
    const c = this.childcategory.find((v, i) => this.childTabActive == i)
    return c ? c.id : 0
  }
  get typeName() {
    const c = this.category.find((v, i) => this.tabActive == i)
    return c ? c.name : ''
  }
  @Watch('tabActive')
  tabActiveChange() {
    this.doQuery()
  }
  @Watch('childTabActive')
  childTabActiveChange() {
    this.doQuery(true)
  }
  doQuery(isChild = false) {
    if (this.isLoading) return false
    this.loadingToggle()
    const type_id = isChild ? this.childTypeId : this.typeId
    // !isChild && (this.childcategory = [])
    let tempcategory = Number(this.$route.query.category)
    let params = {}
    if (tempcategory === 1 || tempcategory === 6) {
      params['game_type'] = tempcategory
    }
    this.list = []
    api
      .getEgameCategory({ ...this.formData, type_id, ...params })
      .then((res: any) => {
        const { code, data } = res
        if (code === 0) {
          const { category, childcategory, list } = data
          this.category = category || []
          //点击category时， childcategory重新组装
          // 以childcategory有数据的话，则需要加个全部的选项给它，点击时请求的type_id 为 大类的type_id
          if (!isChild) {
            if (childcategory.length > 0) {
              this.childcategory = [{ name: '全部', id: type_id }, ...childcategory]
              this.childTabActive = 0
            } else {
              this.childcategory = []
            }
          }
          this.list = list || []
        }
        this.loadingToggle()
      })
      .catch(err => {
        this.$error(err)
        this.loadingToggle()
      })
  }
  getRecommend() {
    api.getEgameRecommend({ page_size: 4 }).then((res: any) => {
      if (res.code === 0) this.recommends = res.data.list || []
    })
  }
  goto(item) {
    this.gotoAPI({
      partner_id: item.partner_id,
      partner_name: item.partner_name.toLocaleLowerCase(),
      game_code: item.game_code,
      category: item.game_type,
      support_demo: item.support_demo,
      return_url: item.game_url
    })
  }
  gotoBannerLink(link) {
    window.location.href = link
  }
  getBanners() {
    api
      .getEgameThirdgameActive({
        type: this.$route.query.typ, // 电子:1,棋牌:7
        partner_id: this.$route.query.partner_id
      })
      .then((res: any) => {
        if (res.code === 0) this.actives = res.data || []
      })
  }
  addfavorite(e, id, partner_name) {
    e.stopPropagation()
    e.preventDefault()
    if (this.token && this.userType === '1') {
      this.$toast.fail('仅支持正式账号')
      return
    }
    this.list.map(v => v.id === id && this.$set(v, 'is_favorite', 1))
    this.recommends.map(v => v.game_id === id && this.$set(v, 'is_favorite', 1))
    api.putEgameAddfavorite({ game_id: id, game_name: partner_name }).then((res: any) => {
      if (res.code !== 0) {
        this.list.map(v => v.id === id && this.$set(v, 'is_favorite', 0))
        this.recommends.map(v => v.game_id === id && this.$set(v, 'is_favorite', 0))
        Toast.fail('添加收藏失败！')
      }
    })
  }
  removefavorite(e, id, partner_name) {
    e.stopPropagation()
    e.preventDefault()
    this.list.map(v => v.id === id && this.$set(v, 'is_favorite', 0))
    this.recommends.map(v => v.game_id === id && this.$set(v, 'is_favorite', 0))
    api.putEgameRemovefavorite({ game_id: id, game_name: partner_name }).then((res: any) => {
      if (res.code !== 0) {
        this.list.map(v => v.id === id && this.$set(v, 'is_favorite', 1))
        this.recommends.map(v => v.game_id === id && this.$set(v, 'is_favorite', 1))
        Toast.fail('删除收藏失败！')
      }
    })
  }
}
</script>
