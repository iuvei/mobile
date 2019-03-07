/**
 * 封装全局帮助接口函数
 *
 * @author : zhenda.li
 */

import Vue from 'vue'
import { alert, confirm } from '@/components/hc-dialog'

/** 是否是调试模式 */
const isDebug = process.env.NODE_ENV !== 'production'

/** 拓展 Vue 原型方法 */

/** 增加打印方法，调试用，生成环境无效 */
Vue.prototype.$log = (message?: any, ...optionalParams: any[]) => {
  if (isDebug) console.log(message, ...optionalParams)
}
/** 增加打印方法(error)，调试用，生成环境无效 */
Vue.prototype.$error = (message?: any, ...optionalParams: any[]) => {
  if (isDebug) console.error(message, ...optionalParams)
}

/** 增加 EventBus 对象，可全局派发事件通信，事件名需在 enums 中的 EventType 中统一定义 */
Vue.prototype.$event = new Vue()

/** 拓展 Date 原型方法 */

/**
 * 对 Date 的扩展，将 Date 转化为指定格式的 String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 *
 * e.g : (new Date()).format("yyyy-MM-dd hh:mm:ss.S") => 2006-07-02 08:09:04.423
 *       (new Date()).format("yyyy-M-d h:m:s.S")      => 2006-7-2 8:9:4.18
 *
 *  @param fmt 格式化公式
 */
Date.prototype.format = function(fmt: string): string {
  let o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
  }
  return fmt
}

/**
 * 对 Date 的扩展，获取今天的日期，格式为 2018-01-01
 */
Date.prototype.getToday = function(): string {
  return this.format('yyyy-MM-dd')
}

/**
 * 返回字符的字节长度（汉字算2个字节）
 * @param {string}{number}
 * @returns {string}   +'...'
 */
Vue.prototype.cutStrForNum = function(str, num) {
  var len = 0
  for (var i = 0; i < str.length; i++) {
    if (str[i].match(/[^\x00-\xff]/gi) != null) len += 2
    else len += 1
  }
  if (len > num * 2) {
    return str.substring(0, num) + '...'
  } else {
    return str
  }
}

// 金额（s）用逗号隔开并保留n位小数
Vue.prototype.$fmoney = function(s, n): string {
  s = s || '0'
  const isNegative = s < 0
  s = Math.abs(s)
  n = n > 0 && n <= 20 ? n : 2
  s = parseFloat((s + '').replace(/[^\d\.-]/g, '')).toFixed(n) + ''
  var l = s
      .split('.')[0]
      .split('')
      .reverse(),
    r = s.split('.')[1]
  var t = ''
  for (var i = 0; i < l.length; i++) {
    t += l[i] + ((i + 1) % 3 == 0 && i + 1 != l.length ? ',' : '')
  }
  return (
    (isNegative ? '-' : '') +
    t
      .split('')
      .reverse()
      .join('') +
    '.' +
    r
  )
}

Vue.prototype.$dialog = { alert, confirm }
