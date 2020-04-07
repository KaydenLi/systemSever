//错误处理中间件
const errorHandler = async (err, req, res, next) => {
    res.status(err.statusCode || 500).send(
        {
            message: err.message
        })
}

module.exports = errorHandler