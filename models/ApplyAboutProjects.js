// import mongoose from 'mongoose'
const mongoose = require('mongoose')

//定义申请授权项目相关schema，存储所有等待获得授权、已获得授权、授权失败项目
const schema = new mongoose.Schema({
    user_id: { type: String},
    projects: [
        {
            owner_id: { type: String},
            project_id: { type: String},
            createdTime: { type: String},
            description: { type: String},
            status: { type: String},
            authDate: { type: String}
        }
    ]
})

module.exports = mongoose.model('ApplyProject', schema)