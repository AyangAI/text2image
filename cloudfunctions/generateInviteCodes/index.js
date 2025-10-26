const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 生成随机邀请码
function generateInviteCode() {
  // 排除容易混淆的字符：0、O、I、1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 检查邀请码是否已存在
async function isCodeExists(code) {
  const result = await db.collection('invitationCodes').where({
    code: code
  }).get()
  return result.data.length > 0
}

// 生成唯一的邀请码
async function generateUniqueCode() {
  let code
  let exists = true
  
  while (exists) {
    code = generateInviteCode()
    exists = await isCodeExists(code)
  }
  
  return code
}

exports.main = async (event, context) => {
  try {
    const { count = 10 } = event
    
    console.log(`开始生成 ${count} 个邀请码`)
    
    const codes = []
    
    // 生成指定数量的邀请码
    for (let i = 0; i < count; i++) {
      const code = await generateUniqueCode()
      codes.push({
        code: code,
        isUsed: false,
        usedBy: null,
        createdAt: new Date(),
        usedAt: null
      })
    }
    
    // 批量插入数据库
    const result = await db.collection('invitationCodes').add({
      data: codes
    })
    
    console.log('邀请码生成成功:', codes.map(c => c.code))
    
    return {
      success: true,
      message: `成功生成 ${count} 个邀请码`,
      codes: codes.map(c => c.code),
      insertedIds: result._ids
    }
    
  } catch (error) {
    console.error('生成邀请码失败:', error)
    return {
      success: false,
      message: '生成邀请码失败',
      error: error.message
    }
  }
}