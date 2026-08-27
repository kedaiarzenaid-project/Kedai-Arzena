const fs = require('fs');
let c = fs.readFileSync('src/views/pembeli/HomeView.vue', 'utf8');

c = c.replace(/import \{ ShoppingCartIcon \} from 'lucide-vue-next'/, "import { ShoppingCartIcon, UserIcon } from 'lucide-vue-next'");

const oldHeader = `<div v-if='authStore.user' class='flex items-center gap-3'>
          <span class='text-sm hidden md:inline'>Halo, {{ authStore.user.name }}</span>
          <button @click='authStore.logout()' class='text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700'>Logout</button>
        </div>
        <router-link v-else to='/login' class='text-sm font-bold bg-white text-green-700 px-3 py-1 rounded'>Login</router-link>`;

const newHeader = `<router-link v-if='authStore.user' to='/profil' class='w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-900 transition-colors'>
          <UserIcon class='w-5 h-5 text-white' />
        </router-link>
        <router-link v-else to='/login' class='text-sm font-bold bg-white text-green-700 px-3 py-1 rounded'>Login</router-link>`;

c = c.replace(oldHeader, newHeader);

fs.writeFileSync('src/views/pembeli/HomeView.vue', c, 'utf8');
