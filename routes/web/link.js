const express = require('express')
const router = express.Router();
const Link = require('../../models/Link')
const assert = require('http-assert')

// 链接列表
router.get('/list', async (req, res) => {
    const links = await Link.find();
    assert(links, 500, "获取链接列表失败")
    res.send(links)
})
// 获取链接
router.get('/:id', async (req, res) => {
    let id = req.params.id;
    const result = await Link.findById({ "_id": id })
    res.send(result)
})

module.exports = router