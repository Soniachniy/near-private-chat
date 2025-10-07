import React from 'react';
import Spinner from '@/components/common/Spinner';

interface MessageSkeletonProps {
	message?: string;
}

const MessageSkeleton: React.FC<MessageSkeletonProps> = ({
	message = 'Encrypting & fetching messages ...'
}) => {
	return (
		<div className="flex items-center py-0.5 gap-x-2 text-xs">
			<Spinner className="size-4 text-[#00EC97]" />
			<span className="shimmer text-gray-500 dark:text-gray-500 text-base">{message}</span>
		</div>
	);
};

export default MessageSkeleton;
