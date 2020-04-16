const express = require('express')
const router = express.Router();
const Project = require('../../models/Project')
const User = require('../../models/Users')
const Sensor = require('../../models/Sensor')
const assert = require('http-assert')
const auth_middleware = require('../../middlewares/auth_middleware')
const has_project_auth_middleware = require('../../middlewares/has_project_auth')

//----------------//
//所有项目列表---测试使用
router.get('/list', async (req, res) => {
    const projects = await Project.find();
    res.send(projects);
})
//删除所有项目---测试使用
router.delete('/delete', async (req, res) => {
    var result = await Project.remove();
    res.send(result);
})
//获取传感器列表
router.get('/sensor/list', async (req, res) => {
    const config = await Sensor.find();
    res.send(config);
})
//获取项目列表
router.get('/item/list', async (req, res) => {
    const config = await Project.find();
    res.send(config);
})
//删除传感器信息
router.delete('/sensor/delete', async (req, res) => {
    const result = await Sensor.remove();
    res.send(result);
})
//重置信息项
router.post('/:id/edit', async (req, res) => {
    const id = req.params.id;
    let tmp = [];
    const update = await Project.findByIdAndUpdate({ _id: id }, { baseInfo: tmp });
    assert(update, 500, "添加信息项出错，请稍后再试");
    const projectInfo = await Project.findById(id);
    res.send(projectInfo);
})
//----------------//

//创建项目
router.post('/create', auth_middleware, async (req, res) => {
    //判断项目是否存在
    const { projectName } = req.body;
    const project = await Project.findOne({ projectName });
    assert(!project, 422, '该项目已存在，请更改项目名称后重试');
    //项目不存在则建立新项目
    const address = req.body.address;
    req.body.province = address.split('省')[0] + "省" || "";
    req.body.city = address.split('省')[1].split("市")[0] + "市" || "";
    req.body.address = address.split("市")[1] || address;
    req.body.ownerId = req.user._id;
    const newProject = await Project.create(req.body);
    assert(newProject, 500, "创建出错，请稍后再试");
    let userId = req.user.id;
    let ids = req.user.projects_id;
    ids.push(newProject._id);
    const addFlag = await User.findByIdAndUpdate(userId, { projects_id: ids });
    assert(addFlag, 500, "服务器错误，请重试");
    res.send(newProject);
})
//用户项目列表
router.get('/:userid/list', auth_middleware, async (req, res) => {
    let ids = req.user.projects_id;
    const projects = await Project.aggregate([
        {
            $match: { _id: { $in: ids } }
        }
    ])
    let applyWaitProjects_ids = req.user.applyWaitProjects_id;
    const applyWaitProjects = await Project.aggregate([
        {
            $match: { _id: { $in: applyWaitProjects_ids } }
        }
    ])
    let authWaitProjects_ids = req.user.authWaitProjects_id;
    const authWaitProjects = await Project.aggregate([
        {
            $match: { _id: { $in: authWaitProjects_ids } }
        }
    ])
    let getAuthedProjects_ids = req.user.getAuthedProjects_id;
    const getAuthedProjects = await Project.aggregate([
        {
            $match: { _id: { $in: getAuthedProjects_ids } }
        }
    ])
    let getCheckedProjects_ids = req.user.getCheckedProjects_id;
    const getCheckedProjects = await Project.aggregate([
        {
            $match: { _id: { $in: getCheckedProjects_ids } }
        }
    ])
    let result = {};
    result.projects = projects;
    result.applyWaitProjects = applyWaitProjects;
    result.authWaitProjects = authWaitProjects;
    result.getAuthedProjects = getAuthedProjects;
    result.getCheckedProjects = getCheckedProjects;
    res.send(result);
})
//开放项目列表
router.get('/open', async (req, res) => {
    const pageSize = parseInt(req.query.pageSize);
    const pageNumber = parseInt(req.query.pageNumber);
    const projects = await Project.find({ "openStatus": true }).skip((pageNumber - 1) * pageSize).limit(pageSize);
    res.send(projects);
})
// 开放项目数
router.get('/opencount', async (req, res) => {
    const count = await Project.find({ "openStatus": true }).countDocuments();
    res.send(count);
})
//获取项目基本信息
router.get('/:id', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const id = req.params.id;
    const project = await Project.findById(id);
    assert(project, 500, "服务器错误");
    res.send(project);
})
//更新项目基本信息
router.post('/:id/update', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const id = req.params.id;
    const update = await Project.findByIdAndUpdate({ "_id": id }, req.body);
    assert(update, 500, "修改信息出错，请稍后再试");
    const project = await Project.findById(id);
    assert(project, 500, "修改信息出错，请稍后再试");
    res.send(project);
})
//更新项目obj/mtl模型信息
router.post('/:id/updatemodel', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const id = req.params.id;
    const update = await Project.findByIdAndUpdate({ "_id": id }, { "obj": req.body.obj, "mtl": req.body.mtl });
    assert(update, 500, "修改信息出错，请稍后再试");
    const project = await Project.findById(id);
    assert(project, 500, "修改信息出错，请稍后再试");
    res.send(project);
})
//添加信息项
router.post('/:id/addinfo', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const id = req.params.id;
    const project = await Project.findById(id);
    let baseInfo = project.baseInfo;
    baseInfo.push(req.body);
    const update = await Project.findByIdAndUpdate({ "_id": id }, { baseInfo: baseInfo });
    assert(update, 500, "添加信息项出错，请稍后再试");
    const projectInfo = await Project.findById(id);
    res.send(projectInfo);
})
//修改信息项
router.post('/:id/editinfo/:itemId', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const id = req.params.id;
    const itemId = req.params.itemId;
    const tmp = await Project.findById({ "_id": id });
    let baseInfoItems = tmp.baseInfo;
    let baseInfo = [];
    baseInfoItems.forEach(item => {
        if (item._id.toString() === itemId.toString()) {
            baseInfo.push(req.body);
        } else {
            baseInfo.push(item);
        }
    })
    const update = await Project.findByIdAndUpdate({ "_id": id }, { baseInfo: baseInfo });
    assert(update, 500, "更改信息项出错，请稍后再试");
    const projectInfo = await Project.findById(id);
    res.send(projectInfo);
})
//删除信息项
router.post('/:id/deleteinfo/:itemId', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const id = req.params.id;
    const itemId = req.params.itemId;
    let tmp = [];
    const data = await Project.findById(id);
    data.baseInfo.forEach(item => {
        if (item._id.toString() !== itemId.toString()) {
            tmp.push(item);
        }
    })
    const deleteinfo = await Project.findByIdAndUpdate({ "_id": id, "baseInfo._id": itemId }, { baseInfo: tmp });
    assert(deleteinfo, 500, "添加信息项出错，请稍后再试");
    const projectInfo = await Project.findById(id);
    res.send(projectInfo);
})
//上传excel项目测点布置数据
router.post('/:id/import', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const projectId = req.params.id;
    await Sensor.deleteMany({ projectId: projectId });
    req.body.forEach(async item => {
        let sensor = {};
        sensor = item;
        sensor.projectId = projectId;
        sensor.currentTime = new Date();
        sensor.timeStamp = 60;
        const itemdata = await Sensor.create(item);
        assert(itemdata, 500, "添加节点信息出错，请稍后再试");
    });
    res.send({
        status: true
    })
})
//获取测点数据
router.get('/:id/sensor', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const id = req.params.id;
    const sensorData = await Sensor.find({ "projectId": id });
    assert(sensorData, 500, "查询节点信息出错，请稍后再试");
    res.send(sensorData);
})
//添加项目测区布置数据
router.post('/:id/importplane', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const projectId = req.params.id;
    let sensor = {};
    sensor.name = req.body.name;
    sensor.projectId = projectId;
    sensor.img = req.body.img;
    sensor.currentTime = new Date();
    sensor.timeStamp = req.body.timeStamp;
    const itemdata = await Sensor.create(sensor);
    assert(itemdata, 500, "添加节点信息出错，请稍后再试");
    const sensorData = await Sensor.find({ "projectId": projectId })
    assert(sensorData, 500, "添加节点信息出错，请稍后再试");
    res.send(sensorData);
})
//删除项目测区布置数据
router.delete('/:id/deleteplane/:planeId', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const id = req.params.id;
    const planeId = req.params.planeId;
    const deleteInfo = await Sensor.findByIdAndDelete({ "_id": planeId })
    assert(deleteInfo, 500, "删除节点信息出错，请稍后再试");
    const sensorData = await Sensor.find({ "projectId": id })
    assert(sensorData, 500, "删除节点信息出错，请稍后再试");
    res.send(sensorData);
})
//修改项目测区布置数据
router.post('/:id/editplane/:planeId', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const id = req.params.id;
    const planeId = req.params.planeId;
    const deleteInfo = await Sensor.findByIdAndUpdate({ "_id": planeId }, req.body)
    assert(deleteInfo, 500, "修改节点信息出错，请稍后再试");
    const sensorData = await Sensor.find({ "projectId": id })
    assert(sensorData, 500, "修改节点信息出错，请稍后再试");
    res.send(sensorData);
})
//添加项目测站布置数据
router.post('/:id/importsite/:planeId', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const projectId = req.params.id;
    const planeId = req.params.planeId;
    const sensor = await Sensor.findById({ "_id": planeId });
    let children = sensor.children;
    let child = {};
    child.value = [];
    child.name = req.body.name;
    child.machineinfo = req.body.machineinfo;
    children.push(child)
    const sitedata = await Sensor.findByIdAndUpdate({ "_id": planeId }, { "children": children });
    assert(sitedata, 500, "添加节点信息出错，请稍后再试");
    const sensorData = await Sensor.find({ "projectId": projectId })
    assert(sensorData, 500, "添加节点信息出错，请稍后再试");
    res.send(sensorData);
})
//删除项目测站布置数据
router.delete('/:id/deletesite/:planeId/:siteId', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const projectId = req.params.id;
    const id = req.params.planeId;
    const siteId = req.params.siteId;
    const sensor = await Sensor.findById({ "_id": id })
    let site = sensor.children;
    let tmp = [];
    site.forEach(item => {
        if (item._id.toString() !== siteId.toString()) {
            tmp.push(item)
        }
    })
    const result = await Sensor.findByIdAndUpdate({ "_id": id }, { "children": tmp })
    assert(result, 500, "删除测站信息出错，请稍后再试");
    const sensorData = await Sensor.find({ "projectId": projectId })
    res.send(sensorData);
})
//修改项目测站布置数据
router.post('/:id/editsite/:planeId/:siteId', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const projectId = req.params.id;
    const id = req.params.planeId;
    const siteId = req.params.siteId;
    const sensor = await Sensor.findById({ "_id": id })
    let site = sensor.children;
    let tmp = [];
    site.forEach(item => {
        if (item._id.toString() !== siteId.toString()) {
            tmp.push(item)
        } else {
            tmp.push(req.body);
        }
    })
    const result = await Sensor.findByIdAndUpdate({ "_id": id }, { "children": tmp })
    assert(result, 500, "修改测站信息出错，请稍后再试");
    const sensorData = await Sensor.find({ "projectId": projectId })
    res.send(sensorData);
})
//添加项目测点布置数据
router.post('/:id/importpoint/:planeId/:siteId', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const projectId = req.params.id;
    const planeId = req.params.planeId;
    const siteId = req.params.siteId;
    const tmpSite = await Sensor.find({ "_id": planeId });
    let tmpPoint = tmpSite[0].children;
    let tmp = [];
    tmpPoint.forEach(item => {
        if (item._id.toString() === siteId.toString()) {
            let tmp2 = item;
            tmp2.value.push(req.body);
            tmp.push(tmp2);
        } else {
            tmp.push(item)
        }
    })
    await Sensor.findByIdAndUpdate({ "_id": planeId }, { "children": tmp });
    const sensorData = await Sensor.find({ "projectId": projectId })
    assert(sensorData, 500, "添加测点信息出错，请稍后再试");
    res.send(sensorData);
})
//删除项目测点布置数据
router.delete('/:id/deletepoint/:planeId/:siteId/:pointId', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const projectId = req.params.id;
    const planeId = req.params.planeId;
    const siteId = req.params.siteId;
    const pointId = req.params.pointId;
    const tmpSite = await Sensor.find({ "_id": planeId });
    let tmpPoint = tmpSite[0].children;
    let tmp = [];
    tmpPoint.forEach(item => {
        if (item._id.toString() === siteId.toString()) {
            let tmp2 = item;
            let value = [];
            item.value.forEach(item2 => {
                if (item2._id.toString() !== pointId.toString()) {
                    value.push(item2);
                }
            })
            tmp2.value = value;
            tmp.push(tmp2);
        } else {
            tmp.push(item)
        }
    })
    await Sensor.findByIdAndUpdate({ "_id": planeId }, { "children": tmp });
    const sensorData = await Sensor.find({ "projectId": projectId })
    assert(sensorData, 500, "删除测点信息出错，请稍后再试");
    res.send(sensorData);
})
//修改项目测点布置数据
router.post('/:id/editpoint/:planeId/:siteId/:pointId', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const projectId = req.params.id;
    const planeId = req.params.planeId;
    const siteId = req.params.siteId;
    const pointId = req.params.pointId;
    const tmpSite = await Sensor.find({ "_id": planeId });
    let tmpPoint = tmpSite[0].children;
    let tmp = [];
    tmpPoint.forEach(item => {
        if (item._id.toString() === siteId.toString()) {
            let tmp2 = item;
            let value = [];
            item.value.forEach(item2 => {
                if (item2._id.toString() !== pointId.toString()) {
                    value.push(item2);
                } else {
                    value.push(req.body)
                }
            })
            tmp2.value = value;
            tmp.push(tmp2);
        } else {
            tmp.push(item)
        }
    })
    await Sensor.findByIdAndUpdate({ "_id": planeId }, { "children": tmp });
    const sensorData = await Sensor.find({ "projectId": projectId })
    assert(sensorData, 500, "编辑测点信息出错，请稍后再试");
    res.send(sensorData);
})

//导出路由
module.exports = router