// app.js
const userAuth = require('./utils/userAuth');

App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
      //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
      //   如不填则使用默认环境（第一个创建的环境）
      env: "",
      userInfo: null,
      isLoggedIn: false
    };
    
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        // env 参数留空，使用默认环境
        traceUser: true,
      });
    }
    
    // 检查用户登录状态
    this.checkUserLoginStatus();
  },
  
  // 检查用户登录状态
  checkUserLoginStatus: function() {
    const isLoggedIn = userAuth.isUserLoggedIn();
    const userInfo = userAuth.getUserInfo();
    
    this.globalData.isLoggedIn = isLoggedIn;
    this.globalData.userInfo = userInfo;
    
    // 根据登录状态决定跳转
    if (isLoggedIn) {
      // 已登录用户，预加载文生图界面资源
      this.preloadImageGenResources();
    }
    
    return isLoggedIn;
  },
  
  // 预加载文生图界面资源
  preloadImageGenResources: function() {
    // 这里可以预加载一些必要的资源
    console.log('预加载文生图界面资源');
  }
});
