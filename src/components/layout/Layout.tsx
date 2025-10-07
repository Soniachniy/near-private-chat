import React from 'react';
import LeftSidebar from '@/components/sidebar';
import ChatVerifier from '../chat/ChatVerifier';
import { Outlet } from 'react-router';

const Layout: React.FC = () => {
	return (
		<div className="flex flex-row h-screen w-full">
			<LeftSidebar />
			<div className="w-full flex-1 relative">
				<Outlet />
			</div>
			<ChatVerifier />
		</div>
	);
};

export default Layout;
