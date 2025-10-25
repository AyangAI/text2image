// pages/imageGen/index.js
Page({
  data: {
    prompt: '',
    generatedImage: '',
    isGenerating: false,
    errorMessage: '',
    showResult: false,
    loadingProgress: 0,
    loadingText: '正在生成图片...',
    imageLoadError: false,
    retryCount: 0
  },

  onLoad: function() {
    // 页面加载时检查用户登录状态
    this.checkUserLoginStatus();
  },

  // 检查用户登录状态
  checkUserLoginStatus: function() {
    const userAuth = require('../../utils/userAuth.js');
    
    if (!userAuth.isUserLoggedIn()) {
      console.log('用户未登录，跳转到注册页面');
      wx.redirectTo({
        url: '/pages/register/index',
        fail: (err) => {
          console.error('跳转到注册页面失败:', err);
          wx.showToast({
            title: '请先注册',
            icon: 'none'
          });
        }
      });
    } else {
      console.log('用户已登录，可以使用文生图功能');
    }
  },

  // 处理提示词输入
  onPromptInput: function(e) {
    this.setData({
      prompt: e.detail.value
    });
  },

  // 生成图片
  generateImage: function() {
    const prompt = this.data.prompt.trim();
    
    if (!prompt) {
      this.setData({
        errorMessage: '请输入提示词'
      });
      return;
    }

    this.setData({
      isGenerating: true,
      errorMessage: '',
      showResult: false,
      loadingProgress: 0,
      loadingText: '正在连接AI服务...'
    });

    // 显示生成中的提示
    wx.showLoading({
      title: '正在生成图片...',
      mask: true
    });

    // 模拟进度更新
    this.updateLoadingProgress();

    // 调用云函数
    wx.cloud.callFunction({
      name: 'text2image',
      data: {
        prompt: prompt
      },
      success: res => {
        console.log('图片生成成功:', res);
        if (res.result && res.result.success) {
          this.setData({
            generatedImage: res.result.imageUrl,
            showResult: true,
            imageLoadError: false,
            retryCount: 0
          });
          
          // 如果是模拟生成的图片，给用户提示
          if (res.result.isSimulated) {
            wx.showToast({
              title: '使用了备用生成方案',
              icon: 'none',
              duration: 2000
            });
          } else {
            wx.showToast({
              title: '图片生成成功',
              icon: 'success'
            });
          }
        } else {
          this.setData({
            errorMessage: res.result.message || '图片生成失败，请重试'
          });
          wx.showToast({
            title: '生成失败',
            icon: 'error'
          });
        }
      },
      fail: err => {
        console.error('调用云函数失败:', err);
        this.setData({
          errorMessage: '服务调用失败，请重试'
        });
        wx.showToast({
          title: '服务调用失败',
          icon: 'error'
        });
      },
      complete: () => {
        // 清理进度定时器
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
        }
        
        this.setData({
          isGenerating: false,
          loadingProgress: 100,
          loadingText: '完成'
        });
        wx.hideLoading();
      }
    });
  },

   // 处理图片加载错误
   onImageError: function(e) {
     console.error('图片加载失败:', e);
     this.setData({
       imageLoadError: true
     });
     
     wx.showToast({
       title: '图片加载失败',
       icon: 'none'
     });
   },

   // 重新加载图片
   retryLoadImage: function() {
     if (this.data.retryCount >= 3) {
       wx.showToast({
         title: '重试次数过多，请重新生成',
         icon: 'none'
       });
       return;
     }

     this.setData({
       imageLoadError: false,
       retryCount: this.data.retryCount + 1
     });

     // 添加时间戳强制刷新图片
     const imageUrl = this.data.generatedImage;
     const separator = imageUrl.includes('?') ? '&' : '?';
     const newImageUrl = `${imageUrl}${separator}t=${Date.now()}`;
     
     this.setData({
       generatedImage: newImageUrl
     });
   },

   // 更新加载进度
  updateLoadingProgress: function() {
    const progressSteps = [
      { progress: 20, text: '正在连接AI服务...' },
      { progress: 40, text: '正在分析提示词...' },
      { progress: 60, text: '正在生成图片...' },
      { progress: 80, text: '正在优化图片质量...' },
      { progress: 95, text: '即将完成...' }
    ];

    let currentStep = 0;
    const updateInterval = setInterval(() => {
      if (currentStep < progressSteps.length && this.data.isGenerating) {
        this.setData({
          loadingProgress: progressSteps[currentStep].progress,
          loadingText: progressSteps[currentStep].text
        });
        currentStep++;
      } else {
        clearInterval(updateInterval);
      }
    }, 800);

    // 保存定时器引用，用于清理
    this.progressInterval = updateInterval;
  },

  // 预览图片
  previewImage: function() {
    if (this.data.generatedImage) {
      wx.previewImage({
        urls: [this.data.generatedImage]
      });
    }
  },

  // 保存图片到相册
  saveImage: function() {
    if (!this.data.generatedImage) return;
    
    wx.showLoading({
      title: '保存中...',
    });
    
    wx.downloadFile({
      url: this.data.generatedImage,
      success: res => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({
                title: '保存成功',
                icon: 'success'
              });
            },
            fail: err => {
              console.error('保存失败:', err);
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              });
            }
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
});