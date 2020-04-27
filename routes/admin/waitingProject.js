const express = require('express');
const router = express.Router();
const assert = require('http-assert');
const Wait = require('../../models/WaitingProject');
const Project = require('../../models/Project');
const auth_middleware = require('../../middlewares/admin_auth_middleware');

//获取待授权列表
router.get('/list', auth_middleware, async (req, res) => {
    const project = await Wait.find().sort({ 'createTime': -1 });
    res.send(project);
})
// 项目授权
router.get('/auth/:id', auth_middleware, async (req, res) => {
    let id = req.params.id;
    const project = await Wait.findById({ "_id": id });
    assert(project, 404, "该项目已被发布者删除");
    let projectId = project.projectId;
    await Project.findByIdAndUpdate({ "_id": projectId }, { "operationFlag": true });
    const del = await Wait.findByIdAndRemove({ "_id": id });
    assert(del, 500, "服务器错误");
    const projects = await Wait.find().sort({ 'createTime': -1 });
    res.send(projects);
})
// 拒绝授权
router.get('/deny/:id', auth_middleware, async (req, res) => {
    let id = req.params.id;
    const project = await Wait.findById({ "_id": id });
    assert(project, 404, "该项目已被发布者删除");
    let projectId = project.projectId;
    await Project.findByIdAndRemove({ "_id": projectId });
    const del = await Wait.findByIdAndRemove({ "_id": id });
    assert(del, 500, "服务器错误");
    const projects = await Wait.find().sort({ 'createTime': -1 });
    res.send(projects);
})
//详情
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const project = await Wait.findById({ "_id": id });
    res.send(project)
})

module.exports = router