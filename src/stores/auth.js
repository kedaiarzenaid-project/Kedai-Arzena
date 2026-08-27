import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../services/supabase'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const role = ref(null)
  const router = useRouter()

  async function fetchProfile(userId) {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()
    if (data) {
      role.value = data.role
      user.value = data
    }
  }

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await fetchProfile(session.user.id)
    }
  }

  async function login(phoneRaw) {
    const phone = phoneRaw.trim().replace(/\D/g, '')
    const email = phone + '@kedaiarzena.com'
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: phone
    })
    if (error) throw error
    await fetchProfile(data.user.id)
    redirectBasedOnRole()
  }

  async function register(name, phoneRaw) {
    const phone = phoneRaw.trim().replace(/\D/g, '')
    const email = phone + '@kedaiarzena.com'
    const { data, error } = await supabase.auth.signUp({
      email,
      password: phone,
    })
    if (error) throw error
    
    // Insert to public.users table
    if (data.user) {
      const { error: insertError } = await supabase.from('users').insert([{
        id: data.user.id,
        name,
        phone,
        role: 'pembeli'
      }])
      if (insertError) throw insertError
      await fetchProfile(data.user.id)
      redirectBasedOnRole()
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    role.value = null
    router.push('/login')
  }

  function redirectBasedOnRole() {
    if (role.value === 'admin') router.push('/admin')
    else if (role.value === 'kasir') router.push('/kasir')
    else router.push('/')
  }

  return { user, role, checkAuth, login, register, logout }
})

