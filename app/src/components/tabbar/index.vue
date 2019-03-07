<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Tabbar, TabbarItem } from 'vant'
import { State, namespace } from 'vuex-class'

const USER = namespace('user')

@Component({
  components: {
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem
  }
})
export default class extends Vue {
  @USER.State token
  @USER.State messageNum
  @State isFree
  @State theme

  activeTab = 0
  // 标志点击事件
  isClickTab: boolean = false

  tabs = [
    {
      label: '首页',
      to: '/',
      class: 'index'
    },
    {
      label: '免费试玩',
      to: '/trial',
      class: 'free',
      hide: false
    },
    {
      label: '在线充值',
      to: '/my/recharge',
      class: 'pay',
      hide: true
    },
    {
      label: '优惠活动',
      to: '/activity',
      class: 'activity'
    },
    {
      label: '额度转换',
      to: '/exchange',
      class: 'transform'
    },
    {
      label: '我的',
      to: '/my',
      class: 'my'
    }
  ]

  created() {
    this.updateTab()

    if (this.token.length > 0) {
      this.tabs[1].hide = true
      this.tabs[2].hide = false
    }
  }

  @Watch('token')
  onTokenChanged(value: any) {
    if (value.length > 0) {
      this.tabs[1].hide = true
      this.tabs[2].hide = false
    } else {
      this.tabs[1].hide = false
      this.tabs[2].hide = true
    }
  }

  @Watch('$route')
  onRouteChanged() {
    if (this.isClickTab) {
      this.isClickTab = false
    } else {
      this.updateTab()
    }
  }

  // 控制tab显示，主要
  hiddenTab(obj) {
    const { to } = obj
    if (to === '/trial') {
      return !obj.hide && this.isFree === 'true'
    }
    return !obj.hide
  }

  updateTab() {
    switch (this.token.length) {
      // 未登录
      case 0:
        // 有免费试玩
        if (this.isFree === 'true') {
          if (/^\/$/.test(this.$route.path)) {
            this.activeTab = 0
          } else if (/^\/trial/.test(this.$route.path)) {
            this.activeTab = 1
          } else if (/^\/activity/.test(this.$route.path)) {
            this.activeTab = 2
          } else if (/^\/exchange/.test(this.$route.path)) {
            this.activeTab = 3
          } else if (/^\/my/.test(this.$route.path)) {
            this.activeTab = 4
          }
        } else {
          // 无免费试玩
          if (/^\/$/.test(this.$route.path)) {
            this.activeTab = 0
          } else if (/^\/activity/.test(this.$route.path)) {
            this.activeTab = 1
          } else if (/^\/exchange/.test(this.$route.path)) {
            this.activeTab = 2
          } else if (/^\/my/.test(this.$route.path)) {
            this.activeTab = 3
          }
        }
        break
      // 已登录
      default:
        if (/^\/$/.test(this.$route.path)) {
          this.activeTab = 0
        } else if (/^\/activity/.test(this.$route.path)) {
          this.activeTab = 2
        } else if (/^\/exchange/.test(this.$route.path)) {
          this.activeTab = 3
        } else if (/^\/my/.test(this.$route.path)) {
          this.activeTab = 4
        }
    }
  }

  changeActiveTab(active) {
    this.activeTab = active
    this.isClickTab = true
  }
}
</script>
