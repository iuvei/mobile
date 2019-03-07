<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { PasswordInput, NumberKeyboard } from 'vant'
import { clearTimeout } from 'timers'

@Component({
  components: {
    [PasswordInput.name]: PasswordInput,
    [NumberKeyboard.name]: NumberKeyboard
  }
})
export default class Passpop extends Vue {
  /*************data***********/
  // 配置密码输入框对象
  @Prop(Object)
  passpop!: any

  // 输入密码
  password: string = ''
  keybordIsPop: boolean = false
  /*************life-cycle***********/
  /*************methods***********/
  // 点击蒙层让密码输入框消失
  hide() {
    this.keybordIsPop = false
    this.password = ''
    this.$nextTick(() => (this.passpop.isShow = false))
  }
  @Watch('passpop.isShow', { immediate: true, deep: true })
  onPasspopChanged(value) {
    if (value) {
      this.$nextTick(() => (this.keybordIsPop = true))
    }
  }

  // 按键输入方法
  onInput(key) {
    this.password = (this.password + key).slice(0, 4)
    const { number, callback } = this.passpop
    if (this.password.length === number) {
      callback(this.password, this.hide)
    }
  }
  // 删除
  onDelete() {
    this.password = this.password.slice(0, this.password.length - 1)
  }
}
</script>
<style lang="stylus">
.security-passpop
  .van-number-keyboard
    position relative
  .van-password-input
    padding-bottom .813333rem
  .van-key--gray
    background-color #D8D8D8
</style>
