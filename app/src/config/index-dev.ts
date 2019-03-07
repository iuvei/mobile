const config = {
  baseURL: getApi() // 'http://dev.api-user.uniform.com'
}

export default config

function getApi(): string {
  // 域名访问
  const arr = document.domain.split('.')
  return window.location.protocol + '//' + 'dev.api-user.' + arr.slice(arr.length - 2).join('.')
}
