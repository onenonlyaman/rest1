import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'benne-saaram.cart.v1'

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.item.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: 1 }],
      }
    }
    case 'REMOVE_ITEM': {
      const existing = state.items.find(i => i.id === action.id)
      if (existing && existing.quantity > 1) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.id ? { ...i, quantity: i.quantity - 1 } : i
          ),
        }
      }
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.id),
      }
    }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'SET_OPEN':
      return { ...state, isOpen: action.value }
    default:
      return state
  }
}

/**
 * Restore a half-built order. Someone checking the hours or the map loses
 * their cart on navigation otherwise. Storage can throw (private mode, blocked
 * site data), so every access is guarded and an empty cart is a valid result.
 */
function readStoredCart() {
  const empty = { items: [], isOpen: false }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return empty
    const items = parsed.filter(
      i => i && typeof i.id === 'number' && typeof i.price === 'number' && i.quantity > 0
    )
    return { items, isOpen: false }
  } catch {
    return empty
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, readStoredCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // Storage unavailable. The cart still works for this visit.
    }
  }, [state.items])

  const addItem = useCallback((item) => {
    dispatch({
      type: 'ADD_ITEM',
      item: { id: item.id, name: item.name, price: item.price },
    })
  }, [])

  const removeItem = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', id })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const setCartOpen = useCallback((value) => {
    dispatch({ type: 'SET_OPEN', value })
  }, [])

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        itemCount,
        total,
        addItem,
        removeItem,
        clearCart,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
