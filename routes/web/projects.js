const express = require('express')
const router = express.Router();
const Project = require('../../models/Project')
const User = require('../../models/User')
const Apply = require('../../models/Apply')
const Sensor = require('../../models/Sensor')
const assert = require('http-assert')
const auth_middleware = require('../../middlewares/auth_middleware')
const has_project_auth_middleware = require('../../middlewares/has_project_auth')
const WaitingProject = require('../../models/WaitingProject')
//----------------//
//所有项目列表---测试使用
router.get('/list', async (req, res) => {
    const projects = await Project.find();
    res.send(projects);
})
//删除所有项目---测试使用
router.get('/delete', async (req, res) => {
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
router.get('/sensor/delete', async (req, res) => {
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
    // 将项目加入到用户项目列表中
    let userId = req.user._id;
    let ids = req.user.projects_id;
    ids.push(newProject._id);
    const addFlag = await User.findByIdAndUpdate(userId, { projects_id: ids });
    assert(addFlag, 500, "服务器错误，请重试");
    // 将项目加入到等待授权项目列表中
    let body = {};
    body.createTime = new Date();
    body.projectId = newProject._id;
    body.userId = req.user._id;
    body.userName = req.user.userName;
    body.projectName = newProject.projectName;
    const waiting = await WaitingProject.create(body)
    assert(waiting, 500, "服务器错误")
    res.send(newProject);
})
// 删除项目
router.delete('/:id', auth_middleware, has_project_auth_middleware, async (req, res) => {
    const projectId = req.params.id;
    await Project.findByIdAndDelete(projectId);
    await Apply.remove({ "project_id": projectId });
    await WaitingProject.findOneAndDelete({ "projectId": projectId });
    let userId = req.user._id;
    let ids = [];
    req.user.projects_id.forEach(id => {
        if (id.toString() !== projectId.toString()) {
            ids.push(id)
        }
    });
    const decFlag = await User.findByIdAndUpdate(userId, { projects_id: ids });
    assert(decFlag, 500, "删除出错");
    res.send("ok");
})
//判断项目是否可使用
router.get('/:id/operation', auth_middleware, async (req, res) => {
    const id = req.params.id;
    const project = await Project.findById({ "_id": id });
    res.send(project.operationFlag || false);
})
//判断项目是否开放
router.get('/:id/openstatus', auth_middleware, async (req, res) => {
    const id = req.params.id;
    const project = await Project.findById({ "_id": id });
    res.send(project.openStatus || false);
})
//用户项目列表
router.get('/:userid/list', auth_middleware, async (req, res) => {
    let ids = req.user.projects_id;
    const projects = await Project.aggregate([
        {
            $match: { _id: { $in: ids } }
        }
    ])
    let result = {};
    result.projects = projects;
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
router.get('/show/:id', auth_middleware, async (req, res) => {
    const id = req.params.id;
    const project = await Project.findOne({ "_id": id }, "projectName img province createdTime city address openStatus ownerId obj mtl");
    assert(project, 404, "项目不存在");
    if (project.openStatus === false) {
        assert(false, 402, "项目未开放，没有操作权限")
    }
    res.send(project);
})
//获取项目详细信息
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
//授权用户获取测点数据
router.get('/:id/authsensor', auth_middleware, async (req, res) => {
    const userId = req.user._id;
    const id = req.params.id;
    const tmps = await Apply.find({ "project_id": id });
    let flag = false;
    tmps.some(item => {
        if (item.user_id.toString() === userId.toString()) { flag = true; return; }
    });
    assert(flag, 401, "没有权限查看")
    const sensorData = await Sensor.find({ "projectId": id });
    assert(sensorData, 500, "查询节点信息出错，请稍后再试");
    // 格式化数据，使授权用户只能看到部分数据
    let tableData = []
    sensorData.forEach(planes => {
        let plane = planes.name;
        planes.children.forEach(sites => {
            let site = sites.name;
            sites.value.forEach(points => {
                let tmpdata = {};
                tmpdata.ratio = points.ratio;
                tmpdata.name = points.name;
                tmpdata.type = points.type;
                tmpdata.unit = points.unit;
                tmpdata.value = points.value;
                tmpdata.site = site;
                tmpdata.plane = plane;
                tableData.push(tmpdata);
            });
        });
    });
    res.send(tableData);
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