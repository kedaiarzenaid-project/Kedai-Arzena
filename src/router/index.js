import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/register', component: () => import('../views/RegisterView.vue') },
  { path: '/', component: () => import('../views/pembeli/HomeView.vue'), meta: { requiresAuth: false } },
  { path: '/checkout', component: () => import('../views/pembeli/CheckoutView.vue'), meta: { requiresAuth: true, role: 'user' } },
  { path: '/profil', component: () => import('../views/pembeli/ProfilView.vue'), meta: { requiresAuth: true, role: 'user' } },
  { path: '/pesanan', component: () => import('../views/pembeli/PesananView.vue'), meta: { requiresAuth: true, role: 'user' } },
  { 
    path: '/admin', 
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', component: () => import('../views/admin/DashboardView.vue') },
      { path: 'kategori', component: () => import('../views/admin/KategoriView.vue') },
      { path: 'produk', component: () => import('../views/admin/ProdukView.vue') },
      { path: 'pengaturan', component: () => import('../views/admin/PengaturanView.vue') },
      { path: 'pengguna', component: () => import('../views/admin/UsersView.vue') },
      { path: 'transaksi', component: () => import('../views/admin/TransaksiView.vue') }
    ]
  },
  
  { 
    path: '/kasir', 
    component: () => import('../views/kasir/DashboardView.vue'),
    meta: { requiresAuth: true, role: 'kasir' }
  },
  { 
    path: '/kasir/pos', 
    component: () => import('../views/kasir/PosView.vue'),
    meta: { requiresAuth: true, role: 'kasir' }
  }

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  if (authStore.role === null) {
    await authStore.checkAuth()
  }
  
  if (to.meta.requiresAuth && !authStore.user) {
    return next('/login')
  }

  // Jika sudah login tapi mencoba ke halaman login/register
  if (authStore.user && (to.path === '/login' || to.path === '/register')) {
    if (authStore.role === 'admin') return next('/admin')
    if (authStore.role === 'kasir') return next('/kasir')
    return next('/')
  }

  // Kunci Admin & Kasir agar tidak bisa masuk ke halaman utama pengunjung (Home, Checkout, Pesanan)
  // Mereka tetap diizinkan ke /profil jika ingin ganti password/nama (kecuali admin yang punya panel sendiri)
  if (authStore.user && (authStore.role === 'admin' || authStore.role === 'kasir')) {
    const isVisitorPage = ['/', '/checkout', '/pesanan'].includes(to.path)
    if (isVisitorPage) {
      if (authStore.role === 'admin') return next('/admin')
      if (authStore.role === 'kasir') return next('/kasir')
    }
  }

  // Allow admin and kasir to also access pembeli pages if needed, but restrict strictly otherwise
  if (to.meta.role === 'admin' && authStore.role !== 'admin') return next('/')
  if (to.meta.role === 'kasir' && authStore.role !== 'kasir' && authStore.role !== 'admin') return next('/')
  
  next()
})

export default router

