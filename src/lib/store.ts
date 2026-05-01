import { create } from 'zustand'

export type AppView =
  | 'home'
  | 'blog'
  | 'blog-detail'
  | 'hotels'
  | 'hotel-detail'
  | 'competitions'
  | 'competition-detail'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'admin'
  | 'post-editor'

interface Filters {
  region?: string
  ecoRating?: string
  categoryId?: string
  search?: string
}

interface AppState {
  currentView: AppView
  selectedId: string | null
  searchQuery: string
  filters: Filters
  setView: (view: AppView) => void
  setSelectedId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setFilters: (filters: Filters) => void
  navigateTo: (view: AppView, id?: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  selectedId: null,
  searchQuery: '',
  filters: {},
  setView: (view) => set({ currentView: view }),
  setSelectedId: (id) => set({ selectedId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (filters) => set({ filters }),
  navigateTo: (view, id) =>
    set({
      currentView: view,
      selectedId: id || null,
    }),
}))
