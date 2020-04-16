const express = require('express')
const router = express.Router();
const User = require('../../models/Users')
const jwt = require('jsonwebtoken')
const assert = require('http-assert')
const secret = require('../../secret')

//用户列表
router.get('/list', async (req, res) => {
    const users = await User.find();
    res.send(users);
})
// 用户信息
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    res.send('user' + id)
})

module.exports = router