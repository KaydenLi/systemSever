const express = require('express')
const router = express.Router();
const Post = require('../../models/Post')

//获取通告列表
router.get('/lists', async (req, res) => {
    const posts = await Post.find().sort({ 'createTime': -1 });
    res.send(posts)
})

//获取通告列表
router.get('/list', async (req, res) => {
    const posts = await Post.find().sort({ 'createTime': -1 }).limit(5);
    res.send(posts)
})

//通告详情
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById({ "_id": id });
    res.send(post)
})

module.exports = router