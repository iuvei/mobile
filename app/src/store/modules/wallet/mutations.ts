import { stat } from 'fs'

export default {
  /**
   * 更新 主钱包
   */
  initBalance(state: any) {
    state.totalBalance = 0
    state.totalChildrenBalance = 0
    state.freezeWithdraw = 0
    state.mainWallet = 0
  },

  /**
   * 更新 主钱包和冻结金额
   */
  updateMainWalletObj(state: any, obj: any) {
    const { freeze_withdraw, balance } = obj
    state.freezeWithdraw = Number(freeze_withdraw) || 0
    state.mainWallet = Number(balance) || 0
  },

  /**
   * 更新 所有的子钱包钱数
   */
  updateAllBalance(state: any) {
    const { childWalletArr } = state
    let count = 0
    childWalletArr &&
      childWalletArr.length &&
      childWalletArr.map((obj: any) => {
        const { balance } = obj
        if (balance !== '获取失败') {
          count += balance
        }
      })
    state.totalChildrenBalance = count
    state.totalBalance = count + state.mainWallet + state.freezeWithdraw
  },

  /**
   * 更新 请求子钱包接口完成的个数
   */
  updateChildLenCount(state: any, obj: any) {
    switch (obj.type) {
      case 'add':
        // state.childWalletArr.length === state.childLenCount 避免快速切换个人中心里面的我的账户和额度转换，请求子钱包速度很慢，造成childLenCount计算错误
        state.childLenCount = state.childWalletArr.length === state.childLenCount ? state.childLenCount : state.childLenCount + 1
        break
      case 'reduce':
        state.childLenCount = state.childLenCount - 1
        break
      case 'clear':
        state.childLenCount = 0
    }
  },

  /**
   * 更新 子钱包的数组
   */
  updateChildWalletArr(state: any, obj: any) {
    // obj = {arr:arr,index,isShowValue }
    let { arr, index, isShow, balance } = obj
    if (isShow !== undefined) {
      arr[index]['isShow'] = isShow
    }
    if (balance !== undefined) {
      arr[index]['balance'] = balance
    }
    state.childWalletArr = arr || []
  },

  /**
   * 更新 请求完子钱包列表的loading
   */
  updateloadingCWallet(state: any, loadingCWallet: boolean) {
    state.loadingCWallet = loadingCWallet
  },

  /**
   * 更新 控制是否一键回收
   */
  updateIsOneRecycle(state: any, isOneRecycle: boolean) {
    state.isOneRecycle = isOneRecycle
  },

  /**
   * 更新 是否完成一键回收的请求
   */
  updateIsLoading(state: any, isLoading: boolean) {
    state.isLoading = isLoading
  },

  /**
   * 更新 额度转换是否完成并且成功
   */
  updateIsOkExchange(state: any, isOkExchange: boolean) {
    state.isOkExchange = isOkExchange
  },

  /**
   * 更新 一键回收的定时器
   */
  updateTimer(state: any, obj: any) {
    // obj={timer,type}
    let { timer, type } = obj
    switch (type) {
      case 'create':
        state.timer = timer

        break
      case 'clear':
        state.timer && clearInterval(state.timer)
    }
  },
  /** 更新显示快速额度转换的弹框 */
  updateExchangeDialog(state: any, exchangeDialog: any) {
    state.exchangeDialog = { ...state.exchangeDialog, ...exchangeDialog }
  }
}
