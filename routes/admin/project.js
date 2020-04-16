const express = require('express')
const router = express.Router();
const Project = require('../../models/Project')

//所有项目列表
router.get('/list', async (req, res) => {
    const pageSize = parseInt(req.query.pageSize);
    const pageNumber = parseInt(req.query.pageNumber);
    const projects = await Project.find().skip((pageNumber - 1) * pageSize).limit(pageSize);
    res.send(projects);
})
//删除所有项目
router.delete('/delete/:id', async (req, res) => {
    let id = req.params.id;
    const result = await Project.findByIdAndDelete({ "_id": id });
    res.send(result);
})
//查看项目详情
router.delete('/:id', async (req, res) => {
    let id = req.params.id;
    const result = await Project.findById({ "_id": id });
    res.send(result);
})
// 查询项目总数
router.get(`/count`, async (req, res) => {
    const count = await Project.find().countDocuments();
    res.send(count);
})
//导出路由
module.exports = router