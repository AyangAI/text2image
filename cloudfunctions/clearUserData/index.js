// 清除用户数据的云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    console.log('开始清除用户数据...')
    
    // 删除所有用户数据
    const result = await db.collection('user').where({
      _id: db.command.exists(true)
    }).remove()
    
    console.log('用户数据清除结果:', result)
    
    return {
      success: true,
      message: '用户数据清除成功',
      deletedCount: result.stats.removed
    }
  } catch (error) {
    console.error('清除用户数据失败:', error)
    return {
      success: false,
      message: '清除用户数据失败',
      error: error.message
    }
  }
}