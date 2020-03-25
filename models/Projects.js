// import mongoose from 'mongoose'
const mongoose = require('mongoose')

//定义项目schema，存储所有项目
const schema = new mongoose.Schema({
    projectName: { type: String },
    createdTime: { type: Date },
    openStatus: { type: Boolean, default: false },
    address: { type: String, default: "cn" },
    watchers_id: { type: Array, default: [] },
    img: { type: String },
    timePoints: { type: String },
    idPoints: { type: String },
})

module.exports = mongoose.model('Project', schema)
