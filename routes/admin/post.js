const express = require('express')
const router = express.Router();
const Post = require('../../models/Post')
const jwt = require('jsonwebtoken')
const assert = require('http-assert')
const auth_middleware = require('../../middlewares/admin_auth_middleware');

//获取通告列表
router.get('/list', auth_middleware, async (req, res) => {
    const posts = await Post.find().sort({ 'createTime': -1 });
    res.send(posts)
})
// 创建新通告
router.post('/create', auth_middleware, async (req, res) => {
    const post = await Post.create(req.body)
    res.send(post)
})
// 删除通告
router.delete('/delete/:id', auth_middleware, async (req, res) => {
    const id = req.params.id;
    const result = await Post.findByIdAndDelete({ "_id": id });
    res.send(result)
})
//通告详情
router.get('/:id', auth_middleware, async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById({ "_id": id });
    res.send(post)
})
//修改通告
router.post('/update/:id', auth_middleware, async (req, res) => {
    const id = req.params.id;
    const result = await Post.findByIdAndUpdate({ "_id": id }, req.body);
    res.send(result)
})
module.exports = router