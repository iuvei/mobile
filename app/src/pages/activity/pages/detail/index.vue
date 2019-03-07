<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NavBar, Toast } from 'vant'
import { Mutation, namespace } from 'vuex-class'
import api from '@/api'
import _ from 'lodash'

const USER = namespace('user')

@Component({
  components: {
    [NavBar.name]: NavBar
  }
})
export default class Activity extends Vue {
  @Prop(String) id!: string
  @USER.State token
  @Mutation loadingToggle

  content: string = ''
  isApply: boolean = false

  activated() {
    this.requestActivityList()
  }

  requestActivityList() {
    let params = {
      id: this.id,
      source: 'h5'
    }

    api
      .activityDetail(params)
      .then((response: any) => {
        if (response.code == 0) {
          this.content = response.data.content_h5
          this.isApply = !response.data.is_auto_apply
        }
      })
      .catch(error => {})
  }

  onApplyClick() {
    if (!this.token) {
      this.$dialog.alert({
        message: '请先登录！'
      })
      return false
    }
    this.loadingToggle()
    api
      .postActiveList({ id: this.id })
      .then((res: any) => {
        if (res.code === 0) {
          Toast.success('活动申请已提交！')
        } else {
          Toast.fail(res.msg)
        }
        this.loadingToggle()
      })
      .catch(err => {
        this.$error(err)
        this.loadingToggle()
      })
  }

  onBackClick() {
    this.$router.go(-1)
  }
}
</script>
