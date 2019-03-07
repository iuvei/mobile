<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { NavBar, Row, Col, Tab, Tabs, CellGroup, Cell, Popup, Picker, DatetimePicker, Pagination, Toast } from 'vant'
import { Mutation, State } from 'vuex-class'
import _ from 'lodash'
import api from '@/api'
import BScroll from 'better-scroll'

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Row.name]: Row,
    [Col.name]: Col,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [CellGroup.name]: CellGroup,
    [Cell.name]: Cell,
    [Popup.name]: Popup,
    [Picker.name]: Picker,
    [DatetimePicker.name]: DatetimePicker,
    [Pagination.name]: Pagination
  }
})
export default class Records extends Vue {
  @Mutation loadingToggle
  @State isLoading
  @State timezone
  $refs!: {
    container: Element
  }
  title: string = '账变记录'
  rightTitle: string = '筛选'
  menu: any[] = [{ id: '', name: '全部' }]
  menuBgIsShow: boolean = false
  menuIsPop: boolean = false
  menuIndex: number = 0
  menuTimer: any = 0
  menuActive: any = {
    menuIndex: 0,
    queryDateIndex: 0
  }
  menuIsShow: boolean = false
  queryDateList: any[] = [{ name: '今天', code: 0 }, { name: '近1周', code: 1 }, { name: '近1个月', code: 2 }, { name: '近6个月', code: 3 }]
  queryDateIndex: number = 0
  queryDate: any = {
    date_begin: '',
    date_end: ''
  }
  summary: any = {
    balance: 0,
    income: 0,
    pay: 0
  }
  datas: any[] = []
  scroller: any = null
  pageInfo: any = {
    current: 1,
    size: 10,
    total: 0
  }
  activated() {
    this.getMenu()
      .then(v => {
        /** 默认查询七天 */
        this.selectQueryDate(this.queryDateIndex)
        this.doQuery()
      })
      .catch(v => {
        /** 获取菜单目录失败也要进行查询 */
        this.selectQueryDate(this.queryDateIndex)
        this.doQuery()
      })
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
  }

  goback() {
    this.$router.go(-1)
  }
  /** 获取分类 */
  getMenu() {
    return api
      .getRecordFrom()
      .then((res: any) => {
        if (res.code === 0) {
          const menu = _.toPairs(res.data || {}).map(([key, val]) => ({ id: key, name: val }))
          this.menu = [{ id: '', name: '全部' }, ...menu]
        }
      })
      .catch(err => {
        this.$error(err)
      })
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
      category: this.menu[this.menuIndex].id,
      time_begin: date_begin + ' 00:00:00',
      time_end: date_end + ' 23:59:59',
      page: this.pageInfo.current
    }
    api
      .getRecordFromsearch(formData)
      .then((res: any) => {
        if (res.code === 0) {
          this.summary = {
            balance: res.data.balance,
            income: res.data.totalMoney.income,
            pay: res.data.totalMoney.pay
          }
          this.pageInfo.total = res.data.pagination.total
          this.pageInfo.current = res.data.pagination.page
          this.pageInfo.size = res.data.pagination.size
          this.datas = res.data.list
        } else {
          this.summary = {
            balance: 0,
            income: 0,
            pay: 0
          }
          this.pageInfo.total = 0
          this.datas = []
          Toast.fail(res.msg)
        }
        this.loadingToggle()
      })
      .catch(err => {
        this.$error(err)
        this.loadingToggle()
      })
  }
  menuSubmit() {
    this.menuIndex = this.menuActive.menuIndex
    this.selectQueryDate(this.menuActive.queryDateIndex)
    this.pageInfo.current = 1
    this.doQuery()
    this.menuToggle()
  }
  dateStringify(time) {
    return new Date(time).format('MM/dd hh:mm')
  }
}
</script>
