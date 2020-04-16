const express = require('express')
const router = express.Router();
const Banner = require('../../models/Banner')

// 创建轮播图
router.post('/create', async (req, res) => {
    const banner = await Banner.create(req.body)
    res.send(banner)
})
// 轮播图列表
router.get('/list', async (req, res) => {
    const banners = await Banner.find()
    res.send(banners)
})
// 删除轮播图
router.delete('/delete/:id', async (req, res) => {
    let id = req.params.id;
    await Banner.findByIdAndDelete({ "_id": id })
    const result = await Banner.find();
    res.send(result)
})
// 获取轮播图
router.get('/:id', async (req, res) => {
    let id = req.params.id;
    const result = await Banner.findById({ "_id": id })
    res.send(result)
})
// 修改轮播图
router.post('/update/:id', async (req, res) => {
    let id = req.params.id;
    const result = await Banner.findByIdAndUpdate({ "_id": id }, req.body)
    res.send(result)
})
module.exports = router