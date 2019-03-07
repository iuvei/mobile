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
export default class Deposit extends Vue {
  @Mutation loadingToggle
  @State isLoading
  @State timezone
  $refs!: {
    container: Element
  }
  title: string = '存提记录'
  rightTitle: string = '筛选'
  menu: any[] = [{ id: '1', name: '充值' }, { id: '2', name: '提现' }]
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
  queryDateIndex: number = 1
  queryDate: any = {
    date_begin: '',
    date_end: ''
  }

  datas: any[] = []
  scroller: any = null
  pageInfo: any = {
    current: 1,
    size: 10,
    total: 0
  }
  activated() {
    this.selectQueryDate(this.queryDateIndex)
    this.doQuery()
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
  }
  goback() {
    this.$router.go(-1)
  }
  /** 获取分类 */
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
      start_time: date_begin + ' 00:00:00',
      end_time: date_end + ' 23:59:59',
      page: this.pageInfo.current
    }
    api
      .getRecordMoney(formData)
      .then((res: any) => {
        const { code, data } = res
        if (code === 0) {
          const { pagination, list } = data
          const { total, page, size } = pagination
          this.pageInfo = {
            total,
            current: page,
            size
          }
          this.datas = list || []
        } else {
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
    this.doQuery()
    this.menuToggle()
  }
  dateStringify(time) {
    return new Date(time).format('MM/dd hh:mm')
  }
}
</script>
