<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { NavBar, Cell, CellGroup, Picker, Popup, Field, Button, Toast, DatetimePicker } from 'vant'
import api from '@/api'
import { Mutation } from 'vuex-class'
import SelectAvater from '@/components/select-avater/index.vue'
import BScroll from 'better-scroll'

@Component({
  components: {
    SelectAvater,
    [NavBar.name]: NavBar,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Picker.name]: Picker,
    [Popup.name]: Popup,
    [Field.name]: Field,
    [Button.name]: Button,
    [DatetimePicker.name]: DatetimePicker
  }
})
export default class Profile extends Vue {
  @Mutation loadingToggle
  /*************data***********/
  //数据源
  dataSource: any = {}

  // 表单对象
  form: any = {
    wechat: '',
    qq: '',
    skype: ''
  }
  // 错误信息提示
  err: any = {}
  // 是否显示popup
  popupObj: PopupState = {
    type: '',
    show: false,
    columns: []
  }

  // 绑定选择生日
  birthDate: any = ''

  // 性别数组
  sexInfo: object[] = [
    {
      id: 1,
      name: '男'
    },
    {
      id: 2,
      name: '女'
    },
    {
      id: 3,
      name: '保密'
    }
  ]

  // 接口请求成功显示
  isShow: boolean = false

  // 可供选选择的头像列表
  avaterArr: object[] = [
    { img: 'photo1.png' },
    { img: 'photo2.png' },
    { img: 'photo3.png' },
    { img: 'photo4.png' },
    { img: 'photo5.png' },
    { img: 'photo6.png' },
    { img: 'photo7.png' },
    { img: 'photo8.png' },
    { img: 'photo9.png' }
  ]

  // 选中的头像
  selectAvaterUrl: string = ''

  $refs!: {
    picker: any
    container: Element
  }

  @Watch('form.qq')
  onFormQQChanged(newVal, oldVal) {
    this.checkFormForKey(newVal, 'qq', '请输入4-14数字', /^.{4,14}$/)
  }
  @Watch('form.wechat')
  onFormWechatChanged(newVal, oldVal) {
    this.checkFormForKey(newVal, 'wechat', '请输入以字母开头不能大于20个字符', /^[a-zA-Z].{1,19}$/)
  }
  @Watch('form.skype')
  onFormSkypeChanged(newVal, oldVal) {
    this.checkFormForKey(newVal, 'skype', '请输入少于50个字符', /^.{1,50}$/)
  }
  // 所有的表单验证
  // val：需要校验的值
  // key：err对象对应的key
  // reg：正则规则
  // errorMessmage：文字提示
  checkFormForKey(val, key, errorMessmage, reg?: RegExp) {
    let tempError = ''
    if (val) {
      if (reg && reg.test(val)) {
        tempError = ''
      } else {
        tempError = errorMessmage
      }
    }
    this.$set(this.err, key, tempError)
    if (tempError.length) {
      return false
    } else {
      return true
    }
  }
  /*************life-cycle***********/
  activated() {
    this.request()
    this.$nextTick(() => {
      new BScroll(this.$refs.container, { scrollX: false, scrollY: true, click: true })
    })
  }

  /*************methods***********/
  // 请求个人资料的数据
  request() {
    this.isShow = false
    this.loadingToggle()
    api
      .userBaseinfo()
      .then((res: any) => {
        const { code, data } = res
        if (code == 0) {
          this.selectAvaterUrl = data['avatar_url']
          this.dataSource = data || []
          for (const key in data) {
            data[key] = data[key] || ''
            if (key === 'qq' || key === 'wechat' || key === 'skype' || key === 'nickname') {
              this.$set(this.form, key, data[key])
              this.$set(this.err, key, '')
            }
          }
          this.isShow = true
        }
        this.loadingToggle()
      })
      .catch(error => {})
  }

  // 点击cell的事件
  // type:修改哪一个的 如：user_name
  // value:传值
  onChangeCell(type, value?: string) {
    switch (type) {
      case 'birth':
        // const tempDate: any = value && value.split('-')
        this.popupObj = {
          type,
          show: true
        }
        // 给pick设置默认值
        this.$nextTick(() => {
          this.birthDate = value && new Date(value)
        })
        break
      case 'sex':
        this.popupObj = {
          type,
          show: true,
          columns: this.sexInfo
        }
        this.$nextTick(() => {
          this.$refs['picker1'].setValues([value])
        })
        break
      case 'avatar_url':
        this.popupObj = {
          type,
          show: true,
          columns: this.avaterArr
        }
        break
      default:
        //电子邮箱和手机
        this.$dialog
          .confirm({
            title: '温馨提示',
            message: value ? '前往安全中心修改' : '前往安全中心设置'
          })
          .then(() => {
            this.$router.push('/my/security')
          })
          .catch(() => {})
    }
  }

  // 根据value值显示对应的文字
  valueForKey(id, arr) {
    let tempValue = ''
    if (JSON.stringify(arr) !== '{}') {
      arr.map((obj: any) => {
        if (id == obj.id) {
          tempValue = obj.name
        }
      })
    }
    return tempValue
  }

  // onPopupCancel
  onPopupCancel() {
    this.popupObj.show = false
  }

  // onPopupConfirm
  onPopupConfirm(value) {
    this.popupObj.show = false
    const { type } = this.popupObj
    switch (this.popupObj.type) {
      case 'birth':
        this.dataSource['birth'] = value
        break
      case 'sex':
        this.dataSource['sex'] = value.id
        break
    }
  }

  // 提交事件
  submit() {
    const { form, dataSource, err } = this
    // 校验是否通过
    for (const key in err) {
      if (err[key]) {
        return
      }
    }
    this.loadingToggle()
    let tempData: any = {}
    for (const key in dataSource) {
      if (key === 'birth') {
        tempData['birth'] = new Date(dataSource[key]).format('yyyy-MM-dd')
      } else if (key === 'sex') {
        tempData['sex'] = dataSource[key]
      }
    }
    for (const key in form) {
      tempData[key] = form[key]
    }
    if (this.selectAvaterUrl.length) {
      tempData.avatar_url = this.selectAvaterUrl
    }
    api
      .userInfoEdit(tempData)
      .then((res: any) => {
        const { code, data } = res
        if (code == 0) {
          Toast.success('修改成功')
          this.request()
        }
        this.loadingToggle()
      })
      .catch(error => {})
  }

  //
  chooseAvater(val) {
    this.selectAvaterUrl = val
  }
  //
  onClickLeft() {
    this.$router.go(-1)
  }
}

interface PopupState {
  type: string
  show: boolean
  columns?: any
}
interface DialogState {
  show: boolean
  content: string
  type: string
}
</script>
<style lang="stylus">
.profile
  .dialog
    .van-field__control
      border 1px solid hsla(0, 0%, 85%, 0.5)
      padding 0.133333rem

  .van-field__error-message
    text-align right
</style>
