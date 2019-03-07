const userItem = localStorage.getItem('user') || sessionStorage.getItem('user') || ''
let user: any = {}
if (userItem.length) {
  user = JSON.parse(userItem)
}
const state = {
  token: (user && user.token) || '', // 用户 token
  username: (user && user.username) || '', // 用户名
  userType: (user && user.userType) || '', //如果为“1”是试玩账号
  messageNum: Number(sessionStorage.getItem('message')) || '' //会员消息的条数
}

export default state
