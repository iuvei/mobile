<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { NavBar, Row, Col, Popup, Picker, DatetimePicker, Pagination, Toast } from 'vant'
import { Mutation, State } from 'vuex-class'
import api from '@/api'
import _ from 'lodash'
import { setTimeout } from 'timers'
import BScroll from 'better-scroll'

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Row.name]: Row,
    [Col.name]: Col,
    [Popup.name]: Popup,
    [Picker.name]: Picker,
    [DatetimePicker.name]: DatetimePicker,
    [Pagination.name]: Pagination
  }
})
export default class EffcetiveOrders extends Vue {
  @Mutation loadingToggle
  @State isLoading
  @State timezone
  $refs!: {
    container: Element
  }
  title: string = '有效投注列表'
  rightTitle: string = '筛选'
  columns: any[] = []
  summary: any = {}
  menu: any[] = []
  menuIsShow: boolean = false
  menuBgIsShow: boolean = false
  menuIsPop: boolean = false
  menuIndex: number = 0
  menuTimer: any = 0
  menuActive: any = {
    menuIndex: 0,
    queryDateIndex: 0
  }
  queryDateList: any[] = [{ name: '今天', code: 0 }, { name: '近1周', code: 1 }, { name: '近1个月', code: 2 }, { name: '近6个月', code: 3 }]
  queryDateIndex: number = 0
  queryDate: any = {
    date_begin: '',
    date_end: ''
  }
  tableData: any[] = []
  pageInfo: any = {
    current: 1,
    size: 20,
    total: 0
  }
  activated() {
    this.getMenu()
    this.selectQueryDate(this.queryDateIndex)
    this.doQuery()
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
  }
  goback() {
    this.$router.go(-1)
  }
  getMenu() {
    this.columns = [
      { prop: 'reckonTime', className: row => 'center' },
      { prop: 'betAmount' },
      { prop: 'validBet' },
      { prop: 'prize' },
      { prop: 'profit', className: row => (row.profit > 0 ? 'green' : row.profit < 0 ? 'red' : '') }
    ]
    this.menu = [
      { id: '0', name: '全部' },
      { id: '1', name: '电子' },
      { id: '2', name: '视讯' },
      { id: '3', name: '体育' },
      { id: '4', name: '电竞' },
      { id: '5', name: '彩票' },
      { id: '6', name: '棋牌' }
    ]
  }
  menuToggle() {
    if (!this.menuIsShow) {
      this.menuActive.menuIndex = this.menuIndex
      this.menuActive.queryDateIndex = this.queryDateIndex
      this.menuIsShow = true
      clearTimeout(this.menuTimer)
      this.menuTimer = setTimeout(() => {
        this.menuIsShow = true
        this.menuIsPop = this.menuIsShow
        this.menuBgIsShow = this.menuIsShow
      }, 0)
    } else {
      this.menuIsPop = false
      this.menuBgIsShow = false
      clearTimeout(this.menuTimer)
      this.menuTimer = setTimeout(() => {
        this.menuIsShow = false
        this.menuIsPop = this.menuIsShow
        this.menuBgIsShow = this.menuIsShow
      }, 500)
    }
  }
  /** 选择查询时间 */
  selectQueryDate(index) {
    const now = new Date(this.timezone.value)
    const value = this.queryDateList.find((v, i) => i === index)
    let { date_begin, date_end } = this.queryDate
    switch (value.code) {
      case 0:
        date_begin = date_end = now.format('yyyy-MM-dd')
        break
      case 1:
        date_end = now.format('yyyy-MM-dd')
        now.setDate(now.getDate() - 7 + 1)
        date_begin = now.format('yyyy-MM-dd')
        break
      case 2:
        date_end = now.format('yyyy-MM-dd')
        now.setDate(now.getDate() - 30 + 1)
        date_begin = now.format('yyyy-MM-dd')
        break
      case 3:
        date_end = now.format('yyyy-MM-dd')
        now.setDate(now.getDate() - 30 * 6 + 1)
        date_begin = now.format('yyyy-MM-dd')
        break
    }
    this.queryDateIndex = index
    this.queryDate = { date_begin, date_end }
  }
  doQuery() {
    if (this.isLoading) return false
    this.loadingToggle()
    const { date_begin, date_end } = this.queryDate
    let formData = {
      gameType: this.menu[this.menuIndex].id || '0',
      startTime: date_begin,
      endTime: date_end,
      page: this.pageInfo.current,
      pageSize: this.pageInfo.size
    }
    api
      .getEffectiveBetting(formData)
      .then((res: any) => {
        if (res.code === 0) {
          this.tableData = res.data.list || []
          this.summary = res.data.totalMoney || {}
          this.pageInfo.page = res.data.pagination.page
          this.pageInfo.size = res.data.pagination.size
          this.pageInfo.total = res.data.pagination.total
        } else {
          Toast.fail(res.msg)
          this.pageInfo.page = 1
          this.pageInfo.total = 0
          this.tableData = []
          this.summary = {}
        }
        this.loadingToggle()
      })
      .catch(err => {
        this.$error(err)
        this.loadingToggle()
      })
  }
  get hasSummary() {
    return _.keys(this.summary).length
  }
  menuSubmit() {
    this.menuIndex = this.menuActive.menuIndex
    this.selectQueryDate(this.menuActive.queryDateIndex)
    this.pageInfo.current = 1
    this.doQuery()
    this.menuToggle()
  }
}
</script>
