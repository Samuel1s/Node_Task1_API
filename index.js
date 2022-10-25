// DEFAULT IMPORTS.
require('dotenv').config()
const cors = require('cors')
const express = require("express")
const { v4: uuidv4 } = require('uuid')

// INTERNAL APP IMPORTS.
const { user_default } = require('./users')

// STARTING APP.
const app = express()
app.use(cors())
app.use(express.json())

// MIDDLEWARE. 
function ifUserExists(req, res, next) {
    const { username } = req.headers

    const userExist = user_default.find(user => user.username === username)

    if(!userExist) {
        return res.status(400).send('User not exist!!')
    }

    req.userExist = userExist
    next()  
}

// Verify If Task exist
function ifTaskExist(todos, id) {
    const taskExist = todos.some(todo => todo.id === id)

    return taskExist
}   

app.get('/users_list', (req, res) => {
    res.status(200).json({user_default})
})

// USER ROUTES.
app.post('/users', (req, res) => {
    const { name, username } = req.body

    user_default.push({
        name,
        username,
        id: uuidv4(),
        todos: []
    })

    res.status(201).json(user_default)
})

// TODO ROUTES.
app.get('/todos', ifUserExists, (req, res) => {
    const { todos } = req.userExist

    return res.status(200).json({todos})
})

app.post('/todos', ifUserExists, (req, res) => {
    const { todos } = req.userExist
    const { deadline } = req.body

    const newTask = 
    { 
        id: uuidv4(), // precisa ser um uuid
        title: req.body.title,
        done: false, 
        deadline: new Date(deadline), 
        created_at: new Date()
    }

    const newTodo = todos.push(newTask)

    return res.status(201).json({newTodo, newTask})
})

app.put('/todos/:id', ifUserExists, (req, res) => {
    const { id } = req.params
    const { todos } = req.userExist
    const { title, deadline } = req.body

    if(!ifTaskExist(todos, id)) {
        return res.status(400).send('Invalid ID, task doesnt exist!')
    }

    const updateTask = todos.find(todo => todo.id === id)
    updateTask.title = title,
    updateTask.deadline = new Date(deadline)

    return res.status(200).json(updateTask)
})

app.patch('/todos/:id/done', ifUserExists, (req, res) => {
    const { id } = req.params
    const { todos } = req.userExist

    if(!ifTaskExist(todos, id)) {
        return res.status(400).send('Invalid ID, task doesnt exist!')
    }

    const doneTask = todos.find(todo => todo.id === id)
    doneTask.done = true

    return res.status(200).json(doneTask)
})

app.delete('/todos/:id', ifUserExists, (req, res) => {
    const { id } = req.params
    const { todos } = req.userExist

    if(!ifTaskExist(todos, id)) {
        return res.status(400).send('Invalid ID, task doesnt exist!')
    }

    const removeTodo = todos.find(todo => todo.id === id)
    todos.splice(removeTodo, 1)

    return res.status(200).send('The task has been deleted.')
})

module.exports = app