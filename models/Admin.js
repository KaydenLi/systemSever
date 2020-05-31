const mongoose = require('mongoose')

//定义管理员schema，存储所有管理员
const schema = new mongoose.Schema({
    userName: { type: String },    //用户名称
    password: {
        type: String,
        select: false,
        set(val) {
            return require('bcryptjs').hashSync(val, 10)
        }
    },//用户密码
    createdTime: { type: Date },//注册时间
    address: { type: String },//用户地址
    phone: {
        type: String, index: true, required: true
    },//电话
    email: { type: String },//邮箱
    avatar: { type: String },//头像
})

module.exports = mongoose.model('Admin', schema, 'admins')
