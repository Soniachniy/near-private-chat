import React from 'react';
import Spinner from './Spinner';

const LoadingScreen: React.FC = () => {
	return (
		<div className="size-full flex-1 flex items-center justify-center">
			<Spinner className="size-10" />
		</div>
	);
};

export default LoadingScreen;
