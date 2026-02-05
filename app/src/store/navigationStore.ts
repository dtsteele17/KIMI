import { create } from 'zustand';
import type { Page } from '@/types';

interface NavigationState {
  currentPage: Page;
  routeParams: Record<string, string>;
  navigateTo: (page: Page, params?: Record<string, string>) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'home',
  routeParams: {},
  navigateTo: (page, params = {}) => set({ currentPage: page, routeParams: params }),
}));
