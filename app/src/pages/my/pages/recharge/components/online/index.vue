<template lang="pug" src="./index.pug"></template>

<style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Row, Col, Collapse, CollapseItem, CellGroup, Cell, Switch, Toast, Radio, RadioGroup } from 'vant'
import api from '@/api'
import BScroll from 'better-scroll'

@Component({
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [CellGroup.name]: CellGroup,
    [Cell.name]: Cell,
    [Switch.name]: Switch,
    [Radio.name]: Radio,
    [RadioGroup.name]: RadioGroup
  }
})
export default class RechargeOnline extends Vue {
  @Prop(Object) data!: any
  // @Prop(Array) moneyList!: number[]
  @Prop(Boolean) disabled!: boolean

  formData: FormData = {
    type: '' /**类型：线上充值 */,
    scene: '',
    money: '0',
    active_id: '0' /** 请求优惠后，设置为第一个优惠的id */,
    /**以下为选择优惠后需要提交的参数 */
    active_money: 0,
    active_type: 0,
    active_prize: 0,
    id: '',
    upper_limit: 0
  }
  moneyList: any = []
  reapProfit: number = 0
  paymentMethods: any[] = [] /** 支付方式 */
  isInput: boolean = false
  depositMoneyInput: string = ''
  depositMoneyMax: number = 1000 /** 请求最大值 */
  depositMoneyMin: number = 10 /** 请求最小值 */
  discountActiveShow: string = '1'
  discountActives: any[] = [] /** 优惠活动 */
  mounted() {
    this.formData.scene = this.data.list[0].scene || ''
    this.moneyList = this.data.list[0] ? this.data.list[0].scene_list : []
    this.formData.type = this.data.list[0].type
    this.formData.id = this.data.list[0].scene_list.length ? this.data.list[0].scene_list[0].id : ''
    this.paymentMethods = this.data.list || []
    this.discountActives = (this.data.active || []).filter(v => v.id != '0')
    this.discountActives[0] && this.selectDiscountActive(this.discountActives[0])
    this.depositMoneyMax = this.data.list[0].scene_list[0].once_max_limit
    this.depositMoneyMin = this.data.list[0].scene_list[0].once_min_limit
  }
  paymentMethodChange(item) {
    this.formData.scene = item.scene
    this.formData.type = item.type
    this.formData.id = item.scene_list[0].id
    this.depositMoneyMax = item.scene_list[0].once_max_limit
    this.depositMoneyMin = item.scene_list[0].once_min_limit
    this.moneyList = item.scene_list
  }
  selectMoney(money) {
    this.isInput = false
    this.depositMoneyInput = ''
    this.formData.id = money.id
    this.depositMoneyMax = money.once_max_limit
    this.depositMoneyMin = money.once_min_limit
    this.updateDiscount()
  }
  inputMoney() {
    // this.isInput = true
    if (!this.depositMoneyInput) {
      this.formData.money = ''
      return
    } else if (!/^[+]?(0|([1-9]\d*))(\.\d+)?$|^[0-9]\d*(\.|[0-9])$/g.test(this.depositMoneyInput)) {
      this.depositMoneyInput = this.depositMoneyInput.replace(/\D/g, '')
    }

    // 控制输入的长度
    const isDote = /\./.test(this.depositMoneyInput)
    const tempLen = this.depositMoneyInput.length
    if (!isDote && tempLen > 9) {
      this.depositMoneyInput = this.depositMoneyInput.slice(0, 9)
    } else if (isDote && tempLen > 12) {
      this.depositMoneyInput = this.depositMoneyInput.slice(0, 12)
    }
    // 控制输入的小数点问题
    if (/\./.test(this.depositMoneyInput)) {
      if (/^([1-9]\d*|0)(\.\d{1,2})?$/.test(this.depositMoneyInput)) {
        this.formData.money = this.depositMoneyInput
      } else {
        this.formData.money = this.depositMoneyInput = this.depositMoneyInput.substring(0, this.depositMoneyInput.indexOf('.') + 3)
      }
    } else {
      this.formData.money = this.depositMoneyInput
    }
    this.updateDiscount()
  }
  selectDiscountActive(item) {
    const { type, scene, money, active_id, id } = this.formData
    if (active_id === item.id) {
      this.formData = {
        type,
        scene,
        money,
        id,
        active_id: '0',
        active_money: 0,
        active_type: 0,
        active_prize: 0,
        upper_limit: 0
      }
    } else {
      this.formData = {
        type,
        scene,
        money,
        id,
        active_id: item.id,
        active_money: item.rule[0].money,
        active_type: item.rule[0].type,
        active_prize: item.rule[0].prize,
        upper_limit: item.rule[0].upper_limit
      }
    }
    this.updateDiscount()
  }
  @Watch('formData.type')
  updateDiscount() {
    const { active_id } = this.formData
    let money = Number(this.formData.money)
    if (active_id !== '0' && this.formData.type) {
      api
        .getBankWalletCoupon({
          type: this.formData.type,
          active_id,
          money
        })
        .then((res: any) => {
          if (res.code === 0) {
            this.reapProfit = Number(res.data.coupon_amount)
          } else {
            this.reapProfit = 0
          }
        })
    } else {
      this.reapProfit = 0
    }
  }
  submit() {
    const data = { ...this.formData }
    if (data.active_id === '0') {
      const keys = ['active_money', 'active_type', 'active_prize', 'upper_limit']
      keys.map(key => {
        data.hasOwnProperty(key) && delete data[key]
      })
    }
    if (!data.scene) {
      Toast.fail('请选择支付方式！')
    } else if (!this.formData.money) {
      Toast.fail('请输入充值金额！')
    } else if (Number(this.formData.money) > this.depositMoneyMax || Number(this.formData.money) < this.depositMoneyMin) {
      Toast.fail(`充值金额最低${this.depositMoneyMin}元，最高${this.depositMoneyMax}元！`)
    } else {
      this.$emit('sumbit', {
        data,
        type: 'online',
        reapProfit: this.reapProfit,
        cb: () => {
          this.reapProfit = 0
          this.formData.scene = ''
          this.formData.money = ''
          this.formData.id = ''
          this.depositMoneyInput = ''
          this.isInput = false
        }
      })
    }
  }
}

interface FormData {
  type: string
  scene: string
  money: string
  active_id: string
  active_money: number
  active_type: number
  active_prize: number
  upper_limit: number
  id: any
}
</script>
