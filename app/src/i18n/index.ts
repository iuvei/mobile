import Vue from 'vue'
import VueI18n from 'vue-i18n'
import state from '@/store/state'

// element-ui 的内置翻译文件，目前需要自己拷贝出来载入
import zhCNElement from './zh-CN/element'
import zhTWElement from './zh-TW/element'
import enUSElement from './en-US/element'

/** @todo 马来西亚语翻译字段少了一些，后期需要则重新翻译添加 */
import msMYElement from './ms-MY/element'

Vue.use(VueI18n)

const messages = {
  'zh-CN': {
    el: zhCNElement
  },
  'zh-TW': {
    el: zhTWElement
  },
  'en-US': {
    el: enUSElement
  },
  'ms-MY': {
    el: msMYElement
  }
}

const i18n = new VueI18n({
  locale: state.locale, // 获取 store 中的语言初始值
  fallbackLocale: 'zh-CN', // 替代翻译语种，找不到翻译时默认使用
  messages
})

export default i18n
