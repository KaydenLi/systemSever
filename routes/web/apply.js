const express = require('express')
const mongoose = require('mongoose')
const router = express.Router();
const Apply = require('../../models/Apply')
const Project = require('../../models/Project')
const User = require('../../models/User')
const assert = require('http-assert')
const auth_middleware = require('../../middlewares/auth_middleware')

// -------------------------测试使用
// 获取申请列表
router.get('/list', async (req, res) => {
    const projects = await Apply.find();
    res.send(projects);
})
// 删除申请列表
router.get('/delete', async (req, res) => {
    const projects = await Apply.remove();
    res.send(projects);
})
// 聚合查询测试
router.get('/test', async (req, res) => {
    // const result = await Apply.find();
    await Apply.aggregate([
        {
            $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'userInfo' }
        },
        {
            $lookup: { from: "projects", localField: "project_id", foreignField: "_id", as: "projectInfo" }
        },
        {
            $project: {
                user_id: 1, project_id: 1, owner_id: 1, description: 1, status: 1, userInfo: { userName: 1 }, projectInfo: { projectName: 1, province: 1, city: 1, address: 1 }, createdTime: 1
            }
        },
        {
            $match: {
                "user_id": mongoose.Types.ObjectId("5e899a92cd496b79c9c46664"),
                // "status": "RESOLVE"
            }
        }
    ], (err, docs) => {
        if (err) {
            console.log(err)
        }
        // let result= JSON.parse(JSON.stringify(docs))
        res.send(docs);

    });
})
// -------------------------
// 申请授权
router.get('/getapply/:id', auth_middleware, async (req, res) => {
    const userId = req.user._id;
    const id = req.params.id;
    // 检查是否已经申请过
    let done = await Apply.find({ "user_id": userId });
    done.forEach(item => {
        if (item.project_id.toString() === id.toString()) {
            assert(false, 406, "已经申请过该项目，请勿重复申请授权")
        }
    })
    // 初始化基本信息
    let data = {};
    // 存储申请用户id
    data.user_id = mongoose.Types.ObjectId(userId);
    data.project_id = mongoose.Types.ObjectId(id);
    data.createdTime = new Date();
    data.status = "WAIT";
    let project = await Project.findById({ "_id": id })
    assert(project, 500, "服务器错误");
    // 存储项目所属用户id
    data.owner_id = mongoose.Types.ObjectId(project.ownerId);
    if (data.user_id && data.owner_id) {
        let self = (data.user_id.toString() === data.owner_id.toString());
        assert(!self, 406, "无法申请查看自己的项目");
        // 创建一个申请项目
        const result = await Apply.create(data);
        assert(result, 500, "服务器错误");
        // 返回"ok"表示创建成功
        res.send("ok")
    } else {
        assert(false, 409, "申请查看出错")
    }
})
// 获取申请项目
router.get('/applys', auth_middleware, async (req, res) => {
    let userId = req.user._id;
    // const toQuest = await Apply.find({ "user_id": userId, "status": "WAIT" });
    // const getAuthed = await Apply.find({ "user_id": userId, "status": "RESOLVE" });

    const toQuests = await Apply.aggregate([
        {
            $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'userInfo' }
        },
        {
            $lookup: { from: "projects", localField: "project_id", foreignField: "_id", as: "projectInfo" }
        },
        {
            $project: {
                user_id: 1, project_id: 1, owner_id: 1, description: 1, status: 1, userInfo: { userName: 1 }, projectInfo: { projectName: 1, province: 1, city: 1, address: 1 }, createdTime: 1
            }
        },
        {
            $match: {
                "user_id": mongoose.Types.ObjectId(userId),
                "status": "WAIT"
            }
        }
    ]);
    let toQuest = JSON.parse(JSON.stringify(toQuests));
    const getAutheds = await Apply.aggregate([
        {
            $lookup: { from: 'users', localField: 'owner_id', foreignField: '_id', as: 'userInfo' }
        },
        {
            $lookup: { from: "projects", localField: "project_id", foreignField: "_id", as: "projectInfo" }
        },
        {
            $project: {
                user_id: 1, project_id: 1, owner_id: 1, description: 1, status: 1, userInfo: { userName: 1 }, projectInfo: { projectName: 1, province: 1, city: 1, address: 1, openStatus: 1 }, createdTime: 1
            }
        },
        {
            $match: {
                "user_id": mongoose.Types.ObjectId(userId),
                "status": "RESOLVE"
            }
        }
    ]);
    let getAuthed = JSON.parse(JSON.stringify(getAutheds));

    res.send({ toQuest, getAuthed });
})
// 获取授权项目
router.get('/auths', auth_middleware, async (req, res) => {
    let userId = req.user._id;
    // const toCheck = await Apply.find({ "owner_id": userId, "status": "WAIT" });
    const toChecks = await Apply.aggregate([
        {
            $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'userInfo' }
        },
        {
            $lookup: { from: "projects", localField: "project_id", foreignField: "_id", as: "projectInfo" }
        },
        {
            $project: {
                user_id: 1, project_id: 1, owner_id: 1, description: 1, status: 1, userInfo: { userName: 1 }, projectInfo: { projectName: 1, province: 1, city: 1, address: 1 }, createdTime: 1
            }
        },
        {
            $match: {
                "owner_id": mongoose.Types.ObjectId(userId),
                "status": "WAIT"
            }
        }
    ]);
    let toCheck = JSON.parse(JSON.stringify(toChecks));

    // 用户开放项目列表
    const getChecked = await Project.find({ "ownerId": userId, "openStatus": true });
    res.send({ toCheck, getChecked });
})
// 授权页面详情
router.get('/detail/:id', auth_middleware, async (req, res) => {
    let id = req.params.id;
    // const project = await Apply.findById({ "_id": id });
    const projects = await Apply.aggregate([
        {
            $lookup: { from: 'users', localField: 'owner_id', foreignField: '_id', as: 'userInfo' }
        },
        {
            $lookup: { from: "projects", localField: "project_id", foreignField: "_id", as: "projectInfo" }
        },
        {
            $project: {
                user_id: 1, project_id: 1, owner_id: 1, description: 1, status: 1, userInfo: { userName: 1 }, projectInfo: { projectName: 1, province: 1, city: 1, address: 1 }, createdTime: 1
            }
        },
        {
            $match: {
                "_id": mongoose.Types.ObjectId(id),
            }
        }
    ]);
    let project = JSON.parse(JSON.stringify(projects));

    assert(project, 500, "服务器错误");
    res.send(project);
})
// 申请页面详情
router.get('/applydetail/:id', auth_middleware, async (req, res) => {
    let id = req.params.id;
    // const project = await Apply.findById({ "_id": id });
    const projects = await Apply.aggregate([
        {
            $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'userInfo' }
        },
        {
            $lookup: { from: "projects", localField: "project_id", foreignField: "_id", as: "projectInfo" }
        },
        {
            $project: {
                user_id: 1, project_id: 1, owner_id: 1, description: 1, status: 1, userInfo: { userName: 1 }, projectInfo: { projectName: 1, province: 1, city: 1, address: 1 }, createdTime: 1
            }
        },
        {
            $match: {
                "_id": mongoose.Types.ObjectId(id),
            }
        }
    ]);
    let project = JSON.parse(JSON.stringify(projects));

    assert(project, 500, "服务器错误");
    res.send(project);
})
// 同意授权
router.get('/acquirequest/:id', auth_middleware, async (req, res) => {
    let id = req.params.id;
    let date = new Date();
    const project = await Apply.findByIdAndUpdate({ "_id": id }, { "status": "RESOLVE", "authDate": date });
    assert(project, 500, "服务器错误");
    res.send("ok");
})
// 取消申请
router.get('/cancelrequest/:id', auth_middleware, async (req, res) => {
    let id = req.params.id;
    const project = await Apply.findByIdAndUpdate({ "_id": id }, { "status": "CANCEL" });
    assert(project, 500, "服务器错误");
    res.send("ok");
})
// 拒绝授权
router.get('/rejectrequest/:id', auth_middleware, async (req, res) => {
    let id = req.params.id;
    const project = await Apply.findByIdAndUpdate({ "_id": id }, { "status": "REFUSE" });
    assert(project, 500, "服务器错误");
    res.send("ok");
})
// 申请记录
router.get('/applylist', auth_middleware, async (req, res) => {
    let id = req.user._id;
    const projects = await Apply.aggregate([
        {
            $lookup: { from: 'users', localField: 'owner_id', foreignField: '_id', as: 'userInfo' }
        },
        {
            $lookup: { from: "projects", localField: "project_id", foreignField: "_id", as: "projectInfo" }
        },
        {
            $project: {
                user_id: 1, project_id: 1, owner_id: 1, description: 1, status: 1, userInfo: { userName: 1 }, projectInfo: { projectName: 1, province: 1, city: 1, address: 1 }, createdTime: 1
            }
        },
        {
            $match: {
                "user_id": mongoose.Types.ObjectId(id),
            }
        }
    ]);
    assert(projects, 500, "服务器错误");
    res.send(projects);
})
// 授权记录
router.get('/authlist', auth_middleware, async (req, res) => {
    let id = req.user._id;
    // const projects = await Apply.find({ "owner_id": id });
    const projects = await Apply.aggregate([
        {
            $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'userInfo' }
        },
        {
            $lookup: { from: "projects", localField: "project_id", foreignField: "_id", as: "projectInfo" }
        },
        {
            $project: {
                user_id: 1, project_id: 1, owner_id: 1, description: 1, status: 1, userInfo: { userName: 1 }, projectInfo: { projectName: 1, province: 1, city: 1, address: 1 }, createdTime: 1
            }
        },
        {
            $match: {
                "owner_id": mongoose.Types.ObjectId(id),
            }
        }
    ]);
    let project = JSON.parse(JSON.stringify(projects));

    assert(project, 500, "服务器错误");
    res.send(project);
})
module.exports = router