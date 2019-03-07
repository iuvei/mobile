<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Mutation, namespace, Action } from 'vuex-class'
import { NavBar, Tab, Tabs, Popup, SwipeCell, Toast } from 'vant'
import api from '@/api'
import BScroll from 'better-scroll'

const USER = namespace('user')
@Component({
  components: {
    [NavBar.name]: NavBar,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Popup.name]: Popup,
    [SwipeCell.name]: SwipeCell
  }
})
export default class Message extends Vue {
  @Mutation loadingToggle

  @USER.Mutation updateMessage

  @USER.Action getMessageRead

  activeTab: number = 0

  msgTabs: string[] = ['全部', '重要消息', '一般消息']
  msgDataLists: any = []

  messagePopupShow: boolean = false // 消息详情弹框

  detail: object = {} // 详情页

  // 控制tabs重复点击的问题，如果用户点击了tabs，先置为true，禁止点击，等到数据请求回来后，再为false，可以点击
  // 同时也可以为数据请求成功的标志，如果是false的话，则请求数据成功了，反之则为在请求中
  disabled: boolean = false

  $refs!: {
    container: Element
  }

  created() {}

  activated() {
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
    this.getMsgData('')
  }

  /*
   * 获取-消息数据
   */
  getMsgData(type: string | number) {
    let params = {
      type: type
    }
    this.loadingToggle()
    api
      .getGeneralMsg(params)
      .then((res: any) => {
        this.loadingToggle()
        if (res.code == 0) {
          this.msgDataLists = res.data
        } else {
          Toast.fail(res.msg)
        }
        this.disabled = false
      })
      .catch(error => {
        this.loadingToggle()
      })
  }

  /*
   * 切换-Tab标签页
   */
  onClickTab(index) {
    this.disabled = true
    this.msgDataLists = []
    this.getMsgData(index == 0 ? '' : index)
  }
  /*
   * 关闭-详情页
   */
  closeDetail() {
    this.messagePopupShow = false
  }

  /*
   * 删除当前消息
   */
  onClose(itemId) {
    let params = {
      id: itemId
    }
    api
      .deleteMsgStatus(params)
      .then((res: any) => {
        if (res.code == 0) {
          this.getMsgData(this.activeTab == 0 ? '' : this.activeTab)
        } else {
          Toast.fail(res.msg)
        }
      })
      .catch(error => {})
  }

  /*
   * 进入消息详情页面
   */
  onClickMessage(data, index) {
    this.messagePopupShow = true
    this.detail = {
      title: data.title,
      content: data.content,
      start_time: data.start_time
    }
    if (!data.status) {
      let params = {
        id: data.id
      }
      api
        .changeMsgStatus(params)
        .then((res: any) => {
          if (res.code == 0) {
            this.$set(this.msgDataLists[index], 'status', !data.status)
          } else {
            Toast.fail(res.msg)
          }
        })
        .catch(error => {})

      // 用户每次点击未读的消息进入详情后,就要发请求获取，该用户未读的消息的条数
      this.getMessageRead()
    }
  }
}
</script>
