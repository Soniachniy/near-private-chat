import { decodeString, formatFileSize } from '@/lib/utils';
import { Tooltip } from './ui/tooltip';
import { type File } from '@/types';
import { useState } from 'react';
import Spinner from './common/Spinner';

export default function FileItem({
	file,
	smallView = false,
	loading = false,
	dismissible = false,
	onDismiss = () => {}
}: {
	file: File;
	smallView?: boolean;
	loading?: boolean;
	dismissible?: boolean;
	onDismiss?: () => void;
}) {
	const [showModal, setShowModal] = useState(false);

	const renderContent = () => {
		if (file.type === 'file') {
			return 'File';
		} else if (file.type === 'doc') {
			return 'Document';
		} else if (file.type === 'collection') {
			return 'Collection';
		} else {
			return <span className=" capitalize line-clamp-1">{file.type}</span>;
		}
	};

	return (
		<button
			className={`relative w-60 group p-1.5 bg-gray-850 flex items-center gap-1  ${
				smallView ? 'rounded-xl' : 'rounded-2xl'
			} text-left`}
			type="button"
			onClick={async () => {
				if (file?.data?.content) {
					setShowModal(!showModal);
				} else {
					if (file.url) {
						if (file.type === 'file') {
							window.open(`${file.url}/content`, '_blank')?.focus();
						} else {
							window.open(`${file.url}`, '_blank')?.focus();
						}
					}
				}
			}}
		>
			{!smallView && (
				<div className="p-3 bg-black/20 dark:bg-white/10 text-white rounded-xl">
					{!loading ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className=" size-5"
						>
							<path
								fill-rule="evenodd"
								d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
								clip-rule="evenodd"
							/>
							<path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
						</svg>
					) : (
						<Spinner />
					)}
				</div>
			)}

			{!smallView ? (
				<div className="flex flex-col justify-center -space-y-0.5 px-2.5 w-full">
					<div className=" dark:text-gray-100 text-sm font-medium line-clamp-1 mb-1">
						{decodeString(file.name)}
					</div>

					<div className=" flex justify-between text-gray-500 text-xs line-clamp-1">
						{renderContent()}
						{file.size && <span className="capitalize">{formatFileSize(file.size)}</span>}
					</div>
				</div>
			) : (
				<Tooltip aria-label={decodeString(file.name)}>
					<div className="flex flex-col justify-center -space-y-0.5 px-2.5 w-full">
						<div className=" dark:text-gray-100 text-sm flex justify-between items-center">
							{loading && (
								<div className=" shrink-0 mr-2">
									<Spinner className="size-4" />
								</div>
							)}
							<div className="font-medium line-clamp-1 flex-1">{decodeString(file.name)}</div>
							<div className="text-gray-500 text-xs capitalize shrink-0">
								{formatFileSize(file.size)}
							</div>
						</div>
					</div>
				</Tooltip>
			)}

			{dismissible && (
				<div className=" absolute -top-1 -right-1">
					<button
						className=" bg-white text-black border border-gray-50 rounded-full group-hover:visible invisible transition"
						type="button"
						onClick={() => {
							onDismiss();
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className="w-4 h-4"
						>
							<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
						</svg>
					</button>
				</div>
			)}
		</button>
	);
}
