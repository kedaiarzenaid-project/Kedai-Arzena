const fs = require('fs');
let c = fs.readFileSync('src/views/pembeli/CheckoutView.vue', 'utf8');

// 1. Add TrashIcon import
c = c.replace(/import \{ useRouter \} from 'vue-router'/, 
  "import { useRouter } from 'vue-router'\nimport { TrashIcon } from 'lucide-vue-next'"
);

// 2. Add TrashIcon button next to plus button
c = c.replace(
  /<button @click='cartStore\.updateQty\(item\.id, item\.qty \+ 1\)' class='w-7 h-7 bg-green-200 text-green-700 rounded-full font-bold'>\+<\/button>/,
  `<button @click='cartStore.updateQty(item.id, item.qty + 1)' class='w-7 h-7 bg-green-200 text-green-700 rounded-full font-bold'>+</button>
            <button @click='cartStore.removeFromCart(item.id)' class='ml-3 text-red-500 hover:text-red-700'><TrashIcon class='w-5 h-5'/></button>`
);

// 3. Fix bottom bar z-index and width
const oldBottomBar = `<div v-if='cartStore.items.length > 0' class='fixed bottom-0 left-0 right-0 p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[2000] flex gap-3'>
      <button @click='processCheckout' :disabled='isProcessing || (deliveryType === "antar" && ongkir === 0 && distance > 0)' class='flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:bg-gray-400'>
        {{ isProcessing ? 'Memproses...' : 'Buat Pesanan Sekarang' }}
      </button>
    </div>`;

const newBottomBar = `<div v-if='cartStore.items.length > 0' class='fixed bottom-0 left-0 right-0 p-4 flex justify-center pointer-events-none' style='z-index: 9999;'>
      <div class='w-full max-w-2xl bg-white p-3 shadow-[0_-4px_15px_rgba(0,0,0,0.15)] rounded-2xl pointer-events-auto border flex gap-3'>
        <button @click='processCheckout' :disabled='isProcessing || (deliveryType === "antar" && ongkir === 0 && distance > 0)' class='flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:bg-gray-400 shadow-md'>
          {{ isProcessing ? 'Memproses...' : 'Buat Pesanan Sekarang' }}
        </button>
      </div>
    </div>`;

c = c.replace(oldBottomBar, newBottomBar);

fs.writeFileSync('src/views/pembeli/CheckoutView.vue', c, 'utf8');
