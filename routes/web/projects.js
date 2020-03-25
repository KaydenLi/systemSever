const express = require('express')
const router = express.Router();
const Project = require('../../models/Projects')
const User = require('../../models/Users')
const jwt = require('jsonwebtoken')
const assert = require('http-assert')
const secret = require('../../secret')
//登录校验中间件
authHandler = async (req, res, next) => {
    //将token上传到服务器，token为空则报错
    const token = String(req.headers.authorization || '').split(' ').pop()
    assert(token, 401, '请先登录')
    // assert(token, 401, '请提供token')
    //验证token是否正确，错误则报错
    const { id } = jwt.verify(token, secret)
    assert(id, 401, '请先登录')
    //将客户端请求挂载到req中，便于在以后的请求中使用
    req.user = await User.findById(id)
    assert(req.user, 401, '请先登录')
    await next()
}

//创建项目
router.post('/create', async (req, res) => {
   
})

//项目列表
router.get('/list', async (req, res) => {
    const users = await Project.find();
    res.send(users);
    // res.send("vghdsvhgv" + req.params)
})

router.delete('/delete', async (req, res) => {
    var result = await Project.remove();
    res.send(result)
})

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    res.send('user' + id)
})

module.exports = router