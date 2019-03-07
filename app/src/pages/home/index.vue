<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Action, Mutation, State } from 'vuex-class'
import Tabbar from '@/components/tabbar/index.vue'
import Loading from '@/components/loading/index.vue'
import FixedService from '@/components/fixed-service/index.vue'
import { Button } from 'vant'
import { values } from 'lodash'
import ExchangeDialog from '@/components/exchange-dialog/index.vue'

@Component({
  components: {
    Tabbar,
    Loading,
    FixedService,
    ExchangeDialog,
    [Button.name]: Button
  }
})
export default class Home extends Vue {
  @State isLoading
  @State isFree
  @Action getTimezone
  @Mutation updateTimezone
  @State timezone
  @State subscription
  @State noScroll

  timer: any = 0

  /** 全部订阅完成后开始渲染 */
  get subscriptionAllRight() {
    return values(this.subscription).every(v => v)
  }

  get isTabbarVisible() {
    return this.$route.meta.tabbar !== false
  }

  /* android 键盘弹起，输入框被遮挡解决方案 */
  softKeyboardPopup() {
    if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
      let timer2 = setTimeout(() => {
        const activeElement = document.activeElement as any
        activeElement.scrollIntoViewIfNeeded && activeElement.scrollIntoViewIfNeeded()
        clearTimeout(timer2)
      }, 0)
    }
  }

  created() {
    this.$store.dispatch('getWebInfo')
    this.$store.dispatch('getHomeDome')
    this.$store.dispatch('registerSetting')
    this.getTimezone()
  }

  mounted() {
    window.addEventListener('resize', this.softKeyboardPopup)
  }

  beforeDestroy() {
    clearInterval(this.timer)
    removeEventListener('resize', this.softKeyboardPopup)
  }
  @Watch('timezone.startUp')
  timerStart(newVal, oldVal) {
    // 秒定时器开启，只在请求后状态false->true时触发一次
    if (!oldVal && newVal) {
      clearInterval(this.timer)
      this.timer = setInterval(() => {
        const timezone = { ...this.timezone, value: this.timezone.value + 1000 }
        this.updateTimezone(timezone)
      }, 1000)
    }
  }
}
</script>
