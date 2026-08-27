import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const totalItems = computed(() => items.value.reduce((total, item) => total + item.qty, 0))
  const totalPrice = computed(() => items.value.reduce((total, item) => total + (item.price * item.qty), 0))

  function addToCart(product) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      if (existing.qty < product.stock) {
        existing.qty++
      } else {
        alert('Stok tidak mencukupi!')
      }
    } else {
      if (product.stock > 0) {
        items.value.push({ ...product, qty: 1 })
      } else {
        alert('Stok habis!')
      }
    }
  }

  function removeFromCart(productId) {
    const index = items.value.findIndex(i => i.id === productId)
    if (index > -1) items.value.splice(index, 1)
  }

  function updateQty(productId, qty) {
    const item = items.value.find(i => i.id === productId)
    if (item) {
      if (qty > 0 && qty <= item.stock) item.qty = qty
      else if (qty === 0) removeFromCart(productId)
    }
  }

  function clearCart() {
    items.value = []
  }

  return { items, totalItems, totalPrice, addToCart, removeFromCart, updateQty, clearCart }
})

