<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'
import { NavBar, Cell, CellGroup, Tab, Tabs, Toast } from 'vant'
import api from '@/api'
import BScroll from 'better-scroll'

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs
  }
})
export default class HelpCenter extends Vue {
  @Mutation loadingToggle

  helpDataList: any = []
  helpDetailData: any = []
  showDetail: boolean = false
  detailTitle: string = '帮助中心'

  $refs!: {
    container: Element
  }
  created() {}

  activated() {
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
    this.getHelpDetailData()
  }

  /*
   * 清理-缓存
   */
  onDeleateCache() {
    this.$dialog
      .confirm({
        message: '确定清理缓存？'
      })
      .then(() => {
        localStorage.clear()
        this.$dialog.alert({
          message: '清除成功！'
        })
      })
      .catch(() => {})
  }

  /*
   * 获取-帮助中心数据
   */
  getHelpDetailData() {
    this.loadingToggle()
    api
      .getHelpCenter()
      .then((res: any) => {
        this.loadingToggle()
        if (res.code == 0) {
          this.helpDataList = res.data
        } else {
          Toast.fail(res.msg)
        }
      })
      .catch(err => {
        this.loadingToggle()
      })
  }
  /*
   * 点击-进入详情页（过滤数据）
   */
  gotoDetail(helpCenter) {
    this.showDetail = true
    if (helpCenter === 'help') {
      this.detailTitle = '帮助中心'
      this.helpDetailData = this.helpDataList.filter(item => {
        return item.name === '取款文案' || item.name === '存款帮助' || item.name === '转账帮助' || item.name === '常见问题' || item.name === '联系我们'
      })
    } else if (helpCenter === 'provision') {
      this.detailTitle = '服务条款'
      this.helpDetailData = this.helpDataList.filter(item => {
        return item.name === '服务条款' || item.name === '规则条款' || item.name === '免责说明' || item.name === '责任博彩' || item.name === '关于我们'
      })
    }
  }
}
</script>
