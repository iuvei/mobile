<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import Notice from '@/components/notice/index.vue'
import api from '@/api'
import _ from 'lodash'
import { Action, Mutation, State, namespace } from 'vuex-class'

const USER = namespace('user')
const WALLET = namespace('user')

@Component
export default class Index extends Vue {
  @USER.State token
  @USER.State userType
  @State isLoading
  @Mutation loadingToggle
  @State logo
  @State hcgame
  @State registerSwitch
  @WALLET.Mutation updateExchangeDialog
  @Action gotoAPI

  banners: any = []
  games = []

  isLogin: boolean = false

  showRegister: boolean = true

  appDownload: any = {}
  isAndroid: boolean = false
  isIOS: boolean = false

  activated() {
    this.requestBanners()
    this.requestGames()
    this.getAppDownloadData()
    this.isLogin = !this.token
  }

  created() {
    this.setInvitCode()
  }

  /*
   * 获取-注册邀请码
   */
  setInvitCode() {
    const { code } = this.$route.query
    if (code) {
      sessionStorage.setItem('invite_code', code)
    }
  }

  requestBanners() {
    let params = {
      type: 2 // 1 : PC 2 : H5
    }

    api
      .banners(params)
      .then((response: any) => {
        if (response.code == 0) {
          if (response.data.length > 0) {
            this.banners = response.data
          } else {
            // 若无数据返回，取本地的banner图片
            this.banners = [{ picture: require('./img/banner/default_banner1.png') }, { picture: require('./img/banner/default_banner2.png') }]
          }
        }
      })
      .catch(error => {})
  }

  requestGames() {
    api
      .games()
      .then((response: any) => {
        if (response.code == 0) {
          this.games = response.data
        }
      })
      .catch(error => {})
  }

  getAppDownloadData() {
    api
      .downloadApp()
      .then((res: any) => {
        if (res.code === 0) {
          let u = navigator.userAgent
          this.isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 //android
          this.isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) //ios
          this.appDownload = res.data
        }
      })
      .catch(err => {})
  }
  /* 下载App */
  onDownloadClick() {
    if (this.isAndroid) {
      location.href = this.appDownload.qrcode_android
    } else if (this.isIOS) {
      location.href = this.appDownload.qrcode_ios
    }
  }

  onLoginClick() {
    this.$router.push('/my/login')
  }
  onRegisterClick() {
    this.$router.push('/register')
  }
  getCategoryImg(item) {
    let imgSrc = /^http[s]?:\/\/.+/.test(item.img_url) ? item.img_url : `.${item.img_url}`,
      url = ''
    if (/^http[s]?:\/\/.+/.test(item.img_url)) {
      return item.img_url
    } else {
      const img_url = item.img_url || ''
      try {
        const type = (img_url.match(/\/img\/type\/(\S*)\.png/) as any)[1]
        url = require(`./img/type/${type}.png`)
      } catch (err) {
        url = require('./img/type/hot.png')
      }
      return url
    }
  }
  goto(item) {
    /** 是棋牌（category === 6）或电子（category === 1） */
    if (item.category === 1 || item.category === 6) {
      /** 跳到电子类首页 */
      // typ:请求轮播图用的
      // category：请求/egame/category给这个接口电子类型和棋牌类型加多参数game_type
      //
      this.$router.push({
        path: `/game?type=${item.iconkey.toLocaleUpperCase()}&partner_id=${item.partner_id}&typ=${item.category === 1 ? 3 : 7}&category=${item.category}`
      })
    } else {
      /** 打开快速额度转换 */
      this.gotoAPI({
        partner_id: item.partner_id,
        partner_name: item.iconkey,
        game_code: item.game_id,
        category: item.category,
        support_demo: !!item.is_trial
      })
    }
  }
}
interface ChildState {
  name: string
  balance: string
  transfer: any
  partner_id: string
}
</script>