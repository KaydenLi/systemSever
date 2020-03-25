module.exports = app => {
    const express = require('express')
    const router = express.Router()

    const User = require('../../models/Users')

    router.get('/', async (req, res) => {
        res.send('here is a admin api.')
    })

    app.use('/admin/api', router)
}