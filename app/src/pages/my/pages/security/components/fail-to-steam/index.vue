<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NavBar, Button } from 'vant'
import api from '@/api'

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Button.name]: Button
  }
})
export default class failToSteam extends Vue {
  /*************data***********/
  // 错误信息提示
  @Prop(String)
  steamFailMes!: string

  // 跳转到steam的地址
  steamUrl: string = ''
  /*************life-cycle***********/
  activated() {
    api
      .apiVcodeGetSteamAuthLink({ url: window.location.origin + '/my/security' })
      .then((res: any) => {
        const { state, data } = res
        if (state === 0) {
          this.steamUrl = data.url
        }
      })
      .catch((error: any) => {})
  }
  /*************methods***********/
  onClickLeft() {
    this.$router.push({
      path: '/security'
    })
    window.sessionStorage.removeItem('changeSteam')
  }

  // 回到首页
  back() {
    this.$router.push({
      path: '/'
    })
    window.sessionStorage.removeItem('changeSteam')
  }
  // 使用其他Steam账号绑定
  steamBind() {
    window.location.href = this.steamUrl
    window.sessionStorage.setItem('changeSteam', 'true')
  }
}
</script>
