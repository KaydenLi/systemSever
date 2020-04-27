const User = require('../models/User')
//处理中断请求
const assert = require('http-assert')
//引如jsonwebtoken
const jwt = require('jsonwebtoken')
// 引入secret
const secret = require('../secret')

//创建登录校验中间件
const auth = async (req, res, next) => {
    //将token上传到服务器，token为空则报错
    const token = String(req.headers.authorization || '').split(' ').pop()
    // 如果token不存在则报错
    assert(token, 401, '请先登录')
    //验证token是否正确，错误则报错
    const { id } = jwt.verify(token, secret)
    assert(id, 401, '请先登录')
    //将客户端请求挂载到req中，便于在以后的请求中使用
    req.user = await User.findById(id)
    assert(req.user, 401, '请先登录')
    await next()
}
module.exports = auth