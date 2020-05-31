// import mongoose from 'mongoose'
const mongoose = require('mongoose')

//定义项目schema，存储所有项目
const schema = new mongoose.Schema({
    projectId: { type: String },
    name: { type: String },
    img: { type: String },
    currenttime: { type: Date },
    timeStamp: { type: String },
    children: [{
        name: { type: String },
        machineinfo: { type: String },
        value: [
            {
                id: { type: String },
                notes: { type: String },
                ratio: { type: Number },
                limit: { type: Number },
                threshold: { type: Number },
                position: { type: String },
                initialError: { type: Number },
                name: { type: String },
                type: { type: String },
                group: { type: Array, default: [] },
                unit: { type: String },
                value: { type: Array, default: [60, 65, 70, 70, 70, 65, 65, 64, 64, 63, 65, 66, 68, 76, 60, 60, 65, 63, 65, 66, 68, 76, 60] }
            }
        ]
    }]
})

module.exports = mongoose.model('Sensor', schema, 'sensors')
