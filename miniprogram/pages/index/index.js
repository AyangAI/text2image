// index.js
const userAuth = require('../../utils/userAuth');

Page({
  data: {
    formData: {
      phone: '',
      nickname: '',
      gender: 'male'
    },
    loading: false,
    canSubmit: false
  },

  onLoad: function() {
    console.log('首页加载完成');
    // 检查用户是否已注册
    this.checkUserExists();
  },

  // 检查用户是否已存在
  checkUserExists: function() {
    wx.showLoading({
      title: '检查登录状态...'
    });

    wx.cloud.callFunction({
      name: 'checkUser',
      success: (res) => {
        wx.hideLoading();
        console.log('检查用户结果:', res);
        
        if (res.result.success && res.result.userExists) {
          // 用户已存在，保存用户信息并跳转到图片生成页面
          const userInfo = res.result.userInfo;
          const userAuth = require('../../utils/userAuth.js');
          
          userAuth.saveUserInfo({
            phone: userInfo.phone,
            nickname: userInfo.nickname,
            gender: userInfo.gender
          });
          userAuth.saveToken('user_exists_' + Date.now());
          
          console.log('用户已存在，直接跳转到图片生成页面');
          wx.reLaunch({
            url: '/pages/imageGen/index'
          });
        } else {
          // 用户不存在，显示注册表单
          console.log('用户不存在，显示注册表单');
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('检查用户失败:', err);
        // 检查失败时也显示注册表单
      }
    });
  },

  // 手机号输入事件
  onPhoneInput(e) {
    const phone = e.detail.value;
    this.setData({
      'formData.phone': phone
    });
    this.checkCanSubmit();
  },

  // 昵称输入事件
  onNicknameInput(e) {
    const nickname = e.detail.value;
    this.setData({
      'formData.nickname': nickname
    });
    this.checkCanSubmit();
  },

  // 性别选择事件
  onGenderChange(e) {
    const gender = e.detail.value;
    this.setData({
      'formData.gender': gender
    });
    this.checkCanSubmit();
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { phone, nickname, gender } = this.data.formData;
    const phoneRegex = /^1[3-9]\d{9}$/;
    const canSubmit = phoneRegex.test(phone) && nickname.trim().length > 0 && gender;
    
    this.setData({
      canSubmit: canSubmit
    });
  },

  // 表单提交事件
  onSubmitRegister(e) {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请完善信息',
        icon: 'none'
      });
      return;
    }

    const { phone, nickname, gender } = this.data.formData;
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      });
      return;
    }

    // 验证昵称长度
    if (nickname.trim().length === 0) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    if (nickname.length > 20) {
      wx.showToast({
        title: '昵称不能超过20个字符',
        icon: 'none'
      });
      return;
    }

    this.setData({
      loading: true
    });

    // 调用云函数进行注册
    wx.cloud.callFunction({
      name: 'register',
      data: {
        phone: phone,
        nickname: nickname.trim(),
        gender: gender,
        createTime: new Date()
      }
    }).then(res => {
      console.log('注册成功', res);
      this.setData({
        loading: false
      });
      
      if (res.result.success) {
        wx.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 2000
        });
        
        // 清空表单
        this.setData({
          formData: {
            phone: '',
            nickname: '',
            gender: 'male'
          }
        });
        this.checkCanSubmit();
        
        // 保存用户信息到本地存储
        userAuth.saveUserInfo({
          phone: phone,
          nickname: nickname.trim(),
          gender: gender
        });
        
        // 保存token（这里可以从服务器返回的token，暂时用一个简单的标识）
        userAuth.saveToken('user_registered_' + Date.now());
        
        // 跳转到文生图页面
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/imageGen/index',
            success: () => {
              console.log('注册成功，跳转到文生图页面');
            },
            fail: (err) => {
              console.error('跳转失败:', err);
            }
          });
        }, 1500);
        
      } else {
        wx.showToast({
          title: res.result.message || '注册失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('注册失败', err);
      this.setData({
        loading: false
      });
      
      let errorMessage = '注册失败，请重试';
      
      if (err.errMsg) {
        if (err.errMsg.includes('Environment not found')) {
          errorMessage = '云开发环境未找到，请检查配置';
        } else if (err.errMsg.includes('FunctionName parameter could not be found')) {
          errorMessage = '云函数未找到，请先部署register云函数';
        }
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      });
    });
  }
});
