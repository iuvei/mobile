<template lang="pug">
  #app(:class="theme")
    router-view
</template>

<style lang="stylus">
body
  font-family -apple-system, 'Helvetica Neue', Arial, 'PingFang SC', 'lucida grande', 'lucida sans unicode', lucida, helvetica, 'Hiragino Sans GB', 'Microsoft YaHei', 'WenQuanYi Micro Hei', sans-serif
  -webkit-tap-highlight-color rgba(0, 0, 0, 0)
  background-color #f5f5f5
  width 100%
  overflow hidden
</style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class App extends Vue {
  @State theme
}
</script>
