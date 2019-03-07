<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { NavBar, Row, Col, Tab, Tabs, CellGroup, Cell, Popup, Picker, DatetimePicker, Pagination } from 'vant'
import { Mutation, State } from 'vuex-class'
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
export default class Sales extends Vue {
  @Mutation loadingToggle
  @State timezone
  $refs!: {
    queryDate: any
    container: Element
  }
  title: string = '我的优惠'
  statusList: any[] = [{ name: '通过', code: '1' }, { name: '拒绝', code: '2' }, { name: '未处理', code: '0' }]
  statusIndex: number = 0
  queryDateList: any[] = [{ name: '今天', code: 0 }, { name: '近三天', code: 1 }, { name: '近七天', code: 2 }, { name: '选择查询区间', code: 3 }]
  queryDateIndex: number = 2
  dateListIsShow: boolean = false
  customDate: boolean = false
  customDateSelect: boolean = false
  customDateSelectTo: string = ''
  customDateSelectCur: Date = new Date()
  queryDate: any = {
    date_begin: '',
    date_end: ''
  }
  datas: any[] = []
  openItems: number[] = []
  pageInfo: any = {
    current: 1,
    size: 10,
    total: 0
  }
  activated() {
    /** 默认查询七天 */
    this.selectQueryDate({ code: 2 }, 2)
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
  }

  goback() {
    this.$router.go(-1)
  }
  @Watch('dateListIsShow')
  /** 若查询时间为选择区间，则弹出选择框时设置默认选择时间 */
  setQueryDate(dateListIsShow) {
    if (dateListIsShow) {
      this.$nextTick(() => {
        this.$refs.queryDate.setIndexes([this.queryDateIndex])
      })
    }
  }
  /** 选择查询时间 */
  selectQueryDate(value, index) {
    const now = new Date(this.timezone.value)
    let { date_begin, date_end } = this.queryDate
    this.customDate = false
    switch (value.code) {
      case 0:
        date_begin = date_end = now.format('yyyy-MM-dd')
        break
      case 1:
        date_end = now.format('yyyy-MM-dd')
        now.setDate(now.getDate() - 3 + 1)
        date_begin = now.format('yyyy-MM-dd')
        break
      case 2:
        date_end = now.format('yyyy-MM-dd')
        now.setDate(now.getDate() - 7 + 1)
        date_begin = now.format('yyyy-MM-dd')
        break
      case 3:
        this.customDate = true
        break
    }
    this.queryDateIndex = index
    this.queryDate = { date_begin, date_end }
    this.dateListIsShow = false
    if (value.code !== 3) this.doQuery()
  }
  closeQueryDate() {
    this.dateListIsShow = false
  }
  /** 选择时间区间，判断选择开始或结束时间 */
  customDateSelectEvent(key) {
    switch (key) {
      case 'date_begin':
      case 'date_end':
        this.customDateSelect = true
        this.customDateSelectTo = key
        this.customDateSelectCur = new Date(this.queryDate[key])
        break
    }
  }
  /** 确认选择区间的时间，把数据放入表单查询参数内 */
  customDateConfirm(date) {
    this.queryDate[this.customDateSelectTo] = date.format('yyyy-MM-dd')
    this.customDateCancel()
  }
  customDateCancel() {
    this.customDateSelect = false
  }
  @Watch('statusIndex')
  statusChange() {
    this.pageInfo.current = 1
    this.doQuery()
  }
  doQuery() {
    this.loadingToggle()
    let formData = {
      ...this.queryDate,
      page: this.pageInfo.current,
      page_size: this.pageInfo.size,
      status: this.statusList[this.statusIndex].code
    }
    api
      .getApiUserGetMyCoupon(formData)
      .then((res: any) => {
        if (res.code === 0) {
          this.pageInfo.total = res.data.pagination.total
          this.pageInfo.current = res.data.pagination.page
          this.pageInfo.size = res.data.pagination.size
          this.datas = res.data.list
        } else {
          this.pageInfo.total = 0
          this.pageInfo.current = 1
          this.datas = []
        }
        this.loadingToggle()
      })
      .catch(err => {
        this.$error(err)
        this.loadingToggle()
      })
  }
}
</script>
