var express = require('express');
const { ObjectId } = require('mongodb')
var router = express.Router();
const moment = require('moment')

module.exports = function (db) {

    const Todo = db.collection('todos')
    const User = db.collection('users')

    router.get('/', async (req, res, next) => {
        try {
            const { page = 1, limit = 10, title, startdateDeadline, enddateDeadline, complete, sortMode = 'desc', sortBy = '_id', executor } = req.query
            const params = {}
            const sort = {}
            sort[sortBy] = sortMode
            const offset = (page - 1) * limit

            if (title) params['title'] = new RegExp(title, 'i')

            if (startdateDeadline && enddateDeadline) {
                params['deadline'] = {
                    $gte: new Date(startdateDeadline),
                    $lte: new Date (enddateDeadline)
                }
            } else if (startdateDeadline) {
                params['deadline'] = { $gte: new Date(startdateDeadline) }
            } else if (enddateDeadline) {
                params['deadline'] = { $lte: new Date(enddateDeadline) }
            }

            if (complete) params['complete'] = JSON.parse(complete)

            if (executor) params['executor'] = new ObjectId(executor)

            const total = await Todo.count(params)
            const pages = Math.ceil(total / limit)

            const todos = await Todo.find(params).sort(sort).limit(Number(limit)).skip(Number(offset)).toArray();
            res.json({ data: todos, total, pages, page: Number(page), limit })

        } catch (error) {
            res.status(500).json({ error })
        }
    })

    router.post('/', async (req, res, next) => {
        try {
            const { title, executor } = req.body
            const a_day = 24 * 60 * 60 * 1000;
            const user = await User.findOne({_id: new ObjectId(executor)})
            const todos = await Todo.insertOne({ title: title, complete: false, deadline: new Date(Date.now() + a_day), executor: user._id })
            const data = await Todo.find({ _id: new ObjectId(todos.insertedId) }).toArray()
            res.status(201).json(data)
        } catch (err) {
            console.log(err)
            res.status(500).json({ err })
        }
    })

    router.get('/:id', async (req, res, next) => {
        try {
            const id = req.params.id
            const todo = await Todo.findOne({ _id: new ObjectId(id) })
            res.status(201).json(todo)
        } catch (error) {
            res.status(500).json({ error })
        }
    })

    router.put('/:id', async (req, res, next) => {
        try {
            const id = req.params.id
            const { title, deadline, complete } = req.body
            const todo = await Todo.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { title: title, complete: JSON.parse(complete), deadline: new Date(deadline) } }, { returnDocument: 'after' })
            res.status(201).json(todo)
        } catch (error) {
            res.status(500).json({ error })
        }
    })

    router.delete('/:id', async (req, res, next) => {
        try {
            const id = req.params.id
            const todo = await Todo.findOneAndDelete({ _id: new ObjectId(id) })
            res.status(201).json(todo)
        } catch (error) {
            res.status(500).json({ error })
        }
    })

    return router;

}