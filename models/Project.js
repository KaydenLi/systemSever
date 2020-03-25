// import mongoose from 'mongoose'
const mongoose = require('mongoose')

//定义项目schema，存储所有项目
const schema = new mongoose.Schema({
    projectkName: { type: String },
    projectAddress: { type: String },
    aim: { type: String },
    type: { type: String }
})

module.exports = mongoose.model('Project', schema)
