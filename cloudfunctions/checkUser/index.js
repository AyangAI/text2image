const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  console.log('checkUser云函数被调用')
  
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    
    // 根据openid查找用户
    const result = await db.collection('user').where({
      openid: openid
    }).get()
    
    console.log('查询结果:', result)
    
    if (result.data.length > 0) {
      // 用户已存在
      return {
        success: true,
        userExists: true,
        userInfo: result.data[0]
      }
    } else {
      // 用户不存在
      return {
        success: true,
        userExists: false
      }
    }
    
  } catch (err) {
    console.error('检查用户失败:', err)
    return {
      success: false,
      message: '检查用户失败: ' + err.message
    }
  }
}