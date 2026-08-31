import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { MENU_ITEMS as STATIC_MENU_ITEMS, DEFAULT_COURSES } from '../lib/constants'

const MenuContext = createContext(null)
const MENU_STORAGE_KEY = 'benne-saaram.menu.v1'
const CATEGORIES_STORAGE_KEY = 'benne-saaram.categories.v1'

function checkIsAdminRoute() {
  if (typeof window === 'undefined') return false
  const path = window.location.pathname.replace(/\/$/, '')
  const hash = window.location.hash
  return path === '/admin-menu-editor' || hash === '#admin-menu-editor'
}

// Default fallback items with highlight flags
const INITIAL_FALLBACK_ITEMS = STATIC_MENU_ITEMS.map((item, idx) => {
  let isHighlight = false
  let highlightOrder = 0

  if (item.id === 20) {
    isHighlight = true
    highlightOrder = 1
  } else if (item.id === 1) {
    isHighlight = true
    highlightOrder = 2
  } else if (item.id === 6) {
    isHighlight = true
    highlightOrder = 3
  }

  return {
    ...item,
    isHighlight,
    highlightOrder,
    isAvailable: true,
    sortOrder: idx + 1,
  }
})

function getCachedMenu() {
  if (typeof window === 'undefined') return INITIAL_FALLBACK_ITEMS
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY)
    if (!raw) return INITIAL_FALLBACK_ITEMS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FALLBACK_ITEMS
  } catch {
    return INITIAL_FALLBACK_ITEMS
  }
}

function getCachedCategories() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function MenuProvider({ children }) {
  const [items, setItems] = useState(getCachedMenu)
  const [customCategories, setCustomCategories] = useState(getCachedCategories)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [dbConfigured, setDbConfigured] = useState(false)
  const [dbSource, setDbSource] = useState('local')
  const [error, setError] = useState(null)
  const [isEditorOpen, setIsEditorOpenState] = useState(checkIsAdminRoute)
  const [notification, setNotification] = useState(null)

  // Listen to browser URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const isAdmin = checkIsAdminRoute()
      setIsEditorOpenState(isAdmin)
    }

    window.addEventListener('popstate', handleUrlChange)
    window.addEventListener('hashchange', handleUrlChange)
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      window.removeEventListener('hashchange', handleUrlChange)
    }
  }, [])

  // Controlled setter that syncs URL history
  const setIsEditorOpen = useCallback((open) => {
    setIsEditorOpenState(open)
    if (typeof window !== 'undefined') {
      if (open) {
        if (window.location.pathname !== '/admin-menu-editor') {
          window.history.pushState(null, '', '/admin-menu-editor')
        }
      } else {
        if (window.location.pathname === '/admin-menu-editor') {
          window.history.pushState(null, '', '/')
        }
      }
    }
  }, [])

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev))
    }, 4000)
  }, [])

  // Fetch menu from API
  const fetchMenu = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/menu')
      if (!res.ok) {
        throw new Error(`Failed to load menu: ${res.statusText}`)
      }
      const data = await res.json()
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items)
        setDbConfigured(Boolean(data.configured))
        setDbSource(data.source || 'database')
        try {
          localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(data.items))
        } catch {}
      }
    } catch (err) {
      console.warn('Could not fetch menu from /api/menu, using cached/default data:', err)
      setError(err.message)
      setDbConfigured(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  // Save all items to API
  const saveMenu = useCallback(async (customItems = null) => {
    const itemsToSave = customItems || items
    setIsSaving(true)
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToSave }),
      })
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()
      setItems(itemsToSave)
      try {
        localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(itemsToSave))
      } catch {}
      showNotification('Menu changes saved successfully to database!')
      return { success: true, data }
    } catch (err) {
      console.error('Error saving menu:', err)
      try {
        localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(itemsToSave))
      } catch {}
      showNotification(`Saved locally (${err.message})`, 'info')
      return { success: false, error: err.message }
    } finally {
      setIsSaving(false)
    }
  }, [items, showNotification])

  // Add / Register a Category
  const addCategory = useCallback((categoryData) => {
    const name = categoryData.name?.trim()
    if (!name) return null

    const newCat = {
      key: name,
      title: name,
      note: categoryData.note?.trim() || 'Specialties freshly made to order',
    }

    setCustomCategories(prev => {
      if (prev.some(c => c.key.toLowerCase() === name.toLowerCase())) {
        return prev
      }
      const updated = [...prev, newCat]
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })

    showNotification(`Category "${name}" created!`)
    return newCat
  }, [showNotification])

  // Update a single item
  const updateItem = useCallback(async (updatedItem) => {
    const updatedItems = items.map(it => (it.id === updatedItem.id ? { ...it, ...updatedItem } : it))
    setItems(updatedItems)
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(updatedItems))
    } catch {}

    try {
      await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: updatedItem }),
      })
    } catch (err) {
      console.warn('Could not sync item update to database:', err)
    }
  }, [items])

  // Add a new item
  const addItem = useCallback(async (newItem) => {
    const nextId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1
    const completeItem = {
      id: nextId,
      name: newItem.name || 'New Dish',
      subtitle: newItem.subtitle || '',
      description: newItem.description || '',
      price: Number(newItem.price || 100),
      category: newItem.category || 'Dosa',
      spiceLevel: Number(newItem.spiceLevel || 0),
      tags: Array.isArray(newItem.tags) ? newItem.tags : [],
      zone: newItem.zone || 'cream',
      image: newItem.image || '',
      prep: newItem.prep || '',
      isHighlight: Boolean(newItem.isHighlight),
      highlightOrder: Number(newItem.highlightOrder || 0),
      isAvailable: newItem.isAvailable !== false,
      sortOrder: items.length + 1,
    }

    const updatedItems = [...items, completeItem]
    setItems(updatedItems)
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(updatedItems))
    } catch {}

    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: completeItem }),
      })
      showNotification(`Added "${completeItem.name}" to menu`)
    } catch (err) {
      console.warn('Could not sync new item to database:', err)
    }
    return completeItem
  }, [items, showNotification])

  // Delete an item
  const deleteItem = useCallback(async (id) => {
    const targetItem = items.find(i => i.id === id)
    const updatedItems = items.filter(i => i.id !== id)
    setItems(updatedItems)
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(updatedItems))
    } catch {}

    try {
      await fetch(`/api/menu?id=${id}`, { method: 'DELETE' })
      showNotification(`Removed "${targetItem?.name || 'dish'}" from menu`, 'info')
    } catch (err) {
      console.warn('Could not sync delete to database:', err)
    }
  }, [items, showNotification])

  // Update highlights (the 3 signature plates)
  const updateHighlights = useCallback(async (highlightIds) => {
    const updatedItems = items.map(item => {
      const idx = highlightIds.indexOf(item.id)
      if (idx !== -1) {
        return { ...item, isHighlight: true, highlightOrder: idx + 1 }
      }
      return { ...item, isHighlight: false, highlightOrder: 0 }
    })

    setItems(updatedItems)
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(updatedItems))
    } catch {}

    try {
      await fetch('/api/highlights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlightIds }),
      })
      showNotification('Signature 3 highlights updated!')
    } catch (err) {
      console.warn('Could not sync highlights to database:', err)
    }
  }, [items, showNotification])

  // Reset database & menu to authentic 31 default items
  const resetToDefaults = useCallback(async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/init-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchMenu()
        showNotification('Database seeded and reset to default menu items!')
      } else {
        setItems(INITIAL_FALLBACK_ITEMS)
        showNotification('Reset menu locally in memory.', 'info')
      }
    } catch (err) {
      setItems(INITIAL_FALLBACK_ITEMS)
      try {
        localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_ITEMS))
      } catch {}
      showNotification('Reset menu to default items locally.', 'info')
    } finally {
      setIsSaving(false)
    }
  }, [fetchMenu, showNotification])

  // Compute signature items (the 3 highlight dishes for S-Curve and Hero)
  const signatureItems = useMemo(() => {
    const highlights = items.filter(i => i.isHighlight && i.isAvailable !== false)
    if (highlights.length >= 3) {
      return [...highlights].sort((a, b) => (a.highlightOrder || 0) - (b.highlightOrder || 0)).slice(0, 3)
    }
    const withImages = items.filter(i => i.image && i.isAvailable !== false)
    if (withImages.length >= 3) {
      return withImages.slice(0, 3)
    }
    return items.slice(0, 3)
  }, [items])

  // Hero items: Ordered as [Highlight 1, Highlight 2 (Center), Highlight 3]
  const heroItems = useMemo(() => {
    if (signatureItems.length < 3) return signatureItems
    return signatureItems
  }, [signatureItems])

  // Available courses (default courses + user-created categories + item categories)
  const courses = useMemo(() => {
    const baseCourses = DEFAULT_COURSES || [
      { key: 'Dosa', title: 'Dosa', note: 'Cast iron, pure white butter, stone-ground batter' },
      { key: 'Uttappam', title: 'Uttappam', note: 'Thick, fluffy, cast-iron roasted' },
      { key: 'Idli & Vada', title: 'Idli & Vada', note: 'Thatte idli, button idli & crisp medu vada' },
      { key: 'Beverage', title: 'Beverages', note: 'Degree filter coffee, iced kaapi, chai & boost' },
      { key: 'Dessert', title: 'Desserts', note: 'Mysore pak, kesari bhat, softy & cheesecake' },
    ]

    const allDefinedCourses = [...baseCourses]

    // Add custom defined categories
    for (const cat of customCategories) {
      if (!allDefinedCourses.some(c => c.key.toLowerCase() === cat.key.toLowerCase())) {
        allDefinedCourses.push(cat)
      }
    }

    // Add any categories present in items not yet in allDefinedCourses
    const dishCategories = [...new Set(items.map(i => i.category))].filter(Boolean)
    for (const cat of dishCategories) {
      if (!allDefinedCourses.some(c => c.key.toLowerCase() === cat.toLowerCase())) {
        allDefinedCourses.push({
          key: cat,
          title: cat,
          note: 'Specialties freshly made to order',
        })
      }
    }

    return allDefinedCourses
  }, [items, customCategories])

  return (
    <MenuContext.Provider
      value={{
        items,
        signatureItems,
        heroItems,
        courses,
        isLoading,
        isSaving,
        dbConfigured,
        dbSource,
        error,
        isEditorOpen,
        setIsEditorOpen,
        notification,
        showNotification,
        fetchMenu,
        saveMenu,
        addCategory,
        updateItem,
        addItem,
        deleteItem,
        updateHighlights,
        resetToDefaults,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return ctx
}
