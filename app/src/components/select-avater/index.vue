<template lang="pug">
.select-avater
  .top
    span.left(@click="cancel") 取消
    span.right(@click="confirm") 完成
  .scoller(ref="container")
    .select(:style="{'width':avaterArr.length*2.4+'rem'}")
      .select-item(
        v-for="item,index in avaterArr"
        :class="{active:selectIndex==index}"
        @click="selectAvaterFun(item.img)"
        :key="index"
      )
        img(:src="require(`./img/${item.img}`)")
</template>
<style scoped lang="stylus">
.select-avater
  .top
    display flex
    justify-content space-between
    line-height 1.17333rem
    height 1.17333rem
    position relative

    span
      padding 0 0.4rem
      font-size 0.37333rem

    &:after
      content ' '
      position absolute
      pointer-events none
      box-sizing border-box
      top -50%
      left -50%
      right -50%
      bottom -50%
      -webkit-transform scale(0.5)
      transform scale(0.5)
      border 0 solid
      border-width 0.5px 0
      border-width 1px 0

  .scoller
    width 100%

    .select
      overflow hidden

      .select-item
        display inline-block
        width 90px
        height 103px
        text-align center
        line-height 105px
        float left
        display flex
        align-items center
        justify-content center

        img
          height 88px
          border-radius 50%
          vertical-align middle
</style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import index from '@/store/modules/user'
import BScroll from 'better-scroll'

@Component
export default class extends Vue {
  @Prop(Array) avaterArr!: any
  @Prop(String) selectAvaterUrl!: string

  tempUrl: string = ''
  $refs!: {
    container: Element
  }
  mounted() {
    this.tempUrl = this.selectAvaterUrl
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: true, scrollY: false, click: true, stopPropagation: true })
    })
  }
  get selectIndex() {
    let tempIndex = 0
    this.avaterArr.map((obj: any, index: number) => {
      if (obj.img === this.tempUrl) {
        tempIndex = index
      }
    })
    return tempIndex
  }

  // 点击选择头像的方法
  selectAvaterFun(val) {
    this.tempUrl = val
  }

  cancel() {
    this.$emit('cancel')
  }

  confirm() {
    this.$emit('chooseAvater', this.avaterArr[this.selectIndex].img)
    this.$emit('cancel')
  }
}
</script>
