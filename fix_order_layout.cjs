const fs = require('fs');
let c = fs.readFileSync('src/views/pembeli/PesananView.vue', 'utf8');

const oldContent = `<div class='flex justify-between items-start mb-3'>
              <div>
                <p class='text-sm font-bold text-gray-800'>Metode: {{ order.delivery_type === "antar" ? "Diantar (Delivery)" : "Ambil Sendiri" }}</p>
                <p v-if='order.delivery_type === "antar"' class='text-xs text-gray-500 mt-1 line-clamp-2'>{{ order.delivery_address }}</p>
              </div>
              <div class='text-right'>
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

const newContent = `<!-- Daftar Item -->
            <div class='mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100'>
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
            </div>

            <!-- Metode & Total -->
            <div class='flex justify-between items-end mb-2'>
              <div class='flex-1 pr-4'>
                <p class='text-sm font-bold text-gray-800'>Metode: {{ order.delivery_type === "antar" ? "Diantar (Delivery)" : "Ambil Sendiri" }}</p>
                <p v-if='order.delivery_type === "antar"' class='text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed'>{{ order.delivery_address }}</p>
              </div>
              <div class='text-right'>
                <p class='text-xs text-gray-500'>Total Bayar</p>
                <p class='text-lg font-bold text-green-700 leading-tight'>Rp {{ order.total_price.toLocaleString('id-ID') }}</p>
              </div>
            </div>`;

c = c.replace(oldContent, newContent);

fs.writeFileSync('src/views/pembeli/PesananView.vue', c, 'utf8');
