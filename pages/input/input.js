// pages/input/input.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rippleStyle: '',
    CLICKED: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bclick: function (e) {
    console.log(e.touches[0]);
    var x = e.touches[0].pageX;
    var y = e.touches[0].pageY;
    var id = e.target.id;
    if (id == 'Enter') {
      this.setData({ rippleStyle: '' });
      this.setData({ rippleStyle: 'top:' + y + 'px;left:' + x + 'px;-webkit-animation: ripple 0.3s linear;animation:ripple 0.3s linear;' });
    }
  }
})