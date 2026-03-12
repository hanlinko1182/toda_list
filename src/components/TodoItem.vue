<script setup>
import { ref } from 'vue'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle', 'delete', 'edit'])

const isEditing = ref(false)
const editText = ref('')

const startEdit = () => {
  isEditing.value = true
  editText.value = props.todo.text
}

const saveEdit = () => {
  if (editText.value.trim() === '') return
  emit('edit', props.todo.id, editText.value)
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
  editText.value = ''
}
</script>

<template>
  <li
    class="group flex items-center justify-between p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
    :class="todo.completed ? 'bg-indigo-50 border border-indigo-100' : 'bg-white border border-gray-200'"
  >
    <div class="flex items-center flex-1 min-w-0 mr-4">
      <!-- Checkbox -->
      <button
        @click="$emit('toggle', todo.id)"
        class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        :class="todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-indigo-400'"
      >
        <svg v-if="todo.completed" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </button>

      <!-- Text Content -->
      <div class="flex-1 truncate" v-if="!isEditing">
        <p
          class="text-lg transition-colors truncate pb-1"
          :class="todo.completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'"
        >
          {{ todo.text }}
        </p>
      </div>

      <!-- Edit Input -->
      <div v-else class="flex-1 flex gap-2 w-full pr-4">
        <input
          v-model="editText"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
          class="flex-1 px-4 py-2 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          type="text"
          autofocus
        />
        <button
          @click="saveEdit"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg font-medium transition-colors shadow-sm"
        >
          သိမ်းမည်
        </button>
        <button
          @click="cancelEdit"
          class="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm rounded-lg font-medium transition-colors shadow-sm"
        >
          ပယ်ဖျက်မည်
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" v-if="!isEditing">
      <button
        @click="startEdit"
        class="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title="ပြင်ဆင်မည်"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      </button>
      <button
        @click="$emit('delete', todo.id)"
        class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        title="ဖျက်မည်"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>
  </li>
</template>
