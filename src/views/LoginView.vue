<template>
  <div class='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
    <div class='w-full max-w-md bg-white p-8 rounded-xl shadow-md'>
      <h2 class='text-2xl font-bold text-center mb-6 text-gray-800'>Login Kedai Arzena</h2>
      <form @submit.prevent='handleLogin'>
        <div class='mb-4'>
          <label class='block text-gray-700 text-sm font-bold mb-2'>Nomor WhatsApp</label>
          <input v-model='phone' type='tel' placeholder='08123456789' class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500' required>
        </div>
        <div class='mb-6'>
          <label class='block text-gray-700 text-sm font-bold mb-2'>Password</label>
          <input v-model='password' type='password' placeholder='Masukkan password' class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500' required>
        </div>
        <button type='submit' class='w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition'>Login</button>
      </form>
      <p class='text-center mt-4 text-sm text-gray-600'>Belum punya akun? <router-link to='/register' class='text-green-600 font-bold'>Daftar di sini</router-link></p>
      <p v-if='errorMsg' class='text-red-500 text-center mt-2 text-sm'>{{ errorMsg }}</p>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const phone = ref('')
const password = ref('')
const errorMsg = ref('')
const authStore = useAuthStore()

async function handleLogin() {
  try {
    errorMsg.value = ''
    await authStore.login(phone.value, password.value)
  } catch (e) {
    errorMsg.value = 'Nomor atau password salah.'
  }
}
</script>
