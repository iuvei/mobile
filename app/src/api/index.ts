/**
 * 项目全部 API 接口定义，每个接口需要描述清楚作用，方便查找
 *
 * @author : zhenda.li
 */

import http from '@/utils/http'

export default {
  /** 获取站点基础信息 */
  getHelpCollaborate() {
    return http.get('/help/collaborate')
  },
  /**
   * 登录
   * @param params 请求参数
   */
  login(params: any) {
    return http.post('/user/login', params)
  },
  /**
   * 验证码登录
   * @param params 请求参数
   */
  loginByCode(params: any) {
    return http.post('/user/loginbycode', params)
  },
  /**
   * 获取图片验证码
   */
  vcode() {
    return http.get('/user/vcode')
  },

  /**
   * 判断图片验证码是否为必填
   */
  needVcode() {
    return http.get('/user/needvcode')
  },

  /**
   * 注册
   * @param params 请求参数
   */
  register(params: any) {
    return http.post('/user/register', params)
  },

  /**
   * 获取注册字段信息
   */
  getRegister() {
    return http.get('/user/register')
  },

  /**
   * 登出
   */
  logout() {
    return http.post('/user/logout')
  },

  /**
   * 修改密码
   * @param params 请求参数
   */
  changePassword(params: any) {
    return http.put('/account/password', params)
  },

  /**
   * 获取第三方客服
   * @param params 请求参数
   */
  service3th() {
    return http.get('/help/service/3th')
  },
  /** 首页 - 获取浮动图 */
  getHomeFloat(params: any) {
    return http.get('/home/float', params)
  },
  /**
   * 首页 - 获取轮播图列表
   * @param params 请求参数
   */
  banners(params: any) {
    return http.get('/home/banner', params)
  },

  /**
   * 首页 - 获取游戏列表
   */
  games() {
    return http.get('/home/menulist')
  },

  /**
   * 首页 - 获取公告
   * @param params 请求参数
   */
  /* 所有公告 */
  noticeList() {
    return http.get('/home/notice/alllist')
  },
  /* 滚动公告 */
  notices() {
    return http.get('/home/notice/h5list')
  },
  /** 首页 - 获取中奖榜单 */
  getWinners() {
    return http.get('/home/winners')
  },
  /** 电子类首页 - 查询分类 & 数据 */
  getEgameCategory(params: any) {
    return http.get('/egame/category', params)
  },
  /** 电子类首页 - 第三方活动 */
  getEgameThirdgameActive(params: any) {
    return http.get('/game/third/active', params)
  },
  /** 电子类首页 - 获取推荐游戏 */
  getEgameRecommend(params: any) {
    return http.get('/egame/recommend', params)
  },
  /** 电子类首页 - 添加收藏游戏 */
  putEgameAddfavorite(params: any) {
    return http.put('/egame/addfavorite', params)
  },
  /** 电子类首页 - 删除收藏游戏 */
  putEgameRemovefavorite(params: any) {
    return http.put('/egame/removefavorite', params)
  },
  /** 电子类首页 - 所有游戏 */
  getEgameGamelist(params: any) {
    return http.get('/egame/gamelist', params)
  },

  /**
   * 获取时区
   */
  timezone() {
    return http.get('/timezone')
  },

  /**
   * 优惠活动 - 获取优惠类型列表
   * @param params 请求参数
   */
  activityTypes() {
    return http.get('/active/types')
  },

  /**
   * 优惠活动 - 获取优惠活动列表
   * @param params 请求参数
   */
  activityList(params: any) {
    return http.get('/active/list', params)
  },

  /**
   * 优惠活动 - 申请优惠
   * @param params 请求参数
   */
  postActiveList(params: any) {
    return http.post('/active/list', params)
  },

  /**
   * 优惠活动 - 获取优惠活动列表
   * @param params 请求参数
   */
  activityDetail(params: any) {
    return http.get('/active/detail', params)
  },

  /**
   * 获取安全中心
   */
  userSafety() {
    return http.get('/safe/info')
  },

  /**
   * 安全中心页 - 设置实名认证
   * @param params 请求参数
   */
  userIdcard(params: any) {
    return http.post('/safe/user/idcard', params)
  },

  /**
   * 安全中心页 - 获取实名认证
   */
  getUserRealname() {
    return http.get('/safe/user/realname')
  },

  /**
   * 安全中心页 - 验证登录密码
   * @param params 请求参数
   */
  userPassword(params: any) {
    return http.post('/safe/user/password/valid', params)
  },

  /**
   * 安全中心页 - 获取手机
   * @param params 请求参数
   */
  getMobile() {
    return http.get('/safe/user/mobile')
  },

  /**
   * 安全中心页 - 获取手机验证码
   * @param params 请求参数
   */
  getVcodeMobile(params: any) {
    return http.post('/safe/user/mobile', params)
  },
  /**
   * 安全中心页 - 设置手机
   * @param params 请求参数
   */
  setUserMobile(params: any) {
    return http.put('/safe/user/mobile', params)
  },
  /**
   * 安全中心页 - 修改手机号码
   * @param params 请求参数
   */
  ediltUserMobile(params: any) {
    return http.patch('/safe/user/mobile', params)
  },

  /**
   * 安全中心页 - 获取邮箱验证码
   * @param params 请求参数
   */
  getVcodeEmail(params: any) {
    return http.post('/safe/user/email', params)
  },

  /**
   * 安全中心页 - 获取邮箱
   * @param params 请求参数
   */
  getEmail() {
    return http.get('/safe/user/email')
  },
  /**
   * 安全中心页 - 设置邮箱
   * @param params 请求参数
   */
  setUserEmail(params: any) {
    return http.put('/safe/user/email', params)
  },
  /**
   * 安全中心页 - 修改邮箱
   * @param params 请求参数
   */
  ediltUserEmail(params: any) {
    return http.patch('/safe/user/email', params)
  },

  /**
   * 安全中心页 - 修改登录密码
   * @param params 请求参数
   */
  setUserPassword(params: any) {
    return http.patch('/safe/user/password', params)
  },

  /**
   * 忘记密码页 - 设置新的登录密码
   * @param params 请求参数
   */
  getUserResetpwd(params: any) {
    return http.get('/user/resetpwd', params)
  },

  /**
   * 忘记密码页 - 设置新的登录密码
   * @param params 请求参数
   */
  userResetpwd(params: any) {
    return http.patch('/user/resetpwd', params)
  },

  /**
   * 安全中心页 - 校验邮箱
   * @param params 请求参数
   */
  userVerificationEmail(params: any) {
    return http.patch('/safe/user/email/valid', params)
  },

  /**
   * 安全中心页 - 校验手机
   * @param params 请求参数
   */
  userVerificationMobile(params: any) {
    return http.patch('/safe/user/mobile/valid', params)
  },
  /**
   * 安全中心页 - 设置提现密码
   * @param params 请求参数
   */
  setUserWithdrawpwd(params: any) {
    return http.put('/safe/user/withdrawpwd', params)
  },

  /**
   * 安全中心页 - 修改提现密码
   * @param params 请求参数
   */
  editUserWithdrawpwd(params: any) {
    return http.patch('/safe/user/withdrawpwd', params)
  },

  /**
   * 安全中心页 - 获取steam跳转地址
   * @param params 请求参数
   */
  apiVcodeGetSteamAuthLink(params: any) {
    return http.get('/api/vcode/getSteamAuthLink', params)
  },

  /**
   * 安全中心页 - 从steam第三方网址登陆后返回到我们的网站，获取steam账号绑定的是哪个用户信息
   * @param params 请求参数
   */
  apiVcodeGtSteamInfo(params: any) {
    return http.get('/api/vcode/getSteamInfo', params)
  },

  /**
   * 安全中心页 - 判断是否绑定了steam账号
   * @param params 请求参数
   */
  apiVcodeBindSteam(params: any) {
    return http.post('/api/vcode/bindSteam', params)
  },

  /**
   * 个人中心页 - 获取了个人中心页的列表
   *
   */
  walletList() {
    return http.get('/help/wallet/list')
  },

  /**
   * 个人中心页 - 获取了全部回收的
   *@param params 请求参数
   */
  walletRecovery() {
    return http.post('/account/wallet/recovery')
  },
  /**
   * 获取个人资料的接口
   * @param params 请求参数
   */
  userBaseinfo() {
    return http.get('/profile/info')
  },

  /**
   * 修改个人资料的接口
   * @param params 请求参数
   */
  userInfoEdit(params: any) {
    return http.post('/profile/info', params)
  },

  /**
   * 获取钱包的接口
   * @param params 请求参数
   */
  wallet() {
    return http.get('/account/wallet')
  },

  /**
   * 获取子钱包列表的接口
   * @param params 请求参数
   */
  childWallet() {
    return http.get('/account/partners')
  },

  /**
   * 获取子钱包信息的接口
   * @param params 请求参数
   */
  getChildWallet(params: any) {
    return http.get('/account/wallet/child', params)
  },

  /**
   * 额度转换页 - 转换的接口
   * @param params 请求参数
   */
  userExchange(params: any) {
    return http.post('/bank/user/exchange', params)
  },

  /**
   * 获取投注记录的分类
   */
  getUserOrderMenu() {
    return http.get('/order/menu')
  },
  /**
   * 获取第三方投注记录
   */
  getUserRecordGames(params: any) {
    return http.get('/order/record/games', params)
  },
  /** 有效投注列表 - 查询 */
  getEffectiveBetting(params: any) {
    return http.get('/order/getEffectiveBetting', params)
  },
  /** 账变记录 - 获取分类 */
  getRecordFrom() {
    return http.get('/order/record/menu')
  },
  /** 账变记录 - 列表数据 */
  getRecordFromsearch(params: any) {
    return http.get('/order/record/fromsearch', params)
  },
  /** 我的优惠-列表数据 */
  getApiUserGetMyCoupon(params: any) {
    return http.get('/account/coupon', params)
  },
  /** 银行卡管理 - 获取数据 */
  getProfileBanklist() {
    return http.get('/profile/banklist')
  },
  /** 银行卡管理 - 解除绑定 */
  deleteProfileBank(params: any) {
    return http.delete('/profile/bank', params)
  },
  /** 银行卡管理 - 查询可添加的银行列表 */
  getProfileBanks() {
    return http.get('/profile/banks')
  },
  /** 银行卡管理 - 添加银行卡信息 */
  postProfileBank(params: any) {
    return http.post('/profile/bank', params)
  },

  /** 试玩页面 - 获取试玩账号接口 */
  getTrialUsername() {
    return http.get('/demo/getuser')
  },
  /** 试玩页面 - 立即试玩接口 */
  postTrial(params: any) {
    return http.post('/demo/register', params)
  },
  /** 试玩页面 - 是否显示免费试玩按钮 */
  homeDemo() {
    return http.get('/home/demo')
  },
  /**
   * 获取消息
   */
  getGeneralMsg(params: any) {
    return http.get('/msg/message/list', params)
  },

  /**
   * 修改消息状态
   */
  changeMsgStatus(params: any) {
    return http.put('/msg/message/status', params)
  },

  /**
   * 删除消息
   */
  deleteMsgStatus(params: any) {
    return http.delete('/msg/message', params)
  },

  /**
   * 获取帮助中心数据
   */
  getHelpCenter() {
    return http.get('/help/bottom')
  },
  /** 第三方游戏登录 */
  postGameThirdLogin(params: any) {
    return http.post('/game/third/login', params)
  },
  /*
   * 获取-提现预申请数据
   */
  getBankWalletWithdraw() {
    return http.get('/bank/wallet/withdraw')
  },
  /*
   * 预申请
   */
  getPreApplication(params: any) {
    return http.post('/bank/wallet/withdrawinfo', params)
  },
  /*
   * 线上提款确认
   */
  confirmWithdrawal(params: any) {
    return http.put('/bank/wallet/withdraw', params)
  },

  /*
   * 下载App
   */
  downloadApp() {
    return http.get('/home/download')
  },

  /*
   * 会员消息 - 未读的会员消息条数
   */
  homeMessageRead() {
    return http.get('/home/message/read')
  },
  /** 充值 - 获取充值信息 */
  getBankWalletRecharge() {
    return http.get('/bank/wallet/recharge')
  },
  /** 充值 - 提交 */
  putBankWalletRecharge(params: any) {
    return http.put('/bank/wallet/recharge', params)
  },
  /** 计算充值可得优惠 */
  getBankWalletCoupon(params: any) {
    return http.get('/bank/wallet/coupon', params)
  },
  /** 充值 - 查询线上充值状态 */
  getBankWalletPayStatus(params: any) {
    return http.get('/bank/wallet/payStatus', params)
  },
  /** 充值 - 公司转账 - 获取入款随机数 */
  getBankWalletOfflineMoney(params: any) {
    return http.get('/bank/wallet/offlineMoney', params)
  },
  /* 获取注册入口开关与steam入口开关状态 */
  getRegisterSetting() {
    return http.get('/home/register/setting')
  },
  /**个人中心 - 存提记录 - 表格 */
  getRecordMoney(params: any) {
    return http.get('/bank/records/money', params)
  },
  /**
   * 查看厅状态
   */
  getCommonStatus() {
    return http.get('/common/status')
  },
  /** 各大类游戏页的 API 相关数据 */
  // 1: 电子游艺
  // 2: 真人视讯
  // 3: 体育竞猜
  // 4: 电竞竞猜
  // 5: 彩票游戏
  // 6 : 棋牌对战
  game(params: any) {
    return http.get('/home/partner', params)
  },
  /** 各大类游戏页的广告轮播图 */
  // 活动类型：
  // 1: PC 首页
  // 2: 电子游艺banner
  // 3: 电子游戏API
  // 4: 真人视讯banner
  // 5: 体育竞技banner
  // 6: 棋牌对战banner
  // 7: 棋牌对战API
  // 8: 彩票游戏banner
  // 9: 电竞精彩banner
  gameBanners(params: any) {
    return http.get('/game/third/active', params)
  },
  /** 获取彩金总额 */
  homeHotGames() {
    return http.get('/home/hotgames')
  }
}
