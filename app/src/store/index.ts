import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import state, { State } from './state'
import mutations from './mutations'
import actions from './actions'
import user from './modules/user'
import wallet from './modules/wallet'

Vue.use(Vuex)

const isDebug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store<State>({
  state,
  mutations,
  actions,
  modules: {
    user,
    wallet
  },
  strict: isDebug,
  plugins: isDebug
    ? [
        createLogger({
          filter: mutation => mutation.type !== 'updateTimezone' && mutation.type.indexOf('wallet') === -1 // 时区时间变化和钱包的不打logger
        })
      ]
    : []
})

export default store
