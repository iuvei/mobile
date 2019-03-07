const config = {
  baseURL: getApi() // 'http://test.api-user.uniform.com'
}

export default config

function getApi(): string {
  // 域名访问
  const arr = document.domain.split('.')
  return window.location.protocol + '//' + 'test.api-user.' + arr.slice(arr.length - 2).join('.')
}
