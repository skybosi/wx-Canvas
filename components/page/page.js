const app = getApp();
let originPage = Page
// import list from './template/list.js'

export default function (context = {}) {
  /**
   * merge 渲染层的功能到Page中
   */
  // Object.assign(context, list)

  /**
   * 页面加载函数重写
   */
  let originOnLoad = context.onLoad
  context.onLoad = function (options) {
    const that = this
    originOnLoad && originOnLoad.call(that, options)
  }
  /**
   * 触摸滑动事件后
   */
  let originonPageEvent = context.onPageEvent
  context.onPageEvent = function (e) {
    const that = this
    switch (e.direction) {
      case 'leftedge':
      case 'rightedge':
        wx.navigateBack({
          delta: -1
        })
        break
      case 'left':
      case 'right':
        break;
      case 'down':
        break
      default:
        break
    }
    originonPageEvent && originonPageEvent.call(that, e)
  }

  return Page({
    data: Object.assign(context.data, {
      // authConfig: authConfig,
      pageStats: {
        maxScrollTop: 0,
        scrollTop: 0,
        reachBottom: false,
        Custom: app.globalData.Custom,
        CustomBar: app.globalData.CustomBar,
        StatusBar: app.globalData.StatusBar,
        ScreenWidth: app.globalData.DiviceInfo.screenWidth,
        ScreenHeight: app.globalData.DiviceInfo.screenHeight,
      },
      scrollTopArray: {},
      Custom: app.globalData.Custom,
      CustomBar: app.globalData.CustomBar,
      StatusBar: app.globalData.StatusBar,
      ScreenWidth: app.globalData.DiviceInfo.screenWidth,
      ScreenHeight: app.globalData.DiviceInfo.screenHeight,
    }),
    props: {
      pureDataPatten: /^_/
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
      return {
        title: this.data.shareTitle,
        imageUrl: shareImage,
        path: sharePath
      }
    },
    ...context
  });
}