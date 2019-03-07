import 'babel-polyfill'
import 'isomorphic-fetch'

import Vue from 'vue'
import app from '@/app.vue'
import router from '@/router'
import store from '@/store'
import i18n from '@/i18n'
import '@/utils/helper'
import '@/styles'

import { Dialog, Toast, Lazyload } from 'vant'

Vue.use(Toast)
Vue.use(Dialog)
Vue.use(Lazyload)

import 'amfe-flexible'

new Vue({
  router,
  store,
  i18n,
  render: h => h(app)
}).$mount('#app')
