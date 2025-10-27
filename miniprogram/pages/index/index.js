// index.js
const userAuth = require('../../utils/userAuth');

Page({
  data: {
    formData: {
      phone: '',
      nickname: '',
      gender: 'male',
      inviteCode: ''
    },
    loading: false,
    canSubmit: false,
    validation: {
      phoneValid: null, // null: 未验证, true: 有效, false: 无效
      phoneError: '',
      nicknameValid: null, // null: 未验证, true: 有效, false: 无效
      nicknameError: '',
      inviteCodeValid: null,
      inviteCodeError: ''
    }
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
    // 移除实时验证，只更新数据
    this.checkCanSubmit();
  },

  // 手机号失去焦点事件
  onPhoneBlur(e) {
    const phone = e.detail.value;
    this.validatePhone(phone);
    this.checkCanSubmit();
  },

  // 验证手机号
  validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    let phoneValid = null;
    let phoneError = '';

    if (phone.length === 0) {
      phoneValid = null;
      phoneError = '';
    } else if (phone.length < 11) {
      phoneValid = false;
      phoneError = '手机号长度不足11位';
    } else if (phone.length > 11) {
      phoneValid = false;
      phoneError = '手机号长度超过11位';
    } else if (!phoneRegex.test(phone)) {
      phoneValid = false;
      phoneError = '请输入正确的手机号格式';
    } else {
      phoneValid = true;
      phoneError = '';
    }

    this.setData({
      'validation.phoneValid': phoneValid,
      'validation.phoneError': phoneError
    });
  },

  // 昵称输入事件
  // 昵称输入事件
  onNicknameInput(e) {
    const nickname = e.detail.value;
    this.setData({
      'formData.nickname': nickname
    });
    // 移除实时验证，只更新数据
    this.checkCanSubmit();
  },

  // 昵称失去焦点事件
  onNicknameBlur(e) {
    const nickname = e.detail.value;
    this.validateNickname(nickname);
    this.checkCanSubmit();
  },

  // 昵称验证函数
  validateNickname(nickname) {
    if (!nickname || nickname.trim() === '') {
      this.setData({
        'validation.nicknameValid': false,
        'validation.nicknameError': '请输入昵称'
      });
      return false;
    }

    // 检查长度：4-20个字符
    if (nickname.length < 4) {
      this.setData({
        'validation.nicknameValid': false,
        'validation.nicknameError': '昵称至少需要4个字符'
      });
      return false;
    }

    if (nickname.length > 20) {
      this.setData({
        'validation.nicknameValid': false,
        'validation.nicknameError': '昵称不能超过20个字符'
      });
      return false;
    }

    // 检查字符类型：只允许字母、数字、汉字和下划线
    const validPattern = /^[a-zA-Z0-9\u4e00-\u9fa5_]+$/;
    if (!validPattern.test(nickname)) {
      this.setData({
        'validation.nicknameValid': false,
        'validation.nicknameError': '昵称只能包含字母、数字、汉字和下划线'
      });
      return false;
    }

    // 验证通过
    this.setData({
      'validation.nicknameValid': true,
      'validation.nicknameError': ''
    });
    return true;
  },

  // 邀请码输入事件
  onInviteCodeInput(e) {
    const inviteCode = e.detail.value.toUpperCase(); // 转换为大写
    this.setData({
      'formData.inviteCode': inviteCode
    });
    // 移除实时验证，只更新数据
    this.checkCanSubmit();
  },

  // 邀请码失去焦点事件
  onInviteCodeBlur(e) {
    const inviteCode = e.detail.value.toUpperCase();
    this.validateInviteCode(inviteCode);
    this.checkCanSubmit();
  },

  // 验证邀请码
  validateInviteCode(inviteCode) {
    let inviteCodeValid = null;
    let inviteCodeError = '';

    if (inviteCode.length === 0) {
      inviteCodeValid = null;
      inviteCodeError = '';
    } else if (inviteCode.length < 8) {
      inviteCodeValid = false;
      inviteCodeError = '邀请码长度不足8位';
    } else if (inviteCode.length > 8) {
      inviteCodeValid = false;
      inviteCodeError = '邀请码长度超过8位';
    } else if (!/^[A-Z0-9]{8}$/.test(inviteCode)) {
      inviteCodeValid = false;
      inviteCodeError = '邀请码只能包含大写字母和数字';
    } else {
      inviteCodeValid = true;
      inviteCodeError = '';
    }

    this.setData({
      'validation.inviteCodeValid': inviteCodeValid,
      'validation.inviteCodeError': inviteCodeError
    });
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
    const { phone, nickname, gender, inviteCode } = this.data.formData;
    const { phoneValid, nicknameValid, inviteCodeValid } = this.data.validation;
    
    // 基本字段检查：所有字段都必须有内容
    const hasAllFields = phone.trim().length > 0 && 
                        nickname.trim().length > 0 && 
                        gender && 
                        inviteCode.trim().length > 0;
    
    // 验证状态检查：如果已经验证过，必须验证通过；如果未验证过，允许提交（提交时会再次验证）
    const validationPassed = (phoneValid === null || phoneValid === true) && 
                            (nicknameValid === null || nicknameValid === true) &&
                            (inviteCodeValid === null || inviteCodeValid === true);
    
    const canSubmit = hasAllFields && validationPassed;
    
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

    const { phone, nickname, gender, inviteCode } = this.data.formData;
    
    // 提交前进行最终验证
    this.validatePhone(phone);
    this.validateNickname(nickname);
    this.validateInviteCode(inviteCode);
    
    // 检查验证结果
    const { phoneValid, nicknameValid, inviteCodeValid } = this.data.validation;
    
    if (phoneValid !== true) {
      wx.showToast({
        title: this.data.validation.phoneError || '手机号格式不正确',
        icon: 'none'
      });
      return;
    }

    if (nicknameValid !== true) {
      wx.showToast({
        title: this.data.validation.nicknameError || '昵称格式不正确',
        icon: 'none'
      });
      return;
    }

    if (inviteCodeValid !== true) {
      wx.showToast({
        title: this.data.validation.inviteCodeError || '邀请码格式不正确',
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
        inviteCode: inviteCode,
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
