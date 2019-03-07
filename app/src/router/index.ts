import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import modulesState from '@/store/modules/user/state'
import _ from 'lodash'
import { Toast } from 'vant'

Vue.use(Router)

store.commit('updateTheme', window.theme)

const { theme } = store.state

const Home = () => import('@/pages/home/index.vue')

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Home,
      meta: {
        title: '首页'
      },
      children: [
        {
          path: '',
          component: () => import(`@/pages/index/${theme}/index.vue`),
          props: route => ({ type: Number(route.query.type || 0) })
        },
        {
          path: 'category-egame',
          component: () => import('@/pages/category/category-egame/index.vue'),
          meta: {
            title: '电子游艺'
          }
        },
        {
          path: 'category-card',
          component: () => import('@/pages/category/category-card/index.vue'),
          meta: {
            title: '棋牌对战'
          }
        },
        {
          path: 'category-esport',
          component: () => import('@/pages/category/category-esport/index.vue'),
          meta: {
            title: '电竞竞猜'
          }
        },
        {
          path: 'category-sport',
          component: () => import('@/pages/category/category-sport/index.vue'),
          meta: {
            title: '体育博弈'
          }
        },
        {
          path: 'category-lottery',
          component: () => import('@/pages/category/category-lottery/index.vue'),
          meta: {
            title: '彩票游戏'
          }
        },
        {
          path: 'category-live',
          component: () => import('@/pages/category/category-live/index.vue'),
          meta: {
            title: '真人视讯'
          }
        }
      ]
    },
    {
      path: '/trial',
      component: Home,
      meta: {
        title: '免费试玩'
      },
      children: [
        {
          path: '',
          component: () => import('@/pages/trial/index.vue')
        }
      ]
    },
    {
      path: '/activity',
      component: Home,
      meta: {
        title: '优惠活动'
      },
      children: [
        {
          path: '',
          component: () => import('@/pages/activity/index.vue')
        },
        {
          path: 'detail',
          component: () => import('@/pages/activity/pages/detail/index.vue'),
          props: route => ({ id: route.query.id }),
          meta: {
            title: '优惠详情',
            tabbar: false
          }
        }
      ]
    },
    {
      path: '/exchange',
      component: Home,
      meta: {
        title: '额度转换'
      },
      children: [
        {
          path: '',
          component: () => import('@/pages/my/pages/exchange/index.vue'),
          meta: {
            tabbar: false
          }
        }
      ]
    },
    {
      path: '/game',
      component: Home,
      meta: {
        title: ''
      },
      children: [
        {
          path: '',
          component: () => import('@/pages/game/index.vue'),
          props: route => ({ type: route.query.type })
        },
        {
          path: 'recommend',
          component: () => import('@/pages/game/pages/recommend/index.vue')
        },
        {
          path: 'search',
          component: () => import('@/pages/game/pages/search/index.vue'),
          props: route => ({ type: route.query.type })
        }
      ]
    },
    {
      path: '/register',
      component: Home,
      meta: {
        title: '会员注册'
      },
      children: [
        {
          path: '',
          component: () => import('@/pages/my/pages/register/index.vue'),
          meta: {
            tabbar: false
          }
        }
      ]
    },
    {
      path: '/my',
      component: Home,
      meta: {
        title: '我的'
      },
      children: [
        {
          path: '',
          component: () => import('@/pages/my/index.vue')
        },
        {
          path: 'login',
          component: () => import('@/pages/my/pages/login/index.vue'),
          meta: {
            title: '用户登录',
            tabbar: false
          }
        },
        {
          path: 'bank-card',
          component: () => import('@/pages/my/pages/bank-card/index.vue'),
          meta: {
            title: '银行卡管理'
          }
        },
        {
          path: 'security',
          component: () => import('@/pages/my/pages/security/index.vue'),
          meta: {
            title: '安全中心',
            tabbar: false
          }
        },
        {
          path: 'profile',
          component: () => import('@/pages/my/pages/profile/index.vue'),
          meta: {
            title: '个人资料'
          }
        },
        {
          path: 'add-bank-card',
          component: () => import('@/pages/my/pages/add-bank-card/index.vue'),
          meta: {
            title: '添加银行卡'
          }
        },
        {
          path: 'withdrawal',
          component: () => import('@/pages/my/pages/withdrawal/index.vue'),
          meta: {
            title: '提现',
            tabbar: false
          }
        },
        {
          path: 'message',
          component: () => import('@/pages/my/pages/message/index.vue'),
          meta: {
            title: '会员消息',
            tabbar: false
          }
        },
        {
          path: 'help-center',
          component: () => import('@/pages/my/pages/help-center/index.vue'),
          meta: {
            title: '帮助中心',
            tabbar: false
          }
        },
        {
          path: 'recharge',
          component: () => import('@/pages/my/pages/recharge/index.vue'),
          meta: {
            title: '充值',
            tabbar: false
          }
        },
        {
          path: 'orders',
          component: () => import('@/pages/my/pages/orders/index.vue'),
          meta: {
            title: '投注记录',
            tabbar: false
          }
        },
        {
          path: 'effective-orders',
          component: () => import('@/pages/my/pages/effective-orders/index.vue'),
          meta: {
            title: '有效投注列表',
            tabbar: false
          }
        },
        {
          path: 'records',
          component: () => import('@/pages/my/pages/records/index.vue'),
          meta: {
            title: '账变记录',
            tabbar: false
          }
        },
        {
          path: 'sales',
          component: () => import('@/pages/my/pages/sales/index.vue'),
          meta: {
            title: '我的优惠',
            tabbar: false
          }
        },
        {
          path: 'find-password',
          component: () => import('@/pages/my/pages/find-password/index.vue'),
          meta: {
            title: '忘记密码',
            tabbar: false
          }
        },
        {
          path: 'deposit',
          component: () => import('@/pages/my/pages/deposit/index.vue'),
          meta: {
            title: '存提记录',
            tabbar: false
          }
        }
      ]
    },
    {
      path: '/maintain',
      component: () => import('@/pages/maintain/index.vue'),
      meta: {
        title: '维护页面'
      }
    },

    {
      path: '*',
      component: () => import('@/pages/404/index.vue'),
      meta: {
        title: '404'
      }
    }
  ]
})

// 需要登录才可以跳转的路由,如果没有登录就跳转到登录页面
const needLoginRouter = {
  'bank-card': '', //银行卡管理
  security: '', //安全中心
  profile: '', //个人资料
  'add-bank-card': '', //添加银行卡
  withdrawal: '', //提现
  'game-notice': '', //游戏公告
  message: '', //会员消息
  // 'help-center': '', //帮助中心
  recharge: '', //充值
  orders: '', //投注记录
  'effective-orders': '', // 有效投注记录
  records: '', //账变记录
  sales: '', //我的优惠
  exchange: '', //额度转换
  game: '', //第三方电子游戏
  recommend: '', //第三方电子游戏推荐页面
  search: '', //第三方电子游戏搜索页面
  detail: '' // 优惠活动详情
}

// 免费试玩不能跳转的页面 权限控制
const freeLoginRouter = {
  'bank-card': '', //银行卡管理
  orders: '', //投注记录
  'effective-orders': '', // 有效投注记录
  security: '', //安全中心
  profile: '', //个人资料
  'add-bank-card': '', //添加银行卡
  withdrawal: '', //提现
  'game-notice': '', //游戏公告
  recharge: '', //充值
  records: '', //账变记录
  exchange: '', //额度转换
  sales: '', //我的优惠
  message: '', //会员消息
  detail: '' // 优惠活动详情
}

router.beforeEach((to, from, next) => {
  // 路由发生变化修改页面标题
  store.commit('updatePageTitle', to.matched.reduce((p, c) => (c.meta.title ? c : p)).meta.title || '')
  store.commit('updateDocumentTitle')

  const toPathArr = to.path.split('/')
  const toPath = toPathArr[toPathArr.length - 1]
  const { token, userType } = modulesState

  if (!token.length) {
    // 满足没有登录时的条件,跳转到登录页面
    toPath in needLoginRouter && next('/my/login')
    next()
  } else if (userType === '1' && toPath in freeLoginRouter) {
    // 登录了，如果是试玩账号，则不跳转
    Toast.fail('仅支持正式账号')
    next(false)
  } else {
    next()
  }
})

export default router
