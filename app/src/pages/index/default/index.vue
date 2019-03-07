<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NavBar, Swipe, SwipeItem, Button, Field, Row, Col } from 'vant'
import Notice from '@/components/notice/index.vue'
import api from '@/api'
import _ from 'lodash'
import { Mutation, State, namespace } from 'vuex-class'
import Base from '../base.vue'

const USER = namespace('user')
const $html: HTMLElement = document.getElementsByTagName('html')[0]
const REM_UNIT: number = parseFloat($html.style.fontSize as string)

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
  @Prop(Number) type!: number
  @State theme
  $refs!: {
    container: Element
    gameTypes: Element
  }

  activeType: number = this.type || 0

  get activeList() {
    let t = _.find(this.games, { id: this.activeType }) as any
    if (t && t.list) {
      t.list.forEach(item => {
        try {
          if (item.category === 4) {
            const hcgame = item.game_id ? this.hcgame.find(v => v.game_id == item.game_id) : item
            item.icon = require('../img/logo/' + hcgame.iconkey + '_1.png')
          } else {
            item.icon = require('../img/logo/' + item.iconkey + '_1.png')
          }
        } catch (err) {
          item.icon = require('../img/logo/default.png')
        }
      })
    }
    return t ? t.list : []
  }

  getType(item) {
    const type = (item.img_url.match(/\/img\/type\/(\S*)\.png/) as any)[1]
    return type
  }

  /** 是否是热门大类 */
  get isTypeHot() {
    const type: any = _.find(this.games, { id: this.activeType })
    return type && type.name === '热门'
  }

  @Watch('activeType')
  onTypeChanged(value: string) {
    history.replaceState(null, '', '?type=' + value)
    this.sliding()
  }

  sliding() {
    this.$nextTick(() => {
      const $active = this.$refs.gameTypes.getElementsByClassName('active')[0]
      if ($active) {
        const $label = $active.getElementsByTagName('label')[0]
        const $slide = this.$refs.gameTypes.getElementsByClassName('slide')[0]
        $slide['style'] = `width: ${($label.offsetWidth + 4) / REM_UNIT}rem;transform: translateX(${($label.offsetLeft - 2) / REM_UNIT}rem);`
      }
    })
  }

  @Watch('games')
  gamesChange() {
    // 判断网址里面是否有 type 字段且该类型存在 games 里面，否则给默认值 type[0]
    let types: number[] = []
    this.games
      .filter((v: any) => v.is_display)
      .forEach((v: any) => {
        types.push(v.id)
      })
    if (!_.includes(types, this.activeType)) {
      this.activeType = types[0]
    }
    this.sliding()
  }

  onTypeClick(type) {
    this.activeType = type
  }
}
</script>
