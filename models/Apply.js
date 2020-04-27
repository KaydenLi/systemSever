// import mongoose from 'mongoose'
const mongoose = require('mongoose')

//定义申请授权项目相关schema，存储所有等待获得授权、已获得授权、授权失败项目
const schema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId },
    owner_id: { type: mongoose.Types.ObjectId },
    project_id: { type: mongoose.Types.ObjectId },
    createdTime: { type: Date },
    description: { type: String, default: "申请理由" },
    status: { type: String, enum: ['RESOLVE', 'REFUSE', 'WAIT', 'CANCEL'] },
    authDate: { type: Date }
})

module.exports = mongoose.model('Apply', schema, 'applies')