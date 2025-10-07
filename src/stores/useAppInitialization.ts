import { create } from 'zustand';
import { useUserStore } from './useUserStore';
import { useChatStore } from './useChatStore';
import { authClient } from '@/api/auth/client';
import { modelsClient } from '@/api/models/client';
import { configClient } from '@/api/config/client';
import { useConfigStore } from './useConfig';

interface AppInitializationStore {
	isInitialized: boolean;
	isLoading: boolean;
	initializeApp: () => Promise<void>;
}

export const useAppInitialization = create<AppInitializationStore>((set, get) => ({
	isInitialized: false,
	isLoading: false,

	initializeApp: async () => {
		if (get().isInitialized || get().isLoading) return;

		set({ isLoading: true });

		try {
			const config = await configClient.getConfig();
			useConfigStore.getState().setConfig(config);

			// Handle OAuth callback
			const hash = window.location.hash.substring(1);
			if (hash) {
				const params = new URLSearchParams(hash);
				const oauthToken = params.get('token');
				if (oauthToken) {
					localStorage.setItem('token', oauthToken);
					window.history.replaceState(null, '', window.location.pathname);
				}
			}

			const token = localStorage.getItem('token');
			if (token) {
				try {
					const [user, models] = await Promise.all([
						authClient.getSessionUser(),
						modelsClient.getModels()
					]);

					useUserStore.getState().setUser(user);
					useChatStore.getState().setModels(models);
					useChatStore.getState().setSelectedModels([models[0].id]);
					console.log('User loaded:', user);
				} catch (error) {
					console.error('Failed to load user data:', error);

					//TODO: If the error indicates that the token has expired, it will be renewed.
					localStorage.removeItem('token');
					useUserStore.getState().setUser(null);
				}
			}

			set({ isInitialized: true, isLoading: false });
		} catch (error) {
			console.error('Failed to initialize app:', error);
			set({ isLoading: false });
		}
	}
}));
