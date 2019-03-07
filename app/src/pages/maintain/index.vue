<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import api from '@/api'
@Component
export default class Maintain extends Vue {
  maintain_time = {
    start_time: '',
    end_time: ''
  }
  get type() {
    if (this.$route.query.type === 'maintain') {
      this.maintain_time.start_time = this.$route.query.start_time
      this.maintain_time.end_time = this.$route.query.end_time
    }
    return this.$route.query.type
  }
  // 美东转北京时间
  get formatTime() {
    let obj = {
      start_time: '',
      end_time: ''
    }
    if (this.maintain_time.start_time && this.maintain_time.end_time) {
      obj.start_time = this.utc2beijing(this.maintain_time.start_time)
      obj.end_time = this.utc2beijing(this.maintain_time.end_time)
    }
    return obj
  }
  utc2beijing(str) {
    let timestamp = new Date(str).getTime() + 12 * 60 * 60 * 1000
    return new Date(timestamp).format('yyyy-MM-dd hh:mm:ss')
  }
  activated() {
    this.requestHallStatus()
  }
  // 获取厅状态
  requestHallStatus() {
    api
      .getCommonStatus()
      .then((res: any) => {
        if (res.code === 0) {
          this.$router.push({ path: '/' })
        }
      })
      .catch(err => {})
  }
}
</script>
