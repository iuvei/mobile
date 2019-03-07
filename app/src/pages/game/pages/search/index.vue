<template lang="pug" src="./index.pug"></template>

<style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NavBar, Swipe, SwipeItem, Icon, Row, Col, Loading, Toast } from 'vant'
import _ from 'lodash'
import api from '@/api/index.ts'
import { Mutation, namespace, State, Action } from 'vuex-class'
import http from '@/utils/http'
const USER = namespace('user')

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Icon.name]: Icon,
    [Row.name]: Row,
    [Col.name]: Col,
    [Loading.name]: Loading
  }
})
export default class Search extends Vue {
  @Mutation loadingToggle
  @USER.State userType
  @State hcgame
  @Action gotoAPI
  @Prop(String) type!: string
  searchKey: string = ''
  searchIndex: number = 0
  searchDatas: any[] = []
  recommends: any[] = []
  loading: boolean = false
  activated() {
    this.getRecommends()
    this.doQuery()
  }
  goback() {
    this.$router.go(-1)
  }
  getRecommends() {
    api
      .getEgameRecommend({})
      .then((res: any) => {
        if (res.code === 0) this.recommends = res.data.list || []
      })
      .catch(err => {
        this.$error(err)
      })
  }
  get splitRecommend() {
    let list: any[] = []
    if (this.recommends.length) {
      for (let i = 0; i < this.recommends.length / 4; i++) {
        list.push(this.recommends.slice(i * 4, i * 4 + 4))
      }
    }
    return list
  }
  get filterSearchDatas() {
    const searchDatas = this.searchDatas.filter(v => new RegExp(this.searchKey).test(v.name))
    let list: any[] = []
    if (searchDatas.length) {
      for (let i = 0; i < searchDatas.length / 4; i++) {
        list.push(searchDatas.slice(i * 4, i * 4 + 4))
      }
    }
    return list
  }
  doQuery() {
    this.loading = true
    api
      .getEgameGamelist({ partner_name: this.type })
      .then((res: any) => {
        this.loading = false
        if (res.code === 0) this.searchDatas = res.data || []
      })
      .catch(err => {
        this.$error(err)
      })
  }
  addfavorite(e, item) {
    e.stopPropagation()
    e.preventDefault()
    this.$set(item, 'is_favorite', 1)
    api.putEgameAddfavorite({ game_id: item.id, game_name: item.partner_name }).then((res: any) => {
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
    api.putEgameRemovefavorite({ game_id: item.id, game_name: item.partner_name }).then((res: any) => {
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
