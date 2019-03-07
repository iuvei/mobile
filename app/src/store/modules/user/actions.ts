import api from '@/api'

export default {
  getMessageRead({ commit }) {
    return api.homeMessageRead().then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        const { number } = data
        sessionStorage.setItem('message', number)
        commit('updateMessage', number)
      }
    })
  }
}
