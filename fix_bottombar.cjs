const fs = require('fs');
let c = fs.readFileSync('src/views/pembeli/CheckoutView.vue', 'utf8');

// 1. Remove "Total Bayar" from the summary card
const oldSummary = `<div class='flex justify-between font-bold text-lg border-t pt-3'>
          <span>Total Bayar</span>
          <span class='text-green-700'>Rp {{ finalPrice.toLocaleString('id-ID') }}</span>
        </div>`;
c = c.replace(oldSummary, '');

// 2. Redesign the sticky bottom bar
// Need to find the exact bottom bar regex or string.
// Let's use regex to replace everything from "<!-- Bottom Bar Checkout -->" to the end of the template.
const oldBottomBarRegex = /<!-- Bottom Bar Checkout -->.*?<\/template>/s;
const newBottomBar = `<!-- Bottom Bar Checkout -->
    <div v-if='cartStore.items.length > 0' class='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pointer-events-auto' style='z-index: 9999; box-shadow: 0 -4px 12px rgba(0,0,0,0.05);'>
      <div class='w-full max-w-2xl mx-auto p-3 px-4 flex justify-between items-center'>
        <div class='flex flex-col'>
          <span class='text-xs text-gray-500 font-bold'>Total Bayar</span>
          <span class='text-lg font-bold text-green-700 leading-tight'>Rp {{ finalPrice.toLocaleString('id-ID') }}</span>
        </div>
        <button @click='processCheckout' :disabled='isProcessing || (deliveryType === "antar" && ongkir === 0 && distance > 0)' class='bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 shadow-sm'>
          {{ isProcessing ? 'Tunggu...' : 'Buat Pesanan' }}
        </button>
      </div>
    </div>
  </div>
</template>`;

c = c.replace(oldBottomBarRegex, newBottomBar);

fs.writeFileSync('src/views/pembeli/CheckoutView.vue', c, 'utf8');
