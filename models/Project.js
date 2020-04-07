// import mongoose from 'mongoose'
const mongoose = require('mongoose')

//定义项目schema，存储所有项目
const schema = new mongoose.Schema({
    ownerId: { type: String },
    projectName: {
        type: String
    },//项目名称
    authed: { type: Boolean, default: false },
    address: { type: String, default: "cn" },//项目地址
    structuralType: { type: String },//结构类型
    createdTime: { type: Date },//创建时间
    openStatus: { type: Boolean, default: false },//开放状态
    watchersId: { type: Array, default: [] },//获得授权者
    img: { type: String },//项目图片
    planeId: { type: Array },//测区
    baseInfo: [
        {
            name: { type: String },
            icon: { type: String },
            value: { type: String },
            unit: { type: String }
        }
    ]
})

module.exports = mongoose.model('Project', schema)
