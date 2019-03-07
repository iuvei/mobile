const config = {
  baseURL: getApi() // 'https://api-master.wlcasino.me'
}

export default config

function getApi(): string {
  // 域名访问
  const arr = document.domain.split('.')
  return window.location.protocol + '//' + 'api-user.' + arr.slice(arr.length - 2).join('.')
}
