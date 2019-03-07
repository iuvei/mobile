/**
 * rootState 根节点数据
 *
 * @author zhenda.li
 */

const state: State = {
  /** 主题 */
  theme: 'live',
  /** 站点标题 */
  webTitle: '皇朝国际',
  /** 页面标题 */
  pageTitle: '',
  /** 站点icon */
  favicon: '',
  /** 站点logo */
  logo: '',
  /** 本地语言 */
  locale: sessionStorage.getItem('locale') || 'zh-CN',

  /** 是否显示loading */
  isLoading: false,

  /** 是否显示免费试玩 */
  isFree: 'true',

  /** 是否显示注册入口开关状态 */
  registerSwitch: true,

  /** 是否显示steam入口开关状态 */
  steamSwitch: false,

  // 打开人工服务的计数器
  serviceCount: 0,

  // 登录公告显示
  loginNotice: false,

  // hc game对应的游戏以及id，多处使用，所以存在这里
  hcgame: [
    { iconkey: 'lol', name: '英雄联盟', game_id: 1, img_url: require('@/pages/index/img/logo/lol.png') },
    { iconkey: 'gok', name: '王者荣耀', game_id: 2, img_url: require('@/pages/index/img/logo/gok.png') },
    { iconkey: 'dota2', name: 'DOTA2', game_id: 3, img_url: require('@/pages/index/img/logo/dota2.png') },
    { iconkey: 'csgo', name: 'CS：GO', game_id: 4, img_url: require('@/pages/index/img/logo/csgo.png') },
    { iconkey: 'pubg', name: '绝地求生', game_id: 5, img_url: require('@/pages/index/img/logo/pubg.png') },
    { iconkey: 'overwatch', name: '守望先锋', game_id: 6, img_url: require('@/pages/index/img/logo/overwatch.png') },
    { iconkey: 'starcraft2', name: '星际争霸2', game_id: 7, img_url: require('@/pages/index/img/logo/starcraft2.png') },
    { iconkey: 'warcraft3', name: '魔兽争霸3', game_id: 8, img_url: require('@/pages/index/img/logo/warcraft3.png') },
    { iconkey: 'hearthstone', name: '炉石传说', game_id: 9, img_url: require('@/pages/index/img/logo/hearthstone.png') }
  ],

  /** 服务器所在时区和时间 */
  timezone: {
    name: '', // 时区名字
    utc: '', // utc时间
    value: 0, // 时间戳
    startUp: false // 是否开启计时
  },

  /** 订阅数据，页面开始渲染前的数据请求 */
  subscription: {
    timezone: false // 获取服务器时间
  },

  /** 页面禁止滚动 */
  noScroll: false
}

export interface State {
  theme: string
  webTitle: string
  pageTitle: string
  favicon: string
  logo: string
  locale: string
  isLoading: boolean
  isFree: string
  registerSwitch: boolean
  steamSwitch: boolean
  serviceCount: number
  hcgame: any[]
  timezone: Timezone
  subscription: { [key: string]: boolean }
  loginNotice: boolean
  noScroll: boolean
}

interface Timezone {
  name: string // 时区名字
  utc: string // utc时间
  value: number // 时间戳
  startUp: boolean // 是否开启计时
}

export default state
