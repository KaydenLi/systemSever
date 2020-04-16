const express = require('express')
const router = express.Router();
const Link = require('../../models/Link')
const assert = require('http-assert')

// 创建链接
router.post('/create', async (req, res) => {
    const link = await Link.create(req.body);
    assert(link, 500, "服务器错误");
    const links = await Link.find();
    res.send(links)
})
// 链接列表
router.get('/list', async (req, res) => {
    const links = await Link.find();
    res.send(links)
})
// 删除链接
router.delete('/delete/:id', async (req, res) => {
    let id = req.params.id;
    await Link.findByIdAndDelete({ "_id": id })
    const result = await Link.find();
    res.send(result)
})
// 获取链接
router.get('/:id', async (req, res) => {
    let id = req.params.id;
    const result = await Link.findById({ "_id": id })
    res.send(result)
})
// 修改链接
router.post('/update/:id', async (req, res) => {
    let id = req.params.id;
    const result = await Link.findByIdAndUpdate({ "_id": id }, req.body)
    assert(result, 500, "服务器错误");
    const links = await Link.find();
    res.send(links)
})
module.exports = router