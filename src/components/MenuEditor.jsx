import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sparkles,
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit3,
  Check,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Search,
  Eye,
  Save,
  CheckCircle2,
  Layers,
  FolderPlus,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  ArrowRightCircle
} from 'lucide-react'
import { useMenu } from './MenuContext'
import { formatPrice } from '../lib/utils'
import DishPhoto, { PlateMark } from './DishPhoto'
import { SpiceMeter } from './DishMeta'
import KolamSVG from './KolamSVG'

const STANDARD_IMAGES = [
  { label: 'Benne Dosa', value: '/images/benne-dosa.jpg' },
  { label: 'Garlic Roast Dosa', value: '/images/garlic-dosa.jpg' },
  { label: 'Thatte Idli', value: '/images/thatte-idli.jpg' },
  { label: 'No Photo (Plate Mark)', value: '' },
]

const AUTH_STORAGE_KEY = 'benne-saaram.admin.auth'
const DEFAULT_PIN = '1234'

export default function MenuEditor() {
  const {
    items,
    signatureItems,
    courses,
    isEditorOpen,
    setIsEditorOpen,
    updateItem,
    addItem,
    deleteItem,
    updateHighlights,
    saveMenu,
    addCategory,
    resetToDefaults,
    dbConfigured,
    isSaving,
    notification,
  } = useMenu()

  // PIN Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [pinShake, setPinShake] = useState(false)

  const [activeTab, setActiveTab] = useState('highlights') // 'highlights' | 'board'
  const [selectedCourse, setSelectedCourse] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  // Category creation state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryNote, setNewCategoryNote] = useState('')

  // Inline custom category inside dish modal
  const [isCustomCategoryInModal, setIsCustomCategoryInModal] = useState(false)
  const [inlineCategoryName, setInlineCategoryName] = useState('')

  const modalRef = useRef(null)
  const pinInputRef = useRef(null)

  // Focus PIN input when opened and unauthenticated
  useEffect(() => {
    if (isEditorOpen && !isAuthenticated) {
      setTimeout(() => {
        pinInputRef.current?.focus()
      }, 100)
    }
  }, [isEditorOpen, isAuthenticated])

  // Handle PIN verification
  const handlePinSubmit = (e) => {
    e?.preventDefault?.()
    const configuredPin = (import.meta.env?.VITE_ADMIN_PIN || DEFAULT_PIN).toString().trim()
    const entered = pinInput.trim()

    if (entered === configuredPin) {
      setIsAuthenticated(true)
      setPinError(false)
      setPinInput('')
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true')
      } catch {}
    } else {
      setPinError(true)
      setPinShake(true)
      setPinInput('')
      setTimeout(() => setPinShake(false), 600)
    }
  }

  // Handle manual lock / logout
  const handleLock = () => {
    setIsAuthenticated(false)
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {}
  }

  // Close on Escape
  useEffect(() => {
    if (!isEditorOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isCreatingCategory) {
          setIsCreatingCategory(false)
        } else if (editingItem || isCreatingNew) {
          setEditingItem(null)
          setIsCreatingNew(false)
        } else if (itemToDelete) {
          setItemToDelete(null)
        } else if (resetConfirmOpen) {
          setResetConfirmOpen(false)
        } else {
          setIsEditorOpen(false)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isEditorOpen, editingItem, isCreatingNew, isCreatingCategory, itemToDelete, resetConfirmOpen, setIsEditorOpen])

  // Filter items for the board tab
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCourse = selectedCourse === 'All' || item.category === selectedCourse
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
      return matchesCourse && matchesQuery
    })
  }, [items, selectedCourse, searchQuery])

  // Open creation modal
  const handleOpenCreate = () => {
    setIsCreatingNew(true)
    setIsCustomCategoryInModal(false)
    setInlineCategoryName('')
    setEditingItem({
      name: '',
      subtitle: '',
      description: '',
      price: 120,
      category: selectedCourse !== 'All' ? selectedCourse : (courses[0]?.key || 'Dosa'),
      spiceLevel: 0,
      tags: ['popular'],
      zone: 'cream',
      image: '',
      prep: '',
      isHighlight: false,
      highlightOrder: 0,
      isAvailable: true,
    })
  }

  // Handle category creation from dedicated modal
  const handleCreateCategorySubmit = (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    const cat = addCategory({
      name: newCategoryName.trim(),
      note: newCategoryNote.trim(),
    })

    if (cat) {
      setSelectedCourse(cat.key)
    }

    setNewCategoryName('')
    setNewCategoryNote('')
    setIsCreatingCategory(false)
  }

  // Handle highlight swap
  const handleHighlightSwap = (slotIndex, newItemId) => {
    const currentHighlightIds = signatureItems.map((i) => i.id)
    const newHighlights = [...currentHighlightIds]

    while (newHighlights.length < 3) {
      const fallback = items.find((i) => !newHighlights.includes(i.id))
      if (fallback) newHighlights.push(fallback.id)
      else break
    }

    newHighlights[slotIndex] = Number(newItemId)
    updateHighlights(newHighlights)
  }

  // Handle highlight shift left/right
  const handleHighlightShift = (slotIndex, direction) => {
    const currentHighlightIds = signatureItems.map((i) => i.id)
    const targetIndex = slotIndex + direction
    if (targetIndex < 0 || targetIndex >= currentHighlightIds.length) return

    const temp = currentHighlightIds[slotIndex]
    currentHighlightIds[slotIndex] = currentHighlightIds[targetIndex]
    currentHighlightIds[targetIndex] = temp

    updateHighlights(currentHighlightIds)
  }

  if (!isEditorOpen) return null

  // ── PIN AUTHENTICATION GATE SCREEN ──
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-kaapi/70 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: pinShake ? [-12, 12, -8, 8, -4, 4, 0] : 0,
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
            x: { duration: 0.5 },
          }}
          className="relative w-full max-w-sm rounded-3xl border border-ink/15 bg-coconut p-7 shadow-2xl text-center"
        >
          {/* Logo / Lock Header */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-kara/10 text-kara shadow-inner">
            <Lock size={26} />
          </div>

          <div className="mt-4">
            <h2 className="font-display text-2xl text-ink">Admin Access</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Enter the security PIN to access the Menu Editor.
            </p>
          </div>

          {/* PIN Form */}
          <form onSubmit={handlePinSubmit} className="mt-6 space-y-4">
            <div>
              <div className="relative mx-auto max-w-[200px]">
                <input
                  ref={pinInputRef}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  required
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value)
                    setPinError(false)
                    if (e.target.value.length === 4) {
                      // Check immediate 4 digit match
                      const configured = (import.meta.env?.VITE_ADMIN_PIN || DEFAULT_PIN).toString().trim()
                      if (e.target.value === configured) {
                        setIsAuthenticated(true)
                        try { sessionStorage.setItem(AUTH_STORAGE_KEY, 'true') } catch {}
                      }
                    }
                  }}
                  placeholder="••••"
                  className="w-full tracking-[0.6em] text-center font-mono text-2xl font-bold rounded-2xl border border-ink/20 bg-sand/60 py-3 text-ink placeholder:tracking-normal placeholder:text-ink-muted/40 focus:border-kara focus:bg-coconut focus:outline-none focus:ring-2 focus:ring-kara/20"
                />
              </div>

              {pinError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs font-semibold text-kara flex items-center justify-center gap-1"
                >
                  <ShieldAlert size={13} />
                  <span>Incorrect PIN. Please try again.</span>
                </motion.p>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-kara px-5 text-sm font-semibold text-cream shadow-md shadow-kara/20 transition-all hover:bg-kara-dark active:scale-95"
              >
                <KeyRound size={16} />
                <span>Unlock Menu Editor</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="w-full py-2 text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
              >
                Back to Website
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  // ── AUTHENTICATED MENU EDITOR ──
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-coconut/98 backdrop-blur-md">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-xl ${
              notification.type === 'error'
                ? 'bg-kara text-cream'
                : notification.type === 'info'
                ? 'bg-kaapi text-ghee-light'
                : 'bg-open text-white'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-ink/10 bg-coconut px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-kara text-cream">
            <UtensilsCrossed size={18} />
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl text-ink leading-tight">
              Menu & Highlights Editor
            </h1>
            <p className="text-[11px] text-ink-muted hidden sm:block">
              Manage live dishes, custom categories, prices, and 3 signature highlights
            </p>
          </div>
        </div>

        {/* Top Bar Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Database Status Indicator */}
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              dbConfigured
                ? 'bg-open/10 text-open border border-open/20'
                : 'bg-break/10 text-break border border-break/20'
            }`}
            title={dbConfigured ? 'Connected to database' : 'Running in local cache mode'}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                dbConfigured ? 'bg-open animate-pulse' : 'bg-break'
              }`}
            />
            <span className="hidden md:inline">
              {dbConfigured ? 'Database Connected' : 'Local Mode'}
            </span>
          </span>

          {/* Reset / Seed Database Button */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-ink/20 bg-coconut px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-sand hover:border-kara/40 hover:text-kara"
            title="Reset menu items to default list"
          >
            <RefreshCw size={13} />
            <span>Reset to Defaults</span>
          </button>

          {/* Save Changes Button */}
          <button
            onClick={() => saveMenu()}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-full bg-kara px-4 py-2 text-xs sm:text-sm font-semibold text-cream shadow-md transition-all hover:bg-kara-dark active:scale-95 disabled:opacity-50"
          >
            <Save size={15} className={isSaving ? 'animate-spin' : ''} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          {/* Lock Session Button */}
          <button
            onClick={handleLock}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink-muted hover:bg-sand hover:text-ink transition-colors"
            title="Lock Admin Session"
          >
            <Lock size={15} />
          </button>

          {/* Exit / View Site Button */}
          <button
            onClick={() => setIsEditorOpen(false)}
            className="flex items-center gap-1.5 rounded-full border border-ink/15 bg-sand/80 px-3 py-2 text-xs font-semibold text-ink hover:bg-sand transition-colors"
            title="Close editor and view website"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">View Site</span>
            <X size={16} className="sm:hidden" />
          </button>
        </div>
      </header>

      {/* Tabs Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-ink/10 bg-sand/60 px-4 sm:px-6">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('highlights')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'highlights'
                ? 'border-kara text-kara'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Sparkles size={16} />
            <span>Three Highlights</span>
          </button>

          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'board'
                ? 'border-kara text-kara'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Layers size={16} />
            <span>Menu Board ({items.length})</span>
          </button>
        </div>

        {/* Mobile Reset Action */}
        <button
          onClick={() => setResetConfirmOpen(true)}
          className="sm:hidden flex items-center gap-1 text-[11px] font-semibold text-ink-muted hover:text-kara"
        >
          <RefreshCw size={11} />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* TAB 1: THREE HIGHLIGHTS */}
        {activeTab === 'highlights' && (
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="rounded-2xl border border-ink/10 bg-sand/70 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    The 3 Signature Highlights
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-ink-muted">
                    These 3 showcase dishes are featured prominently in the Hero Section
                    and the signature S-Curve wave. Slot 2 is the primary center plate.
                  </p>
                </div>
              </div>

              {/* 3 Highlights Cards */}
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {[0, 1, 2].map((slotIdx) => {
                  const item = signatureItems[slotIdx]
                  const isCenterHero = slotIdx === 1
                  const orderNum = slotIdx + 1

                  return (
                    <div
                      key={slotIdx}
                      className={`relative flex flex-col justify-between rounded-2xl border bg-coconut p-5 shadow-sm transition-all ${
                        isCenterHero
                          ? 'border-ghee ring-2 ring-ghee/30 shadow-md'
                          : 'border-ink/10'
                      }`}
                    >
                      {/* Badge */}
                      <div className="mb-4 flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isCenterHero
                              ? 'bg-ghee text-kaapi'
                              : 'bg-sand text-ink-muted'
                          }`}
                        >
                          {isCenterHero
                            ? '⭐ Highlight #2 (Center Hero)'
                            : `Highlight #${orderNum}`}
                        </span>

                        {/* Reorder Arrows */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleHighlightShift(slotIdx, -1)}
                            disabled={slotIdx === 0}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 text-ink hover:bg-sand disabled:opacity-30"
                            title="Shift left"
                          >
                            <ArrowLeft size={13} />
                          </button>
                          <button
                            onClick={() => handleHighlightShift(slotIdx, 1)}
                            disabled={slotIdx === 2}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 text-ink hover:bg-sand disabled:opacity-30"
                            title="Shift right"
                          >
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>

                      {item ? (
                        <div className="space-y-4">
                          {/* Dish Image */}
                          <div className="flex justify-center">
                            <div className="h-28 w-28 overflow-hidden rounded-full border border-ink/10 shadow-inner bg-sand">
                              {item.image ? (
                                <DishPhoto
                                  item={item}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <PlateMark item={item} />
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="text-center">
                            <h3 className="font-display text-lg text-ink">
                              {item.name}
                            </h3>
                            <p className="text-xs italic text-ink-soft" lang="kn">
                              {item.subtitle || '—'}
                            </p>
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                              {item.description}
                            </p>
                            <div className="mt-3 flex items-center justify-center gap-2">
                              <span className="rounded-full bg-ghee px-2.5 py-0.5 text-xs font-bold text-kaapi">
                                {formatPrice(item.price)}
                              </span>
                              <SpiceMeter level={item.spiceLevel} />
                            </div>
                          </div>

                          {/* Quick Swap Dropdown */}
                          <div className="space-y-1.5 border-t border-ink/10 pt-3">
                            <label className="text-[11px] font-semibold text-ink-muted">
                              Swap with dish:
                            </label>
                            <select
                              value={item.id}
                              onChange={(e) =>
                                handleHighlightSwap(slotIdx, e.target.value)
                              }
                              className="w-full rounded-xl border border-ink/15 bg-sand/60 px-3 py-2 text-xs font-medium text-ink focus:border-kara focus:outline-none"
                            >
                              {items.map((it) => (
                                <option key={it.id} value={it.id}>
                                  {it.name} ({it.category}) - ₹{it.price}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Edit Item Details Button */}
                          <button
                            onClick={() => {
                              setIsCustomCategoryInModal(false)
                              setEditingItem({ ...item })
                            }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-ink/15 bg-sand/50 py-2 text-xs font-semibold text-ink transition-colors hover:bg-sand"
                          >
                            <Edit3 size={13} />
                            <span>Edit Dish Copy & Photo</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <p className="text-sm font-semibold text-ink-muted">
                            No dish selected
                          </p>
                          <select
                            onChange={(e) =>
                              handleHighlightSwap(slotIdx, e.target.value)
                            }
                            className="mt-3 rounded-xl border border-ink/20 bg-coconut px-3 py-1.5 text-xs text-ink"
                          >
                            <option value="">Select a dish...</option>
                            {items.map((it) => (
                              <option key={it.id} value={it.id}>
                                {it.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MENU BOARD */}
        {activeTab === 'board' && (
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Filter & Action Bar */}
            <div className="flex flex-col gap-4">
              {/* Category Pills with + New Category Button */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedCourse('All')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    selectedCourse === 'All'
                      ? 'bg-kara text-cream shadow-xs'
                      : 'bg-sand text-ink-muted hover:bg-sand/80'
                  }`}
                >
                  All ({items.length})
                </button>
                {courses.map((c) => {
                  const count = items.filter((i) => i.category === c.key).length
                  return (
                    <button
                      key={c.key}
                      onClick={() => setSelectedCourse(c.key)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        selectedCourse === c.key
                          ? 'bg-kara text-cream shadow-xs'
                          : 'bg-sand text-ink-muted hover:bg-sand/80'
                      }`}
                    >
                      {c.title} ({count})
                    </button>
                  )
                })}

                {/* + Add Category Button */}
                <button
                  onClick={() => setIsCreatingCategory(true)}
                  className="flex items-center gap-1 rounded-full border border-dashed border-ink/30 bg-coconut px-3 py-1.5 text-xs font-semibold text-ink-muted hover:border-kara hover:text-kara transition-colors"
                  title="Create new category section"
                >
                  <FolderPlus size={13} />
                  <span>+ New Category</span>
                </button>
              </div>

              {/* Search & Add Dish */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search menu items..."
                    className="w-full rounded-full border border-ink/15 bg-sand/60 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink-muted focus:border-kara focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1.5 rounded-full bg-kaapi px-4 py-2 text-xs font-semibold text-cream shadow-xs transition-all hover:bg-kaapi/85 active:scale-95"
                  >
                    <Plus size={15} />
                    <span>Add New Dish</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Items Grid / List */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border bg-coconut p-4 shadow-xs transition-all hover:shadow-md ${
                    item.isHighlight
                      ? 'border-ghee/60 ring-1 ring-ghee/20'
                      : 'border-ink/10 hover:border-ink/20'
                  }`}
                >
                  <div>
                    {/* Top Row: Category & Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.isHighlight && (
                          <span className="rounded-full bg-ghee/20 px-2 py-0.5 text-[10px] font-bold text-kaapi">
                            ⭐ Highlight #{item.highlightOrder}
                          </span>
                        )}
                        {!item.isAvailable && (
                          <span className="rounded-full bg-break/15 px-2 py-0.5 text-[10px] font-bold text-break">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dish Name & Kannada Subtitle */}
                    <h3 className="font-display text-base text-ink leading-snug">
                      {item.name}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs italic text-ink-soft" lang="kn">
                        {item.subtitle}
                      </p>
                    )}

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                      {item.description || 'No description added yet.'}
                    </p>

                    {item.prep && (
                      <p className="mt-1 text-[11px] text-ink-soft font-medium">
                        {item.prep}
                      </p>
                    )}
                  </div>

                  {/* Bottom Row: Price, Spice & Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-ink tabular-nums">
                        {formatPrice(item.price)}
                      </span>
                      <SpiceMeter level={item.spiceLevel} />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setIsCustomCategoryInModal(false)
                          setEditingItem({ ...item })
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-sand hover:text-ink"
                        title="Edit Dish"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-kara/10 hover:text-kara"
                        title="Delete Dish"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="rounded-2xl border border-dashed border-ink/20 py-16 text-center">
                <p className="font-display text-lg text-ink">No dishes in this category</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Click "+ Add New Dish" to add a dish to {selectedCourse === 'All' ? 'the menu' : selectedCourse}.
                </p>
                <button
                  onClick={handleOpenCreate}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-kara px-4 py-2 text-xs font-semibold text-cream"
                >
                  <Plus size={14} />
                  <span>Add Dish to {selectedCourse === 'All' ? 'Menu' : selectedCourse}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: CREATE CATEGORY */}
      <AnimatePresence>
        {isCreatingCategory && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatingCategory(false)}
              className="fixed inset-0 bg-kaapi/60 backdrop-blur-xs"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-[76] w-full max-w-md rounded-2xl border border-ink/10 bg-coconut p-6 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kara/10 text-kara">
                    <FolderPlus size={17} />
                  </div>
                  <h3 className="font-display text-lg text-ink">Create New Category</h3>
                </div>
                <button
                  onClick={() => setIsCreatingCategory(false)}
                  className="rounded-full p-1 text-ink-muted hover:bg-ink/5 hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCategorySubmit} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-ink">Category Name *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Snacks, Combos, Breakfast Bowls, Sweets"
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-sand/50 px-3 py-2.5 text-sm text-ink focus:border-kara focus:bg-coconut focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink">Section Subtitle / Description</label>
                  <input
                    type="text"
                    value={newCategoryNote}
                    onChange={(e) => setNewCategoryNote(e.target.value)}
                    placeholder="e.g. Freshly made to order, served with chutneys & podi"
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-sand/50 px-3 py-2 text-xs text-ink focus:border-kara focus:bg-coconut focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-ink/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(false)}
                    className="rounded-full px-4 py-2 font-semibold text-ink-muted hover:bg-ink/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-full bg-kara px-5 py-2 font-semibold text-cream shadow-md hover:bg-kara-dark"
                  >
                    <Check size={16} />
                    <span>Create Category</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT / CREATE DISH */}
      <AnimatePresence>
        {(editingItem || isCreatingNew) && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingItem(null)
                setIsCreatingNew(false)
              }}
              className="fixed inset-0 bg-kaapi/60 backdrop-blur-xs"
            />

            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-[71] flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-ink/10 bg-coconut shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4 bg-sand/40">
                <h3 className="font-display text-xl text-ink">
                  {isCreatingNew ? 'Add New Dish' : `Edit: ${editingItem?.name}`}
                </h3>
                <button
                  onClick={() => {
                    setEditingItem(null)
                    setIsCreatingNew(false)
                  }}
                  className="rounded-full p-1 text-ink-muted hover:bg-ink/5 hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  let finalCategory = editingItem?.category
                  if (isCustomCategoryInModal && inlineCategoryName.trim()) {
                    finalCategory = inlineCategoryName.trim()
                    addCategory({ name: finalCategory })
                  }

                  const itemToSubmit = {
                    ...editingItem,
                    category: finalCategory || 'Dosa',
                  }

                  if (isCreatingNew) {
                    addItem(itemToSubmit)
                  } else {
                    updateItem(itemToSubmit)
                  }
                  setEditingItem(null)
                  setIsCreatingNew(false)
                  setIsCustomCategoryInModal(false)
                }}
                className="flex-1 overflow-y-auto p-6 space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Dish Name */}
                  <div>
                    <label className="block font-bold text-ink">Dish Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.name || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                      placeholder="e.g. Benne plain dosa"
                      className="mt-1 w-full rounded-xl border border-ink/15 bg-sand/50 px-3 py-2 text-sm text-ink focus:border-kara focus:bg-coconut focus:outline-none"
                    />
                  </div>

                  {/* Subtitle / Kannada Name */}
                  <div>
                    <label className="block font-bold text-ink">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={editingItem?.subtitle || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, subtitle: e.target.value })
                      }
                      placeholder="e.g. ಬೆಣ್ಣೆ ಸಾದಾ ದೋಸೆ"
                      className="mt-1 w-full rounded-xl border border-ink/15 bg-sand/50 px-3 py-2 text-sm text-ink focus:border-kara focus:bg-coconut focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Price */}
                  <div>
                    <label className="block font-bold text-ink">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingItem?.price || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          price: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-ink/15 bg-sand/50 px-3 py-2 text-sm text-ink focus:border-kara focus:bg-coconut focus:outline-none"
                    />
                  </div>

                  {/* Category Dropdown & Custom Option */}
                  <div>
                    <label className="block font-bold text-ink">Category *</label>
                    <select
                      value={isCustomCategoryInModal ? '__custom__' : (editingItem?.category || 'Dosa')}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategoryInModal(true)
                        } else {
                          setIsCustomCategoryInModal(false)
                          setEditingItem({ ...editingItem, category: e.target.value })
                        }
                      }}
                      className="mt-1 w-full rounded-xl border border-ink/15 bg-sand/50 px-3 py-2 text-sm text-ink focus:border-kara focus:bg-coconut focus:outline-none"
                    >
                      {courses.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.title}
                        </option>
                      ))}
                      <option value="__custom__">+ Add new category...</option>
                    </select>
                  </div>

                  {/* Spice Level */}
                  <div>
                    <label className="block font-bold text-ink">
                      Spice Level (0 to 3)
                    </label>
                    <div className="mt-1 flex items-center gap-1 rounded-xl border border-ink/15 bg-sand/50 px-3 py-2">
                      {[0, 1, 2, 3].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() =>
                            setEditingItem({ ...editingItem, spiceLevel: lvl })
                          }
                          className={`flex h-6 flex-1 items-center justify-center rounded-md font-bold text-xs transition-colors ${
                            editingItem?.spiceLevel === lvl
                              ? 'bg-kara text-cream'
                              : 'text-ink-muted hover:bg-coconut'
                          }`}
                        >
                          {lvl === 0 ? 'None' : lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inline New Category Input if selected */}
                {isCustomCategoryInModal && (
                  <div className="rounded-xl border border-ghee/50 bg-ghee/10 p-3 space-y-2">
                    <label className="block font-bold text-kaapi">
                      Enter New Category Name *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        autoFocus
                        value={inlineCategoryName}
                        onChange={(e) => setInlineCategoryName(e.target.value)}
                        placeholder="e.g. Combos, Snacks, Sweets"
                        className="flex-1 rounded-xl border border-ink/15 bg-coconut px-3 py-2 text-xs text-ink focus:border-kara focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (inlineCategoryName.trim()) {
                            addCategory({ name: inlineCategoryName.trim() })
                            setEditingItem({ ...editingItem, category: inlineCategoryName.trim() })
                            setIsCustomCategoryInModal(false)
                          }
                        }}
                        className="rounded-xl bg-kara px-3 py-2 font-semibold text-cream hover:bg-kara-dark"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block font-bold text-ink">Description</label>
                  <textarea
                    rows={2}
                    value={editingItem?.description || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, description: e.target.value })
                    }
                    placeholder="Crisp white-butter dosa layered with fragrant spiced potato masala filling..."
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-sand/50 px-3 py-2 text-xs text-ink focus:border-kara focus:bg-coconut focus:outline-none"
                  />
                </div>

                {/* Prep Notes */}
                <div>
                  <label className="block font-bold text-ink">
                    Prep Notes (Short bullets)
                  </label>
                  <input
                    type="text"
                    value={editingItem?.prep || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, prep: e.target.value })
                    }
                    placeholder="e.g. Stone-ground batter • Pure white butter"
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-sand/50 px-3 py-2 text-xs text-ink focus:border-kara focus:bg-coconut focus:outline-none"
                  />
                </div>

                {/* Image Selection */}
                <div>
                  <label className="block font-bold text-ink">Dish Photograph</label>
                  <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <select
                      value={
                        STANDARD_IMAGES.some((s) => s.value === editingItem?.image)
                          ? editingItem?.image || ''
                          : 'custom'
                      }
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setEditingItem({ ...editingItem, image: e.target.value })
                        }
                      }}
                      className="w-full sm:w-auto flex-1 rounded-xl border border-ink/15 bg-sand/50 px-3 py-2 text-xs text-ink focus:border-kara focus:bg-coconut focus:outline-none"
                    >
                      {STANDARD_IMAGES.map((img) => (
                        <option key={img.label} value={img.value}>
                          {img.label}
                        </option>
                      ))}
                      <option value="custom">Custom URL...</option>
                    </select>

                    <input
                      type="text"
                      value={editingItem?.image || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, image: e.target.value })
                      }
                      placeholder="/images/... or https://..."
                      className="w-full sm:w-60 rounded-xl border border-ink/15 bg-sand/50 px-3 py-2 text-xs text-ink focus:border-kara focus:bg-coconut focus:outline-none"
                    />
                  </div>
                </div>

                {/* Highlight Checkbox & Order */}
                <div className="rounded-xl border border-ink/10 bg-sand/40 p-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingItem?.isHighlight)}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          isHighlight: e.target.checked,
                          highlightOrder: e.target.checked
                            ? editingItem?.highlightOrder || 1
                            : 0,
                        })
                      }
                      className="h-4 w-4 rounded accent-kara"
                    />
                    <span className="font-bold text-ink">
                      Mark as one of the 3 Signature Highlights
                    </span>
                  </label>

                  {editingItem?.isHighlight && (
                    <div className="flex items-center gap-3 pl-6 pt-1">
                      <span className="text-ink-muted">Highlight Slot:</span>
                      {[1, 2, 3].map((slot) => (
                        <label
                          key={slot}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="highlightOrder"
                            value={slot}
                            checked={Number(editingItem?.highlightOrder) === slot}
                            onChange={() =>
                              setEditingItem({
                                ...editingItem,
                                highlightOrder: slot,
                              })
                            }
                            className="accent-kara"
                          />
                          <span className="font-semibold text-ink">
                            #{slot} {slot === 2 ? '(Hero Center)' : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem?.isAvailable !== false}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          isAvailable: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded accent-open"
                    />
                    <span className="font-semibold text-ink">
                      Available (In Stock)
                    </span>
                  </label>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-ink/10 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(null)
                      setIsCreatingNew(false)
                      setIsCustomCategoryInModal(false)
                    }}
                    className="rounded-full px-4 py-2 font-semibold text-ink-muted hover:bg-ink/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-full bg-kara px-5 py-2 font-semibold text-cream shadow-md hover:bg-kara-dark"
                  >
                    <Check size={16} />
                    <span>{isCreatingNew ? 'Add Dish' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="fixed inset-0 bg-kaapi/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-[76] w-full max-w-sm rounded-2xl border border-ink/10 bg-coconut p-5 shadow-2xl text-center"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-kara/10 text-kara">
                <Trash2 size={20} />
              </div>
              <h3 className="mt-3 font-display text-lg text-ink">
                Delete "{itemToDelete.name}"?
              </h3>
              <p className="mt-1 text-xs text-ink-muted">
                This will remove the dish from the menu and takeaway cart.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 rounded-full border border-ink/15 py-2 text-xs font-semibold text-ink hover:bg-sand"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteItem(itemToDelete.id)
                    setItemToDelete(null)
                  }}
                  className="flex-1 rounded-full bg-kara py-2 text-xs font-semibold text-cream hover:bg-kara-dark"
                >
                  Delete Dish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM FACTORY RESET MODAL */}
      <AnimatePresence>
        {resetConfirmOpen && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResetConfirmOpen(false)}
              className="fixed inset-0 bg-kaapi/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-[76] w-full max-w-sm rounded-2xl border border-ink/10 bg-coconut p-5 shadow-2xl text-center"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-ghee/20 text-ghee-light">
                <RefreshCw size={20} />
              </div>
              <h3 className="mt-3 font-display text-lg text-ink">
                Reset to Default Menu?
              </h3>
              <p className="mt-1 text-xs text-ink-muted">
                This will restore all 31 official dishes and the 3 signature highlights
                to default items.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setResetConfirmOpen(false)}
                  className="flex-1 rounded-full border border-ink/15 py-2 text-xs font-semibold text-ink hover:bg-sand"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setResetConfirmOpen(false)
                    await resetToDefaults()
                  }}
                  className="flex-1 rounded-full bg-kara py-2 text-xs font-semibold text-cream hover:bg-kara-dark"
                >
                  Reset Menu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
