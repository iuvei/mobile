import { Vue, Component, Prop, Model, Watch, Emit } from 'vue-property-decorator'
import HcDialog from './dialog.vue'
import Mutations from '@/store/mutations'

export interface Options {
  title?: string
  message: string
  showConfirmButton?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
  ok?: () => void
  close?: () => void
}

const message = (options: Options) => {
  return new Promise((resolve, reject) => {
    const dialog = new HcDialog({
      el: document.createElement('div')
    })

    const title = (options && options.title) || ''
    const message = (options && options.message) || ''
    const showConfirmButton = options && typeof options.showConfirmButton === 'boolean' ? options.showConfirmButton : true
    const confirmButtonText = (options && options.confirmButtonText) || ''
    const cancelButtonText = (options && options.cancelButtonText) || ''
    const okEvent =
      options && options.ok && typeof options.ok === 'function'
        ? options.ok
        : () => {
            Vue.set(dialog, 'visible', false)
            resolve()
          }
    const closeEvent =
      options && options.close && typeof options.close === 'function'
        ? options.close
        : () => {
            Vue.set(dialog, 'visible', false)
            showConfirmButton ? reject() : resolve()
          }
    Vue.set(dialog, 'title', title)
    Vue.set(dialog, 'message', message)
    Vue.set(dialog, 'showConfirmButton', showConfirmButton)
    Vue.set(dialog, 'confirmButtonText', confirmButtonText)
    Vue.set(dialog, 'cancelButtonText', cancelButtonText)
    Vue.set(dialog, 'visible', false)
    dialog.$on('ok', okEvent)
    dialog.$on('close', closeEvent)
    const $app = document.getElementById('app') as HTMLElement
    $app.appendChild(dialog.$el)

    Vue.nextTick(() => {
      Vue.set(dialog, 'visible', true)
    })
  })
}

export const alert = (options: Options) => {
  return message({
    ...options,
    showConfirmButton: false
  })
}

export const confirm = options => {
  return message({
    ...options,
    showConfirmButton: true
  })
}
