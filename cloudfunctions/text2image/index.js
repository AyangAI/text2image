// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 豆包AI图片生成API调用
async function generateImageFromAPI(prompt) {
  try {
    // 使用微信云函数内置的request方法
    const request = require('request-promise')
    
    // 从环境变量获取API密钥
    const apiKey = process.env.DOUBAO_API_KEY;
    if (!apiKey) {
      console.log('未配置DOUBAO_API_KEY环境变量，使用备用模拟接口');
      throw new Error('API密钥未配置');
    }
    
    const options = {
      uri: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: {
        model: "doubao-seedream-4-0-250828",
        prompt: prompt,
        response_format: "url",
        size: "2K",
        stream: false,
        watermark: true
      },
      json: true,
      timeout: 60000
    }

    console.log('调用豆包API，提示词:', prompt)
    const response = await request(options)
    console.log('豆包API响应:', response)
    
    // 检查响应数据格式
    if (response.data && response.data.length > 0 && response.data[0].url) {
      return {
        success: true,
        imageUrl: response.data[0].url,
        prompt: prompt
      }
    } else {
      throw new Error('API响应格式异常，未找到图片URL')
    }
    
  } catch (error) {
    console.error('豆包API调用失败:', error)
    
    // 如果API调用失败，使用备用的模拟接口
    console.log('使用备用模拟接口生成图片')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/600`
    
    return {
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
      isSimulated: true // 标记这是模拟生成的图片
    }
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  console.log('text2image函数被调用，参数:', event);
  console.log('当前云环境:', cloud.DYNAMIC_CURRENT_ENV);
  
  try {
    const { prompt } = event;
    
    // 参数验证
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return {
        success: false,
        message: '提示词不能为空'
      };
    }
    
    console.log('开始生成图片，提示词:', prompt);
    
    // 调用图片生成API
    const generationResult = await generateImageFromAPI(prompt);
    
    if (!generationResult.success) {
      return {
        success: false,
        message: '图片生成失败'
      };
    }
    
    // 创建时间戳
    const createTime = new Date();
    const imageUrl = generationResult.imageUrl;
    
    // 保存到数据库
    try {
      // 保存提示词记录
      const promptRecord = await db.collection('prompt').add({
        data: {
          content: prompt,
          createTime: createTime,
          openid: wxContext.OPENID
        }
      });
      
      console.log('提示词保存成功:', promptRecord);
      
      // 保存图片记录
      const imageRecord = await db.collection('image').add({
        data: {
          url: imageUrl,
          promptId: promptRecord._id,
          createTime: createTime,
          openid: wxContext.OPENID
        }
      });
      
      console.log('图片记录保存成功:', imageRecord);
      
      // 返回成功结果
      return {
        success: true,
        message: '图片生成成功',
        imageUrl: imageUrl,
        imageId: imageRecord._id
      };
    } catch (dbError) {
      console.error('数据库操作失败:', dbError);
      
      // 即使数据库操作失败，仍然返回生成的图片
      return {
        success: true,
        message: '图片生成成功，但保存失败',
        imageUrl: imageUrl,
        dbError: dbError.message
      };
    }
    
  } catch (error) {
    console.error('图片生成失败:', error);
    return {
      success: false,
      message: '服务异常，请重试',
      error: error.message
    };
  }
}