module.exports = app => {
    const user = require('./user')
    const projects = require('./projects')
    const post = require('./post')
    const link = require('./link')
    const banner = require('./banner')
    const upload = require('./upload')
    const authProjects = require('./authProjects')
    const applyProjects = require('./applyProjects')

    app.use('/web/api/user', user)
    app.use('/web/api/project', projects)
    app.use('/web/api/post', post)
    app.use('/web/api/link', link)
    app.use('/web/api/banner', banner)
    app.use('/web/api/upload', upload)
    app.use('/web/api/authProject', authProjects)
    app.use('/web/api/applyProject', applyProjects)

}