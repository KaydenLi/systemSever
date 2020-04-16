const express = require('express')
const router = express.Router();
const Admin = require('../../models/Admin')
const jwt = require('jsonwebtoken')
const assert = require('http-assert')
const secret = require('../../secret')

//创建用户
router.post('/create', async (req, res) => {
    //判断用户是否存在
    const { userName, phone } = req.body
    const user = await Admin.findOne({ userName })
    assert(!user, 422, '用户名已存在，请更换用户名')
    const phoneNumber = await Admin.findOne({ phone })
    assert(!phoneNumber, 422, '该手机号已被注册')
    //用户不存在则建立新用户
    const newUser = await Admin.create(req.body)
    assert(newUser, 500, "创建出错，请稍后再试")
    res.send(newUser.userName)
})

//用户登录
router.post('/login', async (req, res) => {
    const { phone, password } = req.body
    //根据用户名找到用户
    var user = await Admin.findOne({ phone }).select('+password')
    assert(user, 422, '用户不存在')
    //校验密码
    const isValid = require('bcryptjs').compareSync(password, user.password)
    assert(isValid, 422, '密码输入错误')
    //返回token及用户信息
    const token = jwt.sign({ id: user._id }, secret)
    let userInfo = await Admin.findOne({ phone })
    res.send({ userInfo, token })
})
//用户列表
router.get('/list', async (req, res) => {
    const users = await Admin.find();
    res.send(users);
})

router.delete('/delete/:id', async (req, res) => {
    let id = req.params.id;
    const result = await Admin.findByIdAndDelete({ "_id": id });
    assert(result, 500, "服务器错误");
    const admins = await Admin.find();
    res.send(admins)
})

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    res.send('user' + id)
})

module.exports = router