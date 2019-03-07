<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NavBar, Cell, CellGroup, Field, Button, Tabs, Tab } from 'vant'

@Component({
  components: {
    [NavBar.name]: NavBar,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Field.name]: Field,
    [Button.name]: Button,
    [Tabs.name]: Tabs,
    [Tab.name]: Tab
  }
})
export default class SecurityEdit extends Vue {
  /*************data***********/
  // 显示的类型
  @Prop(String) type!: string

  // html展示的内容
  @Prop(Object) editObj!: any

  //表单对象
  @Prop(Object) form!: any

  $refs!: {}

  /*************life-cycle***********/
  /*************methods***********/
  // 点击nav-bar 左边的按钮
  onClickLeft() {
    this.$emit('returnToList')
  }

  // 点击tabs
  onClickTabs(tab, title) {
    this.$emit('onTabs', title)
  }
}
</script>
