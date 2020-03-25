// import mongoose from 'mongoose'
const mongoose = require('mongoose')

//定义开放授权项目schema，存储所有等待开放授权、已开放授权、未给予授权项目
const schema = new mongoose.Schema({
    user_id: { type: String},
    projects: [
        {
            applicant_id: { type: String},
            project_id: { type: String},
            createdTime: { type: String},
            description: { type: String},
            status: { type: String},
            authDate: { type: String}
        }
    ]

})

module.exports = mongoose.model('AuthProject', schema)