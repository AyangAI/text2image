const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  console.log('register云函数被调用，参数:', event)
  
  try {
    const { phone, nickname, gender, inviteCode } = event
    
    // 简单验证
    if (!phone || !nickname || !inviteCode) {
      return {
        success: false,
        message: '手机号、昵称和邀请码不能为空'
      }
    }
    
    // 验证邀请码
    const inviteCodeResult = await db.collection('invitationCodes').where({
      code: inviteCode,
      isUsed: false
    }).get()
    
    if (inviteCodeResult.data.length === 0) {
      return {
        success: false,
        message: '邀请码无效或已被使用'
      }
    }
    
    // 检查手机号是否已存在
    const existUser = await db.collection('user').where({
      phone: phone
    }).get()
    
    if (existUser.data.length > 0) {
      return {
        success: false,
        message: '该手机号已注册，请直接使用'
      }
    }
    
    // 插入用户数据
    const result = await db.collection('user').add({
      data: {
        phone: phone,
        nickname: nickname,
        gender: gender || 'male',
        createTime: new Date(),
        openid: cloud.getWXContext().OPENID,
        inviteCode: inviteCode
      }
    })
    
    // 标记邀请码为已使用
    await db.collection('invitationCodes').doc(inviteCodeResult.data[0]._id).update({
      data: {
        isUsed: true,
        usedBy: cloud.getWXContext().OPENID,
        usedAt: new Date()
      }
    })
    
    console.log('用户注册成功:', result)
    
    return {
      success: true,
      message: '注册成功',
      userId: result._id
    }
    
  } catch (err) {
    console.error('注册失败:', err)
    return {
      success: false,
      message: '注册失败: ' + err.message
    }
  }
}