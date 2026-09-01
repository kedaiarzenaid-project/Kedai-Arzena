import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // Load dari localStorage agar keranjang tidak hilang saat refresh
  const storedItems = localStorage.getItem('kedai_cart_items')
  const items = ref(storedItems ? JSON.parse(storedItems) : [])

  watch(items, (newItems) => {
    localStorage.setItem('kedai_cart_items', JSON.stringify(newItems))
  }, { deep: true })

  const totalItems = computed(() => items.value.reduce((total, item) => total + item.qty, 0))
  const totalPrice = computed(() => items.value.reduce((total, item) => total + (item.price * item.qty), 0))

  function addToCart(product, qty = 1, rasa = '', catatan = '') {
    // Cari apakah ada item dengan ID, rasa, dan catatan yang persis sama
    const existing = items.value.find(i => i.id === product.id && i.rasa === rasa && i.catatan === catatan)
    
    if (existing) {
      if (existing.qty + qty <= product.stock) {
        existing.qty += qty
      } else {
        alert('Stok tidak mencukupi!')
      }
    } else {
      if (qty <= product.stock && product.stock > 0) {
        items.value.push({ 
          ...product, 
          qty, 
          rasa, 
          catatan, 
          cart_id: Date.now() + Math.random().toString(36).substr(2, 5) 
        })
      } else {
        alert('Stok tidak mencukupi!')
      }
    }
  }

  function removeFromCart(cartId) {
    const index = items.value.findIndex(i => i.cart_id === cartId)
    if (index > -1) items.value.splice(index, 1)
  }

  function updateQty(cartId, qty) {
    const item = items.value.find(i => i.cart_id === cartId)
    if (item) {
      if (qty > 0 && qty <= item.stock) item.qty = qty
      else if (qty === 0) removeFromCart(cartId)
    }
  }

  function clearCart() {
    items.value = []
  }

  return { items, totalItems, totalPrice, addToCart, removeFromCart, updateQty, clearCart }
})

