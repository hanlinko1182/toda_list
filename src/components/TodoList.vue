<script setup>
import TodoItem from './TodoItem.vue'

const props = defineProps({
  todos: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['toggle', 'delete', 'edit'])
</script>

<template>
  <ul class="space-y-4">
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @toggle="id => $emit('toggle', id)"
      @delete="id => $emit('delete', id)"
      @edit="(id, newText) => $emit('edit', id, newText)"
    />
    
    <li v-if="todos.length === 0" class="text-center py-10 text-gray-500 italic">
      မှတ်တမ်းမရှိသေးပါ။ အသစ်တစ်ခု ထည့်သွင်းပေးပါ!
    </li>
  </ul>
</template>
