const fs = require('fs');

// 1. Add Route
let router = fs.readFileSync('src/router/index.js', 'utf8');
const oldRoutes = `{ path: '/profil', component: () => import('../views/pembeli/ProfilView.vue'), meta: { requiresAuth: true, role: 'pembeli' } },`;
const newRoutes = `{ path: '/profil', component: () => import('../views/pembeli/ProfilView.vue'), meta: { requiresAuth: true, role: 'pembeli' } },
  { path: '/pesanan', component: () => import('../views/pembeli/PesananView.vue'), meta: { requiresAuth: true, role: 'pembeli' } },`;
router = router.replace(oldRoutes, newRoutes);
fs.writeFileSync('src/router/index.js', router, 'utf8');


// 2. Redirect from Checkout
let checkout = fs.readFileSync('src/views/pembeli/CheckoutView.vue', 'utf8');
checkout = checkout.replace(
  "router.push('/') // Redirect ke home atau halaman tracking nantinya",
  "router.push('/pesanan')"
);
fs.writeFileSync('src/views/pembeli/CheckoutView.vue', checkout, 'utf8');


// 3. Add Icon to HomeView
let home = fs.readFileSync('src/views/pembeli/HomeView.vue', 'utf8');
home = home.replace(
  /import \{ ShoppingCartIcon, UserIcon, SearchIcon, XIcon \} from 'lucide-vue-next'/,
  "import { ShoppingCartIcon, UserIcon, SearchIcon, XIcon, ClipboardListIcon } from 'lucide-vue-next'"
);

const oldProfileIcon = `<router-link v-if='authStore.user' to='/profil' class='w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-900 transition-colors'>
          <UserIcon class='w-5 h-5 text-white' />
        </router-link>`;

const newIcons = `<div class='flex gap-2' v-if='authStore.user'>
          <router-link to='/pesanan' class='w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-900 transition-colors shadow-sm'>
            <ClipboardListIcon class='w-4 h-4 text-white' />
          </router-link>
          <router-link to='/profil' class='w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-900 transition-colors shadow-sm'>
            <UserIcon class='w-4 h-4 text-white' />
          </router-link>
        </div>`;

home = home.replace(oldProfileIcon, newIcons);
fs.writeFileSync('src/views/pembeli/HomeView.vue', home, 'utf8');
