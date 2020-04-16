const express = require('express')
const router = express.Router();
const Banner = require('../../models/Banner')

// 轮播图列表
router.get('/list', async (req, res) => {
    const banners = await Banner.find()
    res.send(banners)
})
// 轮播图详情
router.get('/:id', async (req, res) => {
    let id = req.params.id;
    const result = await Banner.findById({ "_id": id })
    res.send(result)
})

module.exports = router