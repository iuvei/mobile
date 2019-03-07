const state = {
  totalBalance: 0, //总资产
  mainWallet: 0, //主钱包的钱数
  freezeWithdraw: 0, //提款冻结
  totalChildrenBalance: 0, //所有的子钱包钱数
  childLenCount: 0, //计算请求子钱包接口完成的个数
  childWalletArr: [], //子钱包的数组
  loadingCWallet: true, //是否请求完子钱包列表的loading
  isOneRecycle: false, //控制是否一键回收2s内不能点击
  isLoading: false, //是否完成一键回收的请求
  timer: null, //定时器
  isOkExchange: false, //额度转换是否完成并且成功
  /** 控制快速额度转换的弹框对象 */
  exchangeDialog: {
    show: false,
    partner_id: -1,
    childrenBalance: 0,
    childrenName: '',
    extrance_name: 'gameUrl',
    platform: 1,
    category: -1,
    game_code: '',
    return_url: ''
  }
}

export default state
