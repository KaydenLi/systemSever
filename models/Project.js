// import mongoose from 'mongoose'
const mongoose = require('mongoose')

//定义项目schema，存储所有项目
const schema = new mongoose.Schema({
    ownerId: { type: String },
    projectName: {
        type: String
    },//项目名称
    authed: { type: Boolean, default: false },
    province: { type: String },
    city: { type: String },
    address: { type: String, default: "cn" },//项目详细地址
    lng: { type: Number },//经度
    lat: { type: Number },//纬度
    obj: { type: String },//obj文件地址
    mtl: { type: String },//mtl文件地址
    structuralType: { type: String },//结构类型
    createdTime: { type: Date },//创建时间
    threshlod: {
        strength: { type: Number, default: 0 },
        limit: { type: Number, default: 0 },
        rate: { type: Number, default: 0 },
        absolute: { type: Number, default: 0 }
    },//阈值
    openStatus: { type: Boolean, default: false },//开放状态
    operationFlag: { type: Boolean, default: false },
    watchersId: { type: Number, default: 0 },//获得授权者
    img: { type: String },//项目图片
    planeId: { type: Array },//测区
    estimationInfo: {
        statusLevel: { type: String, default: "A" },
        damage: { type: String, default: "1" }
    },
    lifeEstimationInfo: {
        statusLevel: { type: String, default: "A" },
        damage: { type: String, default: "1" }
    },
    baseInfo: [
        {
            name: { type: String },
            icon: { type: String },
            value: { type: String },
            unit: { type: String }
        }
    ]
})

module.exports = mongoose.model('Project', schema, 'projects')
