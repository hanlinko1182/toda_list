<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add'])
const newTodo = ref('')

const handleSubmit = () => {
  if (newTodo.value.trim() === '') return
  emit('add', newTodo.value)
  newTodo.value = ''
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="mb-8 relative">
    <input
      v-model="newTodo"
      type="text"
      placeholder="ဘာတွေလုပ်ဖို့ရှိလဲ?"
      class="w-full pl-6 pr-32 py-4 border-2 border-indigo-100 rounded-xl text-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
    />
    <button
      type="submit"
      class="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md flex items-center"
    >
      ထည့်မည်
    </button>
  </form>
</template>
