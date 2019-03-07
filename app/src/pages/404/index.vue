<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class ErrorPage extends Vue {
  width: number = Math.round(document.body.clientWidth * 1.6)
  viewPort: string = '0 0 ' + this.width + ' ' + this.width / 2
}
</script>
