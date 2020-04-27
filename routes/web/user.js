const express = require('express')
const router = express.Router();
const User = require('../../models/User')
const jwt = require('jsonwebtoken')
const assert = require('http-assert')
const secret = require('../../secret')
// ------------------

router.get('/delete', async (req, res) => {
    const result = await User.remove();
    res.send(result)
})
// ------------------
//创建用户
router.post('/create', async (req, res) => {
    //判断用户是否存在
    const { userName, phone } = req.body
    const user = await User.findOne({ userName })
    assert(!user, 422, '用户名已存在，请更换用户名')
    const phoneNumber = await User.findOne({ phone })
    assert(!phoneNumber, 422, '该手机号已被注册')
    //用户不存在则建立新用户
    const newUser = await User.create(req.body)
    assert(newUser, 500, "创建出错，请稍后再试")
    res.send(newUser.userName)
})

//用户登录
router.post('/login', async (req, res) => {
    const { phone, password } = req.body
    //根据用户名找到用户
    var user = await User.findOne({ phone }).select('+password')
    assert(user, 422, '用户不存在')
    //校验密码
    const isValid = require('bcryptjs').compareSync(password, user.password)
    assert(isValid, 422, '密码输入错误')
    //返回token及用户信息
    const token = jwt.sign({ id: user._id }, secret)
    let userInfo = await User.findOne({ phone })
    res.send({ userInfo, token })
})
//用户列表
router.get('/list', async (req, res) => {
    const users = await User.find();
    res.send(users);
    // res.send("vghdsvhgv" + req.params)
})
// 更新用户信息
router.post('/update/:id', async (req, res) => {
    const id = req.params.id
    const result = await User.findByIdAndUpdate({ "_id": id }, req.body);
    assert(result, 500, "更新信息出错");
    const userInfo = await User.findById(req.params.id);
    res.send(userInfo)
})

// 获取用户信息
router.get('/show/:id', async (req, res) => {
    const id = req.params.id;
    const user = await User.findOne({"_id":id},"userName email img")
    res.send(user)
})

module.exports = router