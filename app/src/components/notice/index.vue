<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import api from '@/api'
import { State, Mutation, namespace } from 'vuex-class'
import { Popup, NavBar, Cell, CellGroup } from 'vant'
import HcDialog from '@/components/hc-dialog'

const USER = namespace('user')

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Popup.name]: Popup,
    HcDialog
  }
})
export default class extends Vue {
  @USER.State token
  @State loginNotice
  @State theme
  @Mutation updateLoginNotice
  notices: string[] = []
  noticeList: any = []
  showNoticeList: boolean = false
  scrollStep: number = 0
  boxWidth: number = 0
  textWidth: number = 0
  remUnit: number = 0
  activeIndex: number = 0
  timer: any = null

  $refs!: {
    noticeBox: HTMLElement
    scroller: HTMLElement
  }

  get noticeImg() {
    switch (this.theme) {
      case 'live':
        return 'default'
      default:
        return this.theme
    }
  }

  activated() {
    this.init()
    this.requestNotices()
    this.showPopupNotice()
  }
  beforeDestroy() {
    clearTimeout(this.timer)
  }

  init() {
    this.boxWidth = this.$refs.noticeBox.clientWidth
    const HTML: any = document.getElementsByTagName('html')[0]
    this.remUnit = parseFloat(HTML.style.fontSize)
  }

  nextStep() {
    let nextTime = 100
    clearTimeout(this.timer)
    switch (this.scrollStep) {
      case 0:
        nextTime = Math.floor(this.scrollerTime * 1000) + 100
        this.scrollStep++
        break
      case 1:
        this.activeIndex = this.notices[this.activeIndex + 1] ? this.activeIndex + 1 : 0
        this.scrollStep = 0
        break
    }
    this.timer = setTimeout(() => {
      this.textWidth = this.$refs.scroller.clientWidth
      this.nextStep()
    }, nextTime)
  }
  get scrollerTime() {
    const SPEED = this.boxWidth / 5
    return (this.textWidth + this.boxWidth) / SPEED
  }
  get scrollerStyle() {
    let style: any = {}
    switch (this.scrollStep) {
      case 0:
        style.transform = `translateX(${this.boxWidth / this.remUnit}rem)`
        break
      case 1:
        style.transition = `all ${this.scrollerTime}s linear`
        style.transform = `translateX(-${this.textWidth / this.remUnit}rem)`
    }

    return style
  }

  @Watch('notices')
  noticesChange(newVal, oldVal) {
    if (newVal.length) {
      this.$nextTick(() => {
        this.textWidth = this.$refs.scroller.clientWidth
        this.boxWidth = this.$refs.noticeBox.clientWidth
        setTimeout(this.nextStep, 100)
      })
    } else {
      clearTimeout(this.timer)
    }
  }

  /* 获取滚动公告数据 */
  requestNotices() {
    api
      .notices()
      .then((response: any) => {
        if (response.code == 0) {
          response.data.forEach((v: any) => {
            this.notices.push(v.content)
          })
        }
      })
      .catch(error => {})
  }

  /*
   * 获取全部公告数据,并判断是否全部都是滚动公告
   * 若不是则不主动弹出公告
   * 若是则正常弹出公告
   */
  showPopupNotice() {
    api.noticeList().then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        let onlyPopupType3 = data.list.every(item => item.popup_type === 3)
        if (!onlyPopupType3) {
          if (!this.token) {
            if (sessionStorage.getItem('appearNotice') !== 'has_been_shown' && sessionStorage.getItem('appearNotice') == undefined) {
              this.getPopupNotice()
            }
          } else {
            if (this.loginNotice) {
              this.getPopupNotice()
              this.updateLoginNotice(false)
            }
          }
        }
      }
    })
  }

  getPopupNotice() {
    api.noticeList().then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        this.noticeList = data.list || []
        this.$nextTick(() => (this.showNoticeList = true))
      }
    })
  }

  clickNoticeDetail(item) {
    this.showNoticeList = false
    this.$dialog.alert({
      title: '公告详情',
      message: item.content
    })
  }

  /* 点击不再显示 */
  close() {
    if (!this.token) {
      sessionStorage.setItem('appearNotice', 'has_been_shown')
    }
    this.showNoticeList = false
  }
}
</script>
