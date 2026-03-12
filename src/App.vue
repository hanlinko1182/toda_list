<script setup>
import { ref, onMounted } from 'vue'
import TodoForm from './components/TodoForm.vue'
import TodoList from './components/TodoList.vue'
import Login from './components/Login.vue'

const todos = ref([])
const user = ref(null)
const token = ref(null)

const API_URL = 'https://api.render.com/deploy/srv-d6pfij5actks73eoq04g?key=6tACTPwAxS4'

// Fetch todos from backend
const fetchTodos = async () => {
  if (!token.value) return
  
  try {
    const response = await fetch(`${API_URL}/todos`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) logout()
      throw new Error('Failed to fetch todos')
    }
    todos.value = await response.json()
  } catch (err) {
    console.error(err)
  }
}

// Add todo via API
const addTodo = async (text) => {
  try {
    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ text })
    })
    if (!response.ok) throw new Error('Failed to add todo')
    const newTodo = await response.json()
    todos.value.push(newTodo)
  } catch (err) {
    console.error(err)
  }
}

// Delete todo via API
const deleteTodo = async (id) => {
  try {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    if (!response.ok) throw new Error('Failed to delete todo')
    todos.value = todos.value.filter(todo => todo.id !== id)
  } catch (err) {
    console.error(err)
  }
}

// Edit todo via API
const editTodo = async (id, newText) => {
  const todo = todos.value.find(t => t.id === id)
  if (!todo) return

  try {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ text: newText, completed: todo.completed })
    })
    if (!response.ok) throw new Error('Failed to edit todo')
    
    // Update local state smoothly
    todo.text = newText
  } catch (err) {
    console.error(err)
  }
}

// Toggle complete via API
const toggleComplete = async (id) => {
  const todo = todos.value.find(t => t.id === id)
  if (!todo) return

  const newCompletedState = !todo.completed

  try {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ text: todo.text, completed: newCompletedState })
    })
    if (!response.ok) throw new Error('Failed to toggle')
    
    todo.completed = newCompletedState
  } catch (err) {
    console.error(err)
  }
}

const handleLogin = (data) => {
  token.value = data.token
  user.value = data.username
  localStorage.setItem('todo_token', data.token)
  localStorage.setItem('todo_user', data.username)
  fetchTodos()
}

const logout = () => {
  token.value = null
  user.value = null
  todos.value = []
  localStorage.removeItem('todo_token')
  localStorage.removeItem('todo_user')
}

// On mount
onMounted(() => {
  const savedToken = localStorage.getItem('todo_token')
  const savedUser = localStorage.getItem('todo_user')
  
  if (savedToken && savedUser) {
    token.value = savedToken
    user.value = savedUser
    fetchTodos()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
    
    <div v-if="!user">
      <Login @login="handleLogin" />
    </div>

    <div v-else class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100 relative">
      <div class="px-6 py-8 sm:p-10">
        
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center space-x-3">
            <h1 class="text-3xl font-extrabold text-indigo-900 tracking-tight">
              ✨ မှတ်တမ်း (ToDo List)
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-indigo-600 font-medium">👋 ကြိုဆိုပါတယ်, {{ user }}</span>
            <button 
              @click="logout"
              class="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors shadow-sm"
            >
              ထွက်မည်
            </button>
          </div>
        </div>

        <TodoForm @add="addTodo" />

        <TodoList 
          :todos="todos" 
          @toggle="toggleComplete"
          @delete="deleteTodo"
          @edit="editTodo"
        />
        
        <div class="mt-8 pt-4 border-t border-gray-100 text-sm font-medium text-gray-500 flex justify-between px-2" v-if="todos.length > 0">
          <span>{{ todos.filter(t => !t.completed).length }} ခု ကျန်ရှိသေးသည်</span>
          <span class="text-indigo-600">{{ todos.filter(t => t.completed).length }} ခု ပြီးစီးသည်</span>
        </div>
      </div>
    </div>

  </div>
</template>
