const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return res.status(400).json({ error: "User not found." })
  }

  req.user = user

  return next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  const checkIfExistUser = users.some(user => user.username === username)

  if (checkIfExistUser) {
    return res.status(400).json({ error: "User already exists." })
  }

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(newUser)


  return res.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req

  return res.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req

  const { title, deadline } = req.body

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return res.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params

  const { title, deadline } = req.body

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return res.status(404).json({ error: "Todo not found." })
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return res.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return res.status(404).json({ error: "Todo not found." })
  }

  todo.done = true

  return res.status(201).send(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return res.status(404).json({ error: "Todo not found." })
  }

  user.todos.splice(todo, 1)

  return res.status(204).send()
});

module.exports = app;