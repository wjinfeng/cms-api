const moment = require('moment')
const db = require('../models/db')

/**
 * 分页话题列表
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.list = async (req, res, next) => {
    try {
        // 对象解构赋值起别名的写法
        // let {_page: pageNo, _limit: pageSize} = {
        //     _page: 1,
        //     _limit: 10
        // }

        // 对象解构赋值的默认值写法
        let {_page = 1, _limit = 20} = req.query

        if (_page < 1) {
            _page = 1
        }

        if (_limit < 1) {
            _limit = 1
        }

        if (_limit > 20) {
            _limit = 20
        }

        // 分页处理开始的索引
        const start = (parseInt(_page) - 1) * _limit

        const sqlStr = `
            select * from topics limit ${start}, ${_limit}
        `

        const topics = await db.query(sqlStr)

        // 查询总条数 先数组解构再对象解构
        const [{count}] = await db.query(`
            select count(*) as count from topics
        `)

        res.status(200).json({
            topics,
            count
        })
    } catch (err) {
        next(err)
    }
}

/**
 * 获取单个话题
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.one = async (req, res, next) => {
    try {
        const {id} = req.params
        const sqlStr = `
            select * from topics where id = '${id}'
        `
        const topics = await db.query(sqlStr)
        // TODO: 处理话题可能查不到的情况
        res.status(200).json(topics[0])    
    } catch (err) {
        next(err)
    }
}

/**
 * 创建话题
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.create = async (req, res, next) => {
    try {
        const body = req.body
        body.create_time = moment().format('YYYY-MM-DD hh:mm:ss')
        body.modify_time = moment().format('YYYY-MM-DD hh:mm:ss')
        body.user_id = req.session.user.id
    
        const sqlStr = `
            insert into topics (title, content, user_id, create_time, modify_time) 
            values(
                '${body.title}', 
                '${body.content}', 
                '${body.user_id}', 
                '${body.create_time}', 
                '${body.modify_time}')
        `
    
        const ret = await db.query(sqlStr)
        // 数组的解构赋值
        const [topic] = await db.query(`select * from topics where id = ${ret.insertId}`)
        // 201 状态码表示 成功请求并创建了新的资源
        res.status(201).json(topic)
    } catch (err) {
        next(err)
    }
}

/**
 * 更新话题
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.update = async (req, res, next) => {
    try {
        // 获取路径参数
        const {id} = req.params
        // 获取表单数据
        const body = req.body
        const sqlStr = `
            update topics 
            set title = '${body.title}',
            content = '${body.content}',
            modify_time = '${moment().format('YYYY-MM-DD hh:mm:ss')}' 
            where id = ${id}
        `

        // 执行更新操作
        await db.query(sqlStr)
        
        const [updatedTopic] = await db.query(`
            select * from topics where id = ${id}
        `)

        res.status(201).json(updatedTopic)
    } catch (err) {
        next(err)        
    }
    
}

/**
 * 删除话题
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.destroy = async (req, res, next) => {
    // 根据话题 id 查询得到该话题所属的作者 id
    // 如果话题中的 user_id === 当前登录用户的 id
    // 则可以进行删除，否则不允许
    // url 中的 :id 叫做动态路由参数
    // 可以通过 req.params 来获取动态路由参数
    // 查询字符串：req.query
    // POST 请求体：req.body
    // 动态路径参数：req.params

    try {
        // 执行删除操作
        await db.query(`
            delete from topics where id = ${req.params.id}
        `)

        // 响应成功
        res.status(201).json({})
    } catch (err) {
        next(err)   
    }
}
