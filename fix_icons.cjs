const fs = require('fs');
let c = fs.readFileSync('src/views/pembeli/HomeView.vue', 'utf8');

const oldHeaderRight = `<div class='flex gap-2' v-if='authStore.user'>
          <router-link to='/pesanan' class='w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-900 transition-colors shadow-sm'>
            <ClipboardListIcon class='w-4 h-4 text-white' />
          </router-link>
          <router-link to='/profil' class='w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-900 transition-colors shadow-sm'>
            <UserIcon class='w-4 h-4 text-white' />
          </router-link>
        </div>
        <router-link v-else to='/login' class='text-sm font-bold bg-white text-green-700 px-3 py-1 rounded'>Login</router-link>
        
        <!-- Cart Icon -->
        <div class='relative cursor-pointer' id='cart-icon' @click='goToCheckout'>
          <ShoppingCartIcon class='w-7 h-7 text-white' />
          <span v-if='cartStore.totalItems > 0' class='absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white'>
            {{ cartStore.totalItems }}
          </span>
        </div>`;

const newHeaderRight = `<!-- Cart Icon -->
        <div class='relative cursor-pointer mr-2' id='cart-icon' @click='goToCheckout'>
          <ShoppingCartIcon class='w-7 h-7 text-white' />
          <span v-if='cartStore.totalItems > 0' class='absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white'>
            {{ cartStore.totalItems }}
          </span>
        </div>
        
        <div class='flex gap-2' v-if='authStore.user'>
          <router-link to='/pesanan' class='w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-900 transition-colors shadow-sm'>
            <ClipboardListIcon class='w-4 h-4 text-white' />
          </router-link>
          <router-link to='/profil' class='w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-900 transition-colors shadow-sm'>
            <UserIcon class='w-4 h-4 text-white' />
          </router-link>
        </div>
        <router-link v-else to='/login' class='text-sm font-bold bg-white text-green-700 px-3 py-1 rounded'>Login</router-link>`;

c = c.replace(oldHeaderRight, newHeaderRight);

fs.writeFileSync('src/views/pembeli/HomeView.vue', c, 'utf8');
