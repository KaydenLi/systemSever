const express = require('express')
const router = express.Router();
const User = require('../../models/User')
const jwt = require('jsonwebtoken')
const assert = require('http-assert')
const secret = require('../../secret')
const auth_middleware = require('../../middlewares/admin_auth_middleware');

//用户列表
router.get('/list', auth_middleware, async (req, res) => {
    const users = await User.find();
    res.send(users);
})
// 用户信息
router.get('/:id', auth_middleware, async (req, res) => {
    const id = req.params.id;
    const user = await User.findById({ "_id": id });
    res.send(user)
})

module.exports = router