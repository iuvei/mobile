<template lang="pug">
.loading-container
  .loading-bg
    van-loading(color="white")
    .text loading...
</template>
<style scoped lang="stylus">
*
  box-sizing border-box
.loading-container
  position fixed
  top 0
  bottom 0
  left 0
  right 0
  z-index 10000
  .loading-bg
    width 110px
    height 110px
    border-radius 5px
    padding 10px
    background-color rgba(0, 0, 0, 0.5)
    display flex
    flex-direction column
    justify-content center
    align-items center
    position absolute
    top 50%
    left 50%
    transform translate(-50%, -50%)
    .text
      font-size 14px
      color #FFF
      margin-top 15px
      text-align center

</style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Loading } from 'vant'
@Component({
  components: {
    [Loading.name]: Loading
  }
})
export default class extends Vue {}
</script>
