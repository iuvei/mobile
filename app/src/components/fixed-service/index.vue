<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Popup, Cell, CellGroup, Toast, Icon } from 'vant'
import api from '@/api'
import { error } from 'util'
import _ from 'lodash'
import VueClipboard from 'vue-clipboard2'
import { State } from 'vuex-class'

Vue.use(VueClipboard)

@Component({
  components: {
    [Popup.name]: Popup,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Icon.name]: Icon
  }
})
export default class FixedService extends Vue {
  @State serviceCount

  /*******************data*************************/
  //客服列表数据
  kefuList: any = {}

  // 客服列表的文字
  kefuLabel: KefuState = {
    code: '网页客服',
    qq: 'QQ客服',
    wx: '微信客服'
  }

  closeFloat: boolean = true

  //是否显示客服的种类列表
  showKefu: boolean = false

  // 客服接口失效时的错误信息
  errorMessage: string = ''

  float: any = ''
  // 复制对象
  copyBtn: any = null

  /*******************life-cycle******************/
  mounted() {
    // 获取第三方客服的请求
    this.serviceURL()
    // 首页浮动图
    this.floatURL()
    // 实现客服小图标拖拽功能
    Array.from(document.getElementsByClassName('fixed-service')).map(block => {
      this.initDragging(block)
    })
  }

  /*******************methods*********************/
  // 获取在线客服地址
  serviceURL() {
    api
      .service3th()
      .then((res: any) => {
        let { code, data, message } = res
        if (code === 0) {
          for (const key in data) {
            if (!data[key].length) {
              delete data[key]
            }
            if (key !== 'code' && key !== 'qq' && key !== 'wx') {
              delete data[key]
            }
          }
          this.kefuList = data || {}
        } else {
          this.errorMessage = message
        }
      })
      .catch((error: any) => {})
  }
  /** 获取浮动图 */
  floatURL() {
    api.getHomeFloat({ type: '2' }).then((res: any) => {
      if (res.code === 0 && res.data && res.data[0]) {
        this.float = res.data[0]
      }
    })
  }

  // 点击客服的小图，弹出客服列表
  @Watch('serviceCount')
  kefuPopup() {
    const { errorMessage } = this
    if (errorMessage.length) {
      this.$dialog.alert({
        title: '温馨提示',
        message: errorMessage
      })
    } else if (!_.toPairs(this.kefuList).length) {
      this.$dialog.alert({
        title: '温馨提示',
        message: '暂无第三方客服'
      })
    } else {
      this.showKefu = !this.showKefu
    }
  }

  // - 点击客服列表对应的逻辑
  liveService(item, i) {
    if (i === 'wx') {
      this.$dialog
        .confirm({
          title: '联系微信客服',
          message: `联系微信客服，请添加微信号：${item}`,
          confirmButtonText: '复制微信号'
        })
        .then(() => {
          Vue.prototype.$copyText(item).then(
            function(e) {
              Toast('复制客户微信号成功！')
            },
            function(e) {
              Toast('复制客户微信号失败！')
            }
          )
        })
        .catch(() => {})
      this.showKefu = false
      return
    }

    let link = ''
    if (i === 'code') {
      link = item.replace('https://', 'http://')
    } else if (i === 'qq') {
      link = 'mqqwpa://im/chat?chat_type=wpa&uin=' + item + '&version=1&src_type=web'
    } else {
      link = item
    }

    if (window.webkit) {
      let wx = window.navigator.userAgent.toLowerCase()
      if (/micromessenger/i.test(wx) && i === 'qq') {
        Toast(`请用其他浏览器打开`)
        return
      }
      window.location.href = link
      window.webkit.messageHandlers.liveService.postMessage({ [i]: link })
    } else if (window.JsInterface) {
      if (i === 'code') {
        window.location.href = link
      } else {
        window.JsInterface.liveService(JSON.stringify({ [i]: link }))
      }
    } else {
      window.location.href = link
    }
  }

  // 初始化拖拽
  initDragging(block: any) {
    let oW, oH
    // 绑定touchstart事件
    block.addEventListener(
      'touchstart',
      function(e) {
        let touches = e.touches[0]
        oW = touches.clientX - block.offsetLeft
        oH = touches.clientY - block.offsetTop
        //阻止页面的滑动默认事件
        document.addEventListener('touchmove', defaultEvent, { passive: false })
      },
      false
    )

    block.addEventListener(
      'touchmove',
      function(e) {
        let touches = e.touches[0]
        let oLeft = touches.clientX - oW
        let oTop = touches.clientY - oH
        if (oLeft < 0) {
          oLeft = 0
        } else if (oLeft > document.documentElement.clientWidth - block.offsetWidth) {
          oLeft = document.documentElement.clientWidth - block.offsetWidth
        }

        if (oTop < 0) {
          oTop = 0
        } else if (oTop > document.documentElement.clientHeight - block.offsetHeight) {
          oTop = document.documentElement.clientHeight - block.offsetHeight
        }

        block.style.left = oLeft + 'px'
        block.style.top = oTop + 'px'
      },
      false
    )

    block.addEventListener(
      'touchend',
      function() {
        document.removeEventListener('touchmove', defaultEvent, false)
      },
      false
    )

    function defaultEvent(e) {
      if (e.preventDefault) {
        e.preventDefault()
      } else {
        e.returnValue = false
      }
    }
  }
}

interface KefuState {
  code: string
  qq: string
  wx: string
}

interface AlertState extends PopState {
  title: string
}
interface PopState {
  content: string
  status: boolean
}
</script>
