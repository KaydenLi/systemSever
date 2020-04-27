// import mongoose from 'mongoose'
const mongoose = require('mongoose')

//定义项目schema，存储所有项目
const schema = new mongoose.Schema({
    title: { type: String },
    createTime: { type: Date },
    url: { type: String }
})

module.exports = mongoose.model('Link', schema, 'links')
