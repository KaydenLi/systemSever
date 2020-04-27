//处理中断请求
const assert = require('http-assert')


//创建登录校验中间件
const auth = async (req, res, next) => {
    let ids = req.user.projects_id;
    let hasRight = ids.indexOf(req.params.id.toString()) >= 0;
    assert(hasRight, 422, '您对该项目没有操作权')
    await next()
}
module.exports = auth