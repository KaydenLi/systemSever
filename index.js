const express = require('express')
const app = express()
const errorHandler = require('./middlewares/error_middleware')

//让express识别客户端Jason
app.use(express.json())
//允许跨域
app.use(require('cors')())
// 静态文件托管
app.use('/uploads', express.static(__dirname + '/uploads'))
//前端请求路由
require('./plugins/db')(app)
require('./routes/web/index')(app)
require('./routes/admin/index')(app)

//错误处理函数
app.use(errorHandler)

app.listen(3000, console.log(`监听在：http://localhost:3000端口`))