module.exports = app => {
    const user = require('./user')
    const projects = require('./projects')
    const post = require('./post')
    const link = require('./link')
    const banner = require('./banner')
    const upload = require('./upload')
    const apply = require('./apply')

    app.use('/web/api/user', user)
    app.use('/web/api/project', projects)
    app.use('/web/api/post', post)
    app.use('/web/api/link', link)
    app.use('/web/api/banner', banner)
    app.use('/web/api/upload', upload)
    app.use('/web/api/apply', apply)
}