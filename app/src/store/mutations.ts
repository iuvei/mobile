import i18n from '@/i18n'

export default {
  /** 设置主题 */
  updateTheme(state: any, theme: string) {
    state.theme = theme || state.theme
  },
  /** 更新站点标题 */
  updateWebTitle(state: any, webTitle: string) {
    state.webTitle = webTitle
  },
  /** 更新页面标题 */
  updatePageTitle(state: any, pageTitle: string) {
    state.pageTitle = pageTitle
  },
  /** 更新document.title */
  updateDocumentTitle(state: any) {
    if (state.pageTitle) {
      document.title = state.webTitle + ' - ' + state.pageTitle
    } else {
      document.title = state.webTitle
    }
  },
  /** 更新站点icon */
  updateFavicon(state: any, favicon: any) {
    state.favicon = favicon
    ;(document.getElementById('favicon') as HTMLLinkElement).href = favicon
  },
  /** 更新站点logo */
  updateLogo(state: any, logo: any) {
    state.logo = logo
  },
  /**
   * 更新语言：zh-CN | zh-TW | en-US | ms-MY
   */
  updateLocale(state: any, locale: string) {
    state.locale = locale
    i18n.locale = locale
    sessionStorage.setItem('locale', locale)
  },

  /**
   * 切换loading状态
   */
  loadingToggle(state: any, isLoading?: boolean) {
    if (typeof isLoading !== 'boolean') {
      state.isLoading = !state.isLoading
    } else {
      state.isLoading = isLoading
    }
  },

  // 更新免费试玩按钮的状态
  updateIsFree(state: any, isFree: string) {
    state.isFree = isFree
  },

  // 更新注册入口开关状态
  updateRegister(state: any, registerSwitch: boolean) {
    state.registerSwitch = registerSwitch
  },

  // 更新steam入口开关状态
  updateSteam(state: any, steamSwitch: boolean) {
    state.steamSwitch = steamSwitch
  },

  // 更新登录公告
  updateLoginNotice(state: any, loginNotice: boolean) {
    state.loginNotice = loginNotice
  },

  /** 更新时区信息 */
  updateTimezone(state: any, timezone: any) {
    state.timezone = timezone
  },

  /** 订阅数据，状态更新 */
  updateSubscription(state: any, key: string) {
    state.subscription[key] = true
  },

  /** 打开人工服务 */
  openService(state: any) {
    state.serviceCount++
  },

  /** 页面禁止滚动开关 */
  toggleNoScroll(state: any, noScroll?: boolean) {
    state.noScroll = typeof noScroll === 'boolean' ? noScroll : !state.noScroll
  }
}
