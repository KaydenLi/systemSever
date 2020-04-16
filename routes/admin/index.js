module.exports = app => {
    const post = require('./post')
    const upload = require('./upload')
    const banner = require('./banner')
    const link = require('./link')
    const user = require('./user')
    const project = require('./project')
    const admin = require('./admin')

    app.use('/admin/api/post', post)
    app.use('/admin/api/upload', upload)
    app.use('/admin/api/banner', banner)
    app.use('/admin/api/link', link)
    app.use('/admin/api/user', user)
    app.use('/admin/api/project', project)
    app.use('/admin/api/admin', admin)
}