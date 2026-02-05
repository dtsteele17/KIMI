import { create } from 'zustand';
import type { Page } from '@/types';

interface NavigationState {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'home',
  navigateTo: (page) => set({ currentPage: page }),
}));
