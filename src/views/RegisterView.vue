<template>
  <div class='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
    <div class='w-full max-w-md bg-white p-8 rounded-xl shadow-md'>
      <h2 class='text-2xl font-bold text-center mb-6 text-gray-800'>Daftar Kedai Arzena</h2>
      <form @submit.prevent='handleRegister'>
        <div class='mb-4'>
          <label class='block text-gray-700 text-sm font-bold mb-2'>Nama Lengkap</label>
          <input v-model='name' type='text' placeholder='Budi Santoso' class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500' required>
        </div>
        <div class='mb-4'>
          <label class='block text-gray-700 text-sm font-bold mb-2'>Nomor WhatsApp</label>
          <input v-model='phone' type='tel' placeholder='08123456789' class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500' required>
        </div>
        <button type='submit' class='w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition'>Daftar</button>
      </form>
      <p class='text-center mt-4 text-sm text-gray-600'>Sudah punya akun? <router-link to='/login' class='text-green-600 font-bold'>Login di sini</router-link></p>
      <p v-if='errorMsg' class='text-red-500 text-center mt-2 text-sm'>{{ errorMsg }}</p>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const name = ref('')
const phone = ref('')
const errorMsg = ref('')
const authStore = useAuthStore()

async function handleRegister() {
  try {
    errorMsg.value = ''
    await authStore.register(name.value, phone.value)
  } catch (e) {
    errorMsg.value = e.message || 'Terjadi kesalahan saat pendaftaran.'
  }
}
</script>

