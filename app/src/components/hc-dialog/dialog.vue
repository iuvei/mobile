<template lang="pug">
.hc-dialog-container(v-if="show")
  .hc-dialog-mask(:class="{visible: pop}")
  .hc-dialog-popup-container(:class="{visible: pop}")
    .hc-dialog-popup-top
    .hc-dialog-popup-content
      .hc-dialog-popup-title(v-if="title")
        slot(name="title") {{title}}
      .hc-dialog-popup-body(:class="{['no-title']: !title, ['no-confirm']: !showConfirmButton}")
        slot
          .hc-dialog-popup-body-message(v-html="message")
      .hc-dialog-confirm-btn-group(v-if="showConfirmButton")
        slot(name="footer")
          button(type="button" @click="confirmClose") {{cancelButtonText || '取消'}}
          button(type="button" @click="confirmOk") {{confirmButtonText || '确定'}}
      button.hc-dialog-popup-close(v-else type="button" @click="confirmClose") X
</template>

<style lang="stylus" scoped>
*
  font-size 14px

.hc-dialog-container
  position fixed
  top 0
  bottom 0
  left 0
  right 0
  z-index 3000

  .hc-dialog-mask
    position absolute
    top 0
    bottom 0
    left 0
    right 0
    transition opacity 0.3s
    background-color rgba(0, 0, 0, 0.45)
    opacity 0

    &.visible
      opacity 1

  .hc-dialog-popup-container
    width 85%
    position absolute
    top 50%
    left 50%
    transform translate(-50%, -60%) scale(0.8, 0.8)
    opacity 0
    transition all 0.3s

    &.visible
      transform translate(-50%, -60%)
      opacity 1

    .hc-dialog-popup-top
      height 8px
      border-radius 4px 4px 0 0

    .hc-dialog-popup-content
      border-radius 0 0 4px 4px
      background-color #FFF
      position relative

      .hc-dialog-popup-title
        height 50px
        font-size 20px
        display flex
        align-items center
        justify-content center

      .hc-dialog-popup-body
        min-height 20px
        line-height 20px
        padding 0 15px 15px

        &.no-title
          padding-top 21px
          padding-bottom 16px

          &.no-confirm
            padding-top 45px
            padding-bottom 40px

        .hc-dialog-popup-body-message
          // text-align center
          max-height 420px
          overflow-y scroll
          overflow-x hidden
          -webkit-overflow-scrolling touch

          >>>
            img
              max-width 100%

      .hc-dialog-confirm-btn-group
        display flex

        button
          height 48px
          flex 1
          background-color transparent
          outline none
          border none
          border-top 1px solid #DEDEDE
          font-size 18px

          &:not(:last-child)
            border-right 1px solid #DEDEDE

      .hc-dialog-popup-close
        height 40px
        width 40px
        position absolute
        bottom -80px
        left 50%
        transform translateX(-50%)
        background-color transparent
        border 1px solid #ffffff
        border-radius 50%
        color #ffffff
        font-size 15px
</style>



<script lang="ts">
import { Vue, Component, Prop, Model, Watch, Emit } from 'vue-property-decorator'
import store from '@/store'

interface Options {
  title?: string
  message: string
  showConfirmButton?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
  ok?: () => void
  close?: () => void
}

@Component({
  name: 'hc-dialog'
})
export default class HcDialog extends Vue {
  @Prop(String) title!: string
  @Prop(String) message!: string
  @Prop({ type: Boolean, default: true })
  showConfirmButton!: boolean
  @Prop({ type: String, default: '' })
  confirmButtonText!: string
  @Prop({ type: String, default: '' })
  cancelButtonText!: string
  @Prop(Boolean)
  @Model('visible')
  visible!: boolean

  show: boolean = false
  pop: boolean = false

  timer: any = null

  @Watch('visible')
  visibleToggle(visible) {
    clearTimeout(this.timer)
    if (visible) {
      this.show = true
      store.commit('toggleNoScroll', true)
      this.timer = setTimeout(() => {
        this.pop = true
      }, 50)
    } else {
      this.pop = false
      this.timer = setTimeout(() => {
        this.show = false
        store.commit('toggleNoScroll', false)
      }, 350)
    }
  }

  @Emit('close')
  confirmClose() {
    if (!this['_events']['close']) {
      this.close()
    }
  }

  @Emit('ok')
  confirmOk() {
    if (!this['_events']['ok']) {
      this.close()
    }
  }

  close() {
    this.$emit('visible', false)
  }
}
</script>