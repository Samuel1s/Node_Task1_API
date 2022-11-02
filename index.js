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
    
    const userFound = users.find(user => user.username === username)
  
    if(!userFound) {
      return res.status(400).json({ error: 'User not found!!' })
    }

    req.user = userFound
    next()  
}

function checkIfUserAlreadyExist (req, res, next) {
    const { username } = req.body
    const userAlreadyExists = users.some((user) => user.username === username)
    
    if (userAlreadyExists) {
        return res.status(400).json({ error: "User already exists" })
    }

    req.newUser = req.body
    next()
}

function checkTodoExists (req, res, next) {
    const { user, params: { id } } = req
    const todo = user.todos.find((todo) => todo.id === id)
  
    if (!todo) {
      return res.status(404).json({ error: "Todo doesn't exists" })
    }
  
    req.todo = todo
    next()
}

// USER ROUTES.
app.post('/users', checkIfUserAlreadyExist, (req, res) => {
    const { name, username } = req.newUser

    users.push({
        id: uuidv4(),
        name,
        username,
        todos: []
    })

    res.status(201).json(...users )
})

// TODO ROUTES.
app.get('/todos', checksExistsUserAccount, (req, res) => {
    const { todos } = req.user

    return res.status(200).json([...todos])
})

app.post('/todos', checksExistsUserAccount, (req, res) => {
    const { user, body: { deadline, title } } = req

    const task = 
    { 
        id: uuidv4(), // precisa ser um uuid
        title: title,
        done: false, 
        deadline: new Date(deadline), 
        created_at: new Date()
    }

    user.todos.push(task)

    return res.status(201).json(task)
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