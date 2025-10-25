// 用户认证状态管理工具
const USER_INFO_KEY = 'user_info';
const TOKEN_KEY = 'user_token';

// 保存用户信息到本地存储
const saveUserInfo = (userInfo) => {
  try {
    wx.setStorageSync(USER_INFO_KEY, userInfo);
    return true;
  } catch (e) {
    console.error('保存用户信息失败:', e);
    return false;
  }
};

// 保存用户认证令牌
const saveToken = (token) => {
  try {
    wx.setStorageSync(TOKEN_KEY, token);
    return true;
  } catch (e) {
    console.error('保存用户令牌失败:', e);
    return false;
  }
};

// 获取用户信息
const getUserInfo = () => {
  try {
    return wx.getStorageSync(USER_INFO_KEY) || null;
  } catch (e) {
    console.error('获取用户信息失败:', e);
    return null;
  }
};

// 获取用户令牌
const getToken = () => {
  try {
    return wx.getStorageSync(TOKEN_KEY) || null;
  } catch (e) {
    console.error('获取用户令牌失败:', e);
    return null;
  }
};

// 清除用户认证信息
const clearUserAuth = () => {
  try {
    wx.removeStorageSync(USER_INFO_KEY);
    wx.removeStorageSync(TOKEN_KEY);
    return true;
  } catch (e) {
    console.error('清除用户认证信息失败:', e);
    return false;
  }
};

// 检查用户是否已登录
const isUserLoggedIn = () => {
  const token = getToken();
  const userInfo = getUserInfo();
  return !!(token && userInfo);
};

module.exports = {
  saveUserInfo,
  saveToken,
  getUserInfo,
  getToken,
  clearUserAuth,
  isUserLoggedIn
};