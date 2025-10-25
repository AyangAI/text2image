// 测试清除用户数据的脚本
// 在小程序开发者工具的控制台中运行

// 调用清除用户数据的云函数
wx.cloud.callFunction({
  name: 'clearUserData',
  success: res => {
    console.log('清除用户数据成功:', res);
    if (res.result.success) {
      console.log(`已删除 ${res.result.deletedCount} 条用户记录`);
      
      // 同时清除本地存储的用户信息
      wx.removeStorageSync('user_info');
      wx.removeStorageSync('user_token');
      
      console.log('本地用户信息也已清除');
      
      // 提示用户
      wx.showToast({
        title: '用户数据已清除',
        icon: 'success'
      });
    } else {
      console.error('清除失败:', res.result.message);
    }
  },
  fail: err => {
    console.error('调用清除用户数据云函数失败:', err);
  }
});

console.log('正在清除用户数据，请稍等...');