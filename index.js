// DEFAULT IMPORTS.
require('dotenv').config()
const cors = require('cors')
const express = require("express")
const { v4: uuidv4 } = require('uuid')

// STARTING APP.
const app = express()
app.use(cors())
app.use(express.json())

const users = []

// MIDDLEWARE. 
function checksExistsUserAccount(req, res, next) {
    const { username } = req.headers
    const userExist = users.some(user => user.username === username)
  
    if(!userExist) {
      return res.status(400).json({ error: 'User not exist!!' })
    }
  
    const userFound = users.find(user => user.username === username)
    req.userExist = userFound
    next()  
}

function checkTodoExists (req, res, next) {
    const {
      user,
      params: { id },
    } = req
  
    const todo = user.todos.find((todo) => todo.id === id)
  
    if (!todo) {
      return res.status(404).json({ error: "Todo doesn't exists" })
    }
  
    req.todo = todo
  
    return next()
}

app.get('/users_list', (req, res) => {
    res.status(200).json({users})
})

// USER ROUTES.
app.post('/users', (req, res) => {
    const { name, username } = req.body

    const userAlreadyExists = users.some((user) => user.username === username)

    if (userAlreadyExists) {
      return res.status(400).json({ error: "User already exists" })
    }

    users.push({
        id: uuidv4(),
        name,
        username,
        todos: []
    })

    res.status(201).json(users)
})

// TODO ROUTES.
app.get('/todos', checksExistsUserAccount, (req, res) => {
    const { todos } = req.userExist

    return res.status(200).json(todos)
})

app.post('/todos', checksExistsUserAccount, (req, res) => {
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

app.put('/todos/:id', checksExistsUserAccount, checkTodoExists, (req, res) => {
    const { todo, body: { title, deadline } } = req
  
    todo.title = title
    todo.deadline = deadline
  
    return res.status(201).json(todo)
})

app.patch('/todos/:id/done', checksExistsUserAccount, checkTodoExists, (req, res) => {
    const { todo } = req

    todo.done = true

    return res.status(201).json(todo)
})

app.delete('/todos/:id', checksExistsUserAccount, checkTodoExists, (req, res) => {
    const { user, todo } = req

    user.todos.splice(todo.id, 1)

    return res.status(204).json(user.todos)
})

module.exports = app