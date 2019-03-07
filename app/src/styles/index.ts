import './common.styl'

import store from '@/store'

const { theme } = store.state

require(`./${theme}/common.styl`)
