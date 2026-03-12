<script setup>
import { ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const emit = defineEmits(['login'])

const isLogin = ref(true)
const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (!username.value || !password.value) {
    error.value = 'နာမည်နှင့် စကားဝှက် ထည့်သွင်းပေးပါ'
    return
  }

  error.value = ''
  isLoading.value = true

  const endpoint = isLogin.value ? '/login' : '/register'
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'အမှားအယွင်းဖြစ်နေပါသည်')
    }

    if (isLogin.value) {
      // Success login
      emit('login', data)
    } else {
      // Success register, switch to login
      isLogin.value = true
      error.value = 'အကောင့်ဖန်တီးပြီးပါပြီ။ အကောင့်ဝင်ကြည့်ပါ'
      // green text temporary
      setTimeout(() => error.value = '', 3000)
    }
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-20 bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
    <div class="px-6 py-8 sm:p-10">
      <h2 class="text-3xl font-extrabold text-indigo-900 mb-6 text-center tracking-tight">
        {{ isLogin ? 'အကောင့်ဝင်ရန်' : 'အကောင့်အသစ်ပြုလုပ်ရန်' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">နာမည် (Username)</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
            placeholder="Username ထည့်ပါ"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">စကားဝှက် (Password)</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
            placeholder="စကားဝှက် ထည့်ပါ"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
        >
          {{ isLoading ? 'လုပ်ဆောင်နေသည်...' : (isLogin ? 'ဝင်မည်' : 'အကောင့်ဖန်တီးမည်') }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <button 
          @click="isLogin = !isLogin; error = ''" 
          class="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
        >
          {{ isLogin ? 'အကောင့်မရှိသေးဘူးလား? အသစ်ပြုလုပ်မည်' : 'အကောင့်ရှိပြီးသားလား? ဝင်ရောက်မည်' }}
        </button>
      </div>
    </div>
  </div>
</template>
