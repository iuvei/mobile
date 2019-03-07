import api from '@/api'
import { Toast } from 'vant'
import { alert } from '@/components/hc-dialog/message'

export default {
  getWebInfo({ commit }) {
    return api.getHelpCollaborate().then((res: any) => {
      if (res.code === 0 && res.data && res.data[0]) {
        commit('updateWebTitle', res.data[0].title)
        commit('updateDocumentTitle')
        commit('updateFavicon', res.data[0].title_icon)
        commit('updateLogo', res.data[0].logo || require('../pages/index/img/logo.svg'))
      }
    })
  },

  // 请求是否显示免费试玩按钮的接口
  getHomeDome({ commit }) {
    return api.homeDemo().then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        commit('updateIsFree', data)
      }
    })
  },

  // 获取注册入口开关与steam入口开关状态
  registerSetting({ commit }) {
    return api.getRegisterSetting().then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        commit('updateRegister', data.register_witch)
        commit('updateSteam', data.steam_witch)
      }
    })
  },

  /** 请求服务器所在的时区和时间 */
  getTimezone({ commit }) {
    api
      .timezone()
      .then((res: any) => {
        if (res.code === 0) {
          commit('updateTimezone', {
            name: res.data.timezone_name,
            utc: res.data.timezone,
            value: new Date(res.data.timestamp.replace(/\-/gi, '/')).getTime(),
            startUp: true
          })
        }
        commit('updateSubscription', 'timezone')
      })
      .catch(err => commit('updateSubscription', 'timezone'))
  },
  /**
   * 访问第三方api之前，检验是否可以前往且查询子钱包余额
   * @param category 游戏类型：1.电子，2.视讯，3.体育，4.电竞，5.彩票，6.棋牌
   * @param support_demo 是否支持试玩
   * */
  gotoAPI({ dispatch, commit, state }: any, { partner_id, partner_name, game_code, category, return_url, support_demo }: any) {
    /** @note 未登录不能进入第三方游戏，显示登录弹窗 */
    const { token, userType } = state.user
    commit('wallet/updateExchangeDialog', {
      category,
      partner_id,
      partner_name: partner_name,
      game_code: game_code || '',
      return_url: return_url || ''
    })
    if (token.length === 0) {
      alert({ message: `请先登录！` })
    } else if (userType === '1') {
      // 如果是试玩账号登录
      if (support_demo) {
        dispatch('openAPI')
      } else {
        Toast.fail('仅支持正式账号')
      }
    } else {
      commit('loadingToggle')
      api
        .getChildWallet({ partner_id })
        .then((res: any) => {
          commit('loadingToggle')
          if (res.code === 0) {
            const { token, userType } = state.user
            const { balance, name } = res.data
            if (balance >= 10) {
              dispatch('openAPI')
            } else {
              commit('wallet/updateExchangeDialog', {
                show: true,
                childrenBalance: balance,
                childrenName: name.replace('子钱包', '')
              })
            }
          } else {
            Toast.fail(res.msg)
          }
        })
        .catch(err => commit('loadingToggle'))
    }
  },
  /** 前往第三方api */
  openAPI({ dispatch, commit, state }: any) {
    const { userType } = state.user
    const { partner_id, partner_name, game_code, category, return_url } = state.wallet.exchangeDialog
    const formData: any = {
      partner_name,
      game_code,
      game_type: category,
      extrance_name: 'gameUrl',
      platform: 1,
      return_url
    }
    // 如果是试玩账号的第三方登录，需要加上is_trial为1
    if (userType === '1') {
      formData['is_trial'] = 1
    }
    commit('loadingToggle')
    api
      .postGameThirdLogin(formData)
      .then((res: any) => {
        if (res.code === 0) {
          location.href = res.data.url
        } else {
          alert({ message: res.msg || `ERROR!` })
        }
        commit('loadingToggle')
      })
      .catch(err => {
        commit('loadingToggle')
      })
  }
}
