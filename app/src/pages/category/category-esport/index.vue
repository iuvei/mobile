<template lang="pug" src="./index.pug"></template>

<style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { NavBar, Swipe, SwipeItem, Toast } from 'vant'
import _ from 'lodash'
import api from '@/api/index.ts'
import BScroll from 'better-scroll'
import { Mutation, Action } from 'vuex-class'

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem
  }
})
export default class CategoryGame extends Vue {
  @Action gotoAPI

  $refs!: {
    container: Element
  }

  swipeList: any = []

  gameList: any = []

  activated() {
    this.getBanner()
    this.getGameList()
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
  }

  getBanner() {
    api
      .gameBanners({ type: 9 })
      .then((res: any) => {
        const { code, data, msg } = res
        if (code === 0 && data.length > 0) {
          this.swipeList = data
        } else {
          this.swipeList = [{ img_h5: require('./img/banner@2x.png') }]
        }
      })
      .catch(error => {})
  }
  getGameList() {
    api
      .game({ game_type: 4 })
      .then((res: any) => {
        const { code, data, msg } = res
        if (code === 0) {
          if (data.length > 0) {
            this.gameList = data.map(item => {
              try {
                item.img_h5 = require('./img/' + item.img_url.match(/\/game\/hc\/(\S*).png/)[1] + '@2x.png')
              } catch (err) {
                item.img_h5 = require('./img/default.jpg')
              }
              return item
            })
          }
        } else {
          Toast.fail(msg)
        }
      })
      .catch(error => {})
  }

  goDetail(item) {
    this.gotoAPI({
      partner_id: item.partner_id,
      partner_name: item.partner_name.toLocaleLowerCase(),
      game_code: item.game_code,
      category: 4,
      support_demo: item.support_demo,
      return_url: item.game_url
    })
  }
}
</script>
