<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { NavBar, Cell, Popup, Picker, Toast } from 'vant'
import api from '@/api'
import _ from 'lodash'
import userState from '@/store/modules/user/state'
import BScroll from 'better-scroll'
import { namespace } from 'vuex-class'

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Cell.name]: Cell,
    [Popup.name]: Popup,
    [Picker.name]: Picker
  }
})
export default class Activity extends Vue {
  @namespace('user').State token
  $refs!: {
    container: Element
  }
  isTypePickerVisible: boolean = false

  types = [
    {
      id: 0,
      name: '全部'
    }
  ]

  typeIndex = 0

  isTypeLoading: boolean = true

  activitys = []

  // 试玩
  freePlayer = userState.userType

  activated() {
    this.requestActivityTypes()
    this.requestActivityList()
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
  }

  requestActivityTypes() {
    api
      .activityTypes()
      .then((response: any) => {
        this.isTypeLoading = false
        if (response.code == 0) {
          this.types = response.data || [{ id: 0, name: '全部' }]
        }
      })
      .catch(error => {
        this.isTypeLoading = false
      })
  }

  requestActivityList() {
    let params = {
      type_id: this.types[this.typeIndex].id,
      source: 'h5'
    }

    api
      .activityList(params)
      .then((response: any) => {
        if (response.code == 0) {
          this.activitys = response.data
        }
      })
      .catch(error => {})
  }

  onBackClick() {
    this.$router.go(-1)
  }

  onTitleClick() {
    this.isTypePickerVisible = true
  }

  onItemClick(item: any) {
    if (!this.token) {
      this.$toast.fail('请登录查看详情')
      return false
    } else if (this.freePlayer) {
      this.$toast.fail('不支持试玩账号查看')
      return false
    }
    if (item.type === 2) {
      /** 外部链接直接跳转，同时发送申请优惠请求 */
      if (item.open_mode === 2) {
        window.open(item.link_h5)
      } else {
        window.location.href = item.link_h5
      }
    } else {
      this.$router.push({ path: '/activity/detail', query: { id: String(item.id) } })
    }
  }

  apply(id) {
    api.postActiveList({ id, content: '' }).then((res: any) => {
      if (res.code === 0) {
        Toast.success('活动申请已提交！')
      } else {
        Toast.fail(res.msg)
      }
    })
  }

  onTypeSelect(value, index) {
    this.isTypePickerVisible = false
    this.typeIndex = index
    this.requestActivityList()
  }

  onPickerClose() {
    this.isTypePickerVisible = false
  }
}
</script>
