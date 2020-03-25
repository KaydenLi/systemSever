module.exports = app => {
    const user = require('./user')
    const projects = require('./projects')
    const authProjects = require('./authProjects')
    const applyProjects = require('./applyProjects')

    app.use('/web/api/user', user)
    app.use('/web/api/projects', projects)
    app.use('/web/api/authProjects', authProjects)
    app.use('/web/api/applyProjects', applyProjects)

}