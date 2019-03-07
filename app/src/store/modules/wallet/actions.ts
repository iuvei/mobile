import api from '@/api'
import { Toast } from 'vant'

// 注意：
// state.exchangeDialog.show：当快速额度转换弹框打开时，不走计算总资产逻辑
export default {
  /** 请求主钱包的接口 */
  requestMainWallet({ state, commit }) {
    api.wallet().then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        commit('updateMainWalletObj', data)
        // 当快速额度转换弹框打开时，不走计算总资产逻辑
        !state.exchangeDialog.show && commit('updateAllBalance')
      }
    })
  },

  /** 请求子钱包列表 */
  requestChildWalletArr({ commit, dispatch }) {
    commit('updateloadingCWallet', true)
    api
      .childWallet()
      .then((res: any) => {
        let { code, data } = res
        if (code === 0) {
          // 组装子钱包数组数据
          if (data && data.length) {
            for (let i = 0; i < data.length; i++) {
              const { partner_id } = data[i]
              data[i] = { ...data[i], isShow: false, balance: 0 }
            }
          }
        }
        commit('updateChildWalletArr', { arr: data || [] })
        data &&
          data.length &&
          data.map((obj: any, index: number) => {
            const { partner_id } = obj
            dispatch('requestChildWallet', { partner_id, index })
          })

        commit('updateloadingCWallet', false)
        commit('updateChildLenCount', { type: 'clear' })
      })
      .catch(err => {
        commit('updateloadingCWallet', false)
      })
  },

  /** 请求具体子钱包的情况 */
  requestChildWallet({ state, commit, dispatch }, { partner_id, index }) {
    let isUpdate: boolean = true
    // 标志如果是弹框的里面的方法，则不执行关于钱包的计算
    const isExDialog = state.exchangeDialog.show
    if (!isExDialog) {
      commit('updateChildWalletArr', { arr: state.childWalletArr, index, isShow: false, balance: 0 })
      isUpdate = partner_id === state.childWalletArr[index].partner_id
    }
    api
      .getChildWallet({ partner_id })
      .then((res: any) => {
        const { code, data } = res
        let tempBalance: any = 0
        if (code === 0) {
          tempBalance = (data && Number(data.balance)) || 0
        } else {
          tempBalance = '获取失败'
        }
        if (isExDialog) {
          commit('updateExchangeDialog', { ...state.exchangeDialog, childrenBalance: tempBalance })
          return
        }
        if (isUpdate) {
          commit('updateChildWalletArr', { arr: state.childWalletArr, index, isShow: true, balance: tempBalance })
          commit('updateChildLenCount', { type: 'add' })
          tempBalance !== '获取失败' && commit('updateAllBalance')
        }
      })
      .catch((error: any) => {
        if (isExDialog) {
          commit('updateExchangeDialog', { ...state.exchangeDialog, childrenBalance: '获取失败' })
          return
        }
        if (isUpdate) {
          commit('updateChildWalletArr', { arr: state.childWalletArr, index, isShow: true, balance: '获取失败' })
          commit('updateChildLenCount', { type: 'add' })
        }
      })
  },

  /** 全部刷新 */
  allRefresh({ commit, dispatch }) {
    // 清空总资产，所有子钱包的总钱数
    commit('initBalance')

    // 从本地获取上次充值、提现或额度转换请求的时间戳，若间隔小于2s，禁用请求
    const requestLimitStr = localStorage.getItem('requestLimit') || '{ "prev": 0 }',
      requestLimit = JSON.parse(requestLimitStr),
      time = 2000 - (new Date().getTime() - requestLimit.prev)
    if (time > 0) {
      commit('updateIsOneRecycle', true)
      commit('updateTimer', { type: 'clear' })
      const timer = setTimeout(() => {
        commit('updateIsOneRecycle', false)
        commit('updateTimer', { type: 'clear' })
      }, time)
      commit('updateTimer', { timer, type: 'create' })
    }
    // 请求主钱包和各个子钱包的钱数
    dispatch('requestMainWallet')
    dispatch('requestChildWalletArr')
  },

  /** 刷新单个钱包 */
  reflreshChildWallet({ state, commit, dispatch }, index) {
    commit('updateChildLenCount', { type: 'reduce' })
    const { partner_id } = state.childWalletArr[index]
    // 刷新主钱包
    dispatch('requestMainWallet')
    // 刷新该子钱包
    dispatch('requestChildWallet', { partner_id, index })
  },

  /** 2s后再请求的逻辑 */
  setSecondAble({ state, commit }) {
    commit('updateIsOneRecycle', true)
    localStorage.setItem('requestLimit', JSON.stringify({ prev: new Date().getTime() }))
    commit('updateTimer', { type: 'clear' })
    const timer = setTimeout(() => {
      commit('updateIsOneRecycle', false)
      commit('updateTimer', { type: 'clear' })
    }, 2000)
    commit('updateTimer', { timer, type: 'create' })
  },

  /** 一键回收 */
  oneRecycle({ state, commit, dispatch }) {
    // 2s后再请求的逻辑
    dispatch('setSecondAble')

    commit('updateIsLoading', true)
    commit('loadingToggle', true, { root: true })
    commit('updateIsOkExchange', false)
    api
      .walletRecovery()
      .then((res: any) => {
        commit('loadingToggle', false, { root: true })
        const { code, msg } = res
        if (code === 0) {
          Toast.success('全部回收成功')
          // 分快速额度转换弹框的情况
          // 1，是快速额度转换的一键回收的话，就先请求对应的子钱包的金额，通过改变快速额度转换的弹框对象，来发主钱包的请求（已写到了快速额度转换的组建里面了）
          // 2，是个人中心的话，就走刷新页面的逻辑
          if (state.exchangeDialog.show) {
            dispatch('requestChildWallet', { partner_id: state.exchangeDialog.partner_id })
          } else {
            dispatch('allRefresh')
          }
          commit('updateIsOkExchange', true)
        } else {
          Toast.fail(msg)
        }
        commit('updateIsLoading', false)
      })
      .catch((error: any) => {
        commit('loadingToggle', false, { root: true })
        commit('updateIsLoading', false)
        Toast.fail('全部回收失败，请稍后重试')
      })
  },

  /** 额度转换 */
  moneyConversion({ state, commit, dispatch }, { param, index }) {
    // 2s后再请求的逻辑
    dispatch('setSecondAble')

    commit('updateIsLoading', true)
    commit('loadingToggle', true, { root: true })
    commit('updateIsOkExchange', false)
    api
      .userExchange(param)
      .then((res: any) => {
        commit('loadingToggle', false, { root: true })

        const { msg, code } = res
        if (code === 0) {
          Toast.success(`${param.type === 1 ? '子钱包' : '主钱包'}转入成功`)
          // 刷新子钱包
          // 分快速额度转换弹框的情况
          // 1，是快速额度转换的一键回收的话，就先请求对应的子钱包的金额，通过改变快速额度转换的弹框对象，来发主钱包的请求（已写到了快速额度转换的组建里面了）
          // 2，是个人中心的额度转换页的话，就走刷新子钱包和主钱包的逻辑
          if (state.exchangeDialog.show) {
            // 直接请求子钱包的金额
            dispatch('requestChildWallet', { partner_id: state.exchangeDialog.partner_id })
          } else {
            // 刷新子钱包和主钱包的
            dispatch('reflreshChildWallet', index)
          }
          commit('updateIsOkExchange', true)
        } else {
          Toast.fail(msg)
        }
        commit('updateIsLoading', false)
      })
      .catch((error: any) => {
        commit('loadingToggle', false, { root: true })
        commit('updateIsLoading', false)
        Toast.fail('额度转换失败，请稍后重试')
      })
  }
}
