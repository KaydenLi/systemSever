// import mongoose from 'mongoose'
const mongoose = require('mongoose')

//定义项目schema，存储所有项目
const schema = new mongoose.Schema({
    projectId: { type: String },
    userId: { type: String },
    createTime: { type: Date },
    userName: { type: String },
    projectName: { type: String }
})

module.exports = mongoose.model('WaitingProject', schema,'waitingprojects')
