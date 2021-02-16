const app = getApp();
Component({
  /**
   * 组件的一些选项
   */
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  /**
   * 组件的对外属性
   */
  properties: {
    bgColor: {
      type: String,
      default: ''
    },
    Left: {
      type: [Boolean, String],
      default: false
    },
    Right: {
      type: [Boolean, String],
      default: false
    },
    isCustom: {
      type: [Boolean, String],
      default: false
    },
    isBack: {
      type: [Boolean, String],
      default: false
    },
    bgImage: {
      type: String,
      default: ''
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onLeft(e) {
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('left', e, myEventOption)
    },
    onRight(e) {
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('right', e, myEventOption)
    }
  }
})