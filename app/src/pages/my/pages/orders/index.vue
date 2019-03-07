<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { NavBar, Row, Col, Tab, Tabs, CellGroup, Cell, Popup, Picker, DatetimePicker, Collapse, CollapseItem, Pagination, Toast } from 'vant'
import { Mutation, State } from 'vuex-class'
import api from '@/api'
import { setTimeout } from 'timers'
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
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [Pagination.name]: Pagination
  }
})
export default class Orders extends Vue {
  @Mutation loadingToggle
  @State isLoading
  @State timezone
  $refs!: {
    container: Element
  }
  title: string = '投注记录'
  rightTitle: string = '筛选'
  menu: any[] = [{ name: '全部' }]
  menuIsShow: boolean = false
  menuBgIsShow: boolean = false
  menuIsPop: boolean = false
  menuIndex: number = 0
  menuTimer: any = 0
  menuActive: any = {
    menuIndex: 0,
    queryDateIndex: 0
  }
  statusList: any[] = [{ name: '全部', code: 0 }, { name: '中奖', code: 1 }, { name: '未中奖', code: 2 }, { name: '待结算', code: 3 }]
  statusIndex: number = 0
  queryDateList: any[] = [{ name: '今天', code: 0 }, { name: '近1周', code: 1 }, { name: '近1个月', code: 2 }, { name: '近6个月', code: 3 }]
  queryDateIndex: number = 0
  queryDate: any = {
    date_begin: '',
    date_end: ''
  }
  summary: any = {
    profit_loss: 0,
    totalPrice: 0
  }
  datas: any[] = []
  openItems: number[] = []
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
  /** 获取投注记录分类 */
  getMenu() {
    return api.getUserOrderMenu().then((res: any) => {
      if (res.code === 0) {
        this.menu = res.data || [{ name: '全部' }]
      }
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
  menuSubmit() {
    this.menuIndex = this.menuActive.menuIndex
    this.selectQueryDate(this.menuActive.queryDateIndex)
    this.pageInfo.current = 1
    this.doQuery()
    this.menuToggle()
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
  get filterStatusList() {
    const { id_name = '' } = this.menu[this.menuIndex],
      bool = id_name === '' || id_name === 'sports' || id_name === 'esport' || id_name === 'lottery',
      statusList = this.statusList.filter(v => v.code !== 3 || bool)
    if (!statusList[this.statusIndex]) {
      this.statusIndex = 0
    }
    return statusList
  }
  @Watch('statusIndex')
  statusChange() {
    this.pageInfo.current = 1
    this.doQuery()
  }
  doQuery() {
    if (this.isLoading) return false
    this.loadingToggle()
    const { date_begin, date_end } = this.queryDate
    let formData = {
      time_begin: date_begin + ' 00:00:00',
      time_end: date_end + ' 23:59:59',
      page: this.pageInfo.current,
      win_status: this.statusList[this.statusIndex].code,
      game_type: this.menu[this.menuIndex].game_type || ''
    }
    api
      .getUserRecordGames(formData)
      .then((res: any) => {
        if (res.code === 0) {
          this.summary = {
            profit_loss: res.data.totalMoney.lose_earn || 0,
            totalPrice: res.data.totalMoney.validbet || 0
          }
          this.pageInfo.total = res.data.pagination.total
          this.pageInfo.current = res.data.pagination.page
          this.pageInfo.size = res.data.pagination.size
          this.datas = res.data.list
        } else {
          this.summary = { profit_loss: 0, totalPrice: 0 }
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
  dateStringify(time) {
    return new Date(time.replace(/-/g, '/')).format('MM/dd hh:mm')
  }
  /** 判断注单状态 */
  getState(order) {
    return order.status === 1 ? '+' + order.prize : order.display
  }
  /** 为数字添加千位分隔符 */
  numFormat(num) {
    num = num.toString().split('.') // 分隔小数点
    let arr = num[0].split('').reverse() // 转换成字符数组并且倒序排列
    let res: string[] = []
    for (let i = 0, len = arr.length; i < len; i++) {
      if (i % 3 === 0 && i !== 0) {
        res.push(',') // 添加分隔符
      }
      res.push(arr[i])
    }
    res.reverse() // 再次倒序成为正确的顺序
    let _res = ''
    if (num[1]) {
      // 如果有小数的话添加小数部分
      _res = res.join('').concat('.' + num[1])
    } else {
      _res = res.join('')
    }
    return _res
  }
}
</script>
