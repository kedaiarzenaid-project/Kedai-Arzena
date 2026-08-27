const fs = require('fs');
let c = fs.readFileSync('src/views/pembeli/PesananView.vue', 'utf8');

// 1. Update fetch query
const oldQuery = `.select('*')`;
const newQuery = `.select('*, order_items(qty, subtotal, products(name))')`;
c = c.replace(oldQuery, newQuery);

// 2. Add details section in template
const oldTemplatePart = `<div class='text-right'>
                <p class='text-xs text-gray-500'>Total Bayar</p>
                <p class='text-lg font-bold text-gray-800'>Rp {{ order.total_price.toLocaleString('id-ID') }}</p>
              </div>
            </div>`;

const newTemplatePart = `<div class='text-right'>
                <p class='text-xs text-gray-500'>Total Bayar</p>
                <p class='text-lg font-bold text-gray-800'>Rp {{ order.total_price.toLocaleString('id-ID') }}</p>
              </div>
            </div>
            
            <!-- Daftar Item -->
            <div class='mt-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100'>
              <h4 class='text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider'>Ringkasan Pesanan</h4>
              <div v-for='(item, idx) in order.order_items' :key='idx' class='flex justify-between text-xs text-gray-700 mb-1.5'>
                <span><b class='text-green-700'>{{ item.qty }}x</b> {{ item.products?.name || 'Produk' }}</span>
                <span>Rp {{ item.subtotal.toLocaleString('id-ID') }}</span>
              </div>
              <div v-if='order.ongkir > 0' class='flex justify-between text-xs text-gray-700 border-t border-gray-200 pt-1.5 mt-1.5'>
                <span>Ongkos Kirim</span>
                <span>Rp {{ order.ongkir.toLocaleString('id-ID') }}</span>
              </div>
              <div v-if='order.notes' class='mt-2 text-[11px] text-gray-500 italic bg-yellow-50 p-1.5 rounded border border-yellow-100'>
                Catatan: {{ order.notes }}
              </div>
            </div>`;

c = c.replace(oldTemplatePart, newTemplatePart);

fs.writeFileSync('src/views/pembeli/PesananView.vue', c, 'utf8');
