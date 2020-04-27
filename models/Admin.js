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
    address: { type: String },//用户地址
    //电话
    phone: {
        type: String, index: true, required: true
    },
    email: { type: String },//邮箱
    avatar: { type: String },//头像
})

module.exports = mongoose.model('Admin', schema, 'admins')
