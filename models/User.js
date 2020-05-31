// import mongoose from 'mongoose'
const mongoose = require('mongoose')
// const bcrypts = require('bcryptsjs')
//定义用户schema，存储所有用户
const schema = new mongoose.Schema({
    userName: { type: String },    //用户名称
    //用户密码
    password: {
        type: String,
        select: false,
        set(val) {
            return require('bcryptjs').hashSync(val, 10)
        }
    },
    createdTime: { type: Date },//注册时间
    adminFlag: { type: Boolean, default: false },//管理员、普通用户状态
    welcomeFlag: { type: Boolean, default: true },
    address: { type: String },//用户地址
    //电话
    phone: {
        type: String, index: true, required: true
    },
    email: { type: String, default: "" },//邮箱
    img: { type: String, default: "https://cn.vuejs.org/images/logo.png" },//头像
    projects_id: { type: Array },//所拥有的项目的id列表
})

module.exports = mongoose.model('User', schema, 'users')
