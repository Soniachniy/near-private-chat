import React, { useEffect } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useViewStore } from '@/stores/useViewStore';

const BREAKPOINT = 768;

interface ThemeProviderProps {
	children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const { settings } = useSettingsStore();
	const { setIsMobile } = useViewStore();
	useEffect(() => {
		const root = document.documentElement;

		// Remove existing theme classes
		root.classList.remove('light', 'dark');

		// Add the current theme class
		root.classList.add(settings.theme);

		// Force override system dark mode by setting color-scheme
		if (settings.theme === 'dark') {
			root.style.colorScheme = 'dark';
		} else {
			root.style.colorScheme = 'light';
		}
	}, [settings.theme]);

	useEffect(() => {
		setIsMobile(window.innerWidth < BREAKPOINT);

		const onResize = () => {
			if (window.innerWidth < BREAKPOINT) {
				setIsMobile(true);
			} else {
				setIsMobile(false);
			}
		};
		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, [setIsMobile]);

	return <>{children}</>;
};

export default ThemeProvider;
