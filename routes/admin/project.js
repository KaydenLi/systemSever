const express = require('express')
const mongoose = require('mongoose')
const router = express.Router();
const Project = require('../../models/Project')
const auth_middleware = require('../../middlewares/admin_auth_middleware');

//分页项目列表
router.get('/list', auth_middleware, async (req, res) => {
    const pageSize = parseInt(req.query.pageSize);
    const pageNumber = parseInt(req.query.pageNumber);
    const projects = await Project.find().skip((pageNumber - 1) * pageSize).limit(pageSize);
    res.send(projects);
})

// 查询项目总数
router.get('/count', auth_middleware, async (req, res) => {
    const count = await Project.find().countDocuments();
    res.send(count);
})

//查看项目详情
router.get('/:id', auth_middleware, async (req, res) => {
    let id = req.params.id;
    const projects = await Project.findById({ "_id": id });
    res.send(projects);
})
//导出路由
module.exports = router