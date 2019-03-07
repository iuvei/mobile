<template lang="pug" src="./index.pug"></template>

<style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { NavBar, Icon, Row, Col, Field, Toast } from 'vant'
import _ from 'lodash'
import api from '@/api/index.ts'
import { Mutation, State, namespace, Action } from 'vuex-class'
import http from '@/utils/http'
import BScroll from 'better-scroll'

const USER = namespace('user')

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Icon.name]: Icon,
    [Row.name]: Row,
    [Col.name]: Col,
    [Field.name]: Field
  }
})
export default class Recommend extends Vue {
  @Mutation loadingToggle
  @USER.State userType
  @State hcgame
  @Action gotoAPI
  $refs!: {
    container: Element
  }

  title: string = '推荐游戏'
  searchKey: string = ''
  searchShow: boolean = false
  gameList: any[] = []
  activated() {
    this.requireGameList()
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
  }
  goback() {
    this.$router.go(-1)
  }
  /** 打开搜索游戏 */
  toSearch() {
    this.searchKey = ''
    this.searchShow = true
  }
  cancelSearch() {
    this.searchKey = ''
    this.searchShow = false
  }
  requireGameList() {
    this.loadingToggle()
    api
      .getEgameRecommend({
        game_type: this.$route.query.game_type || ''
      })
      .then((res: any) => {
        if (res.code === 0) this.gameList = res.data.list || []
        this.loadingToggle()
      })
      .catch(err => {
        this.$error(err)
        this.loadingToggle()
      })
  }
  get searchGameList() {
    return this.searchKey ? this.gameList.filter(v => new RegExp(this.searchKey, 'i').test(v.game_name)) : this.gameList
  }
  addfavorite(e, item) {
    e.stopPropagation()
    e.preventDefault()
    this.$set(item, 'is_favorite', 1)
    api.putEgameAddfavorite({ game_id: item.game_id, game_name: item.partner_name }).then((res: any) => {
      if (res.code !== 0) {
        this.$set(item, 'is_favorite', 0)
        Toast.fail('添加收藏失败！')
      }
    })
  }
  removefavorite(e, item) {
    e.stopPropagation()
    e.preventDefault()
    this.$set(item, 'is_favorite', 0)
    api.putEgameRemovefavorite({ game_id: item.game_id, game_name: item.partner_name }).then((res: any) => {
      if (res.code !== 0) {
        this.$set(item, 'is_favorite', 1)
        Toast.fail('删除收藏失败！')
      }
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
}
</script>
