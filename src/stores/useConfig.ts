import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Config, ConfigStore } from '../types';

export const useConfigStore = create<ConfigStore>()(
    persist(
        (set) => ({
            config: null,
            setConfig: (config: Config) => set({ config }),
        }),
        {
            name: 'config-storage',
        }
    )
);
