const express = require('express')
const router = require('./router')
const bodyParser = require('body-parser')

const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// 把路由应用到 app 中
app.use(router)

// 统一处理 500 错误
app.use((err, req, res, next) => {
    res.status(500).json({
        error: err.message
    })
})

app.listen(3000, () => {
    console.log('App is running at port 3000')
    console.log('Please visit http://127.0.0.1:3000')
})