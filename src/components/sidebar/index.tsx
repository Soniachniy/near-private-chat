import React, { useMemo, useState } from 'react';

import NearAIIcon from '@/assets/icons/near-icon-green.svg?react';
import CloseIcon from '@/assets/icons/close-icon.svg?react';
import PencilIcon from '@/assets/icons/pencil-icon.svg?react';
import ChatArrowDown from '@/assets/icons/chat-arrow-down.svg?react';

import { useViewStore } from '@/stores/useViewStore';
import { useChatStore } from '@/stores/useChatStore';
import { cn, getTimeRange } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { ChatInfo } from '@/types';
import ChatItem from './ChatItem';
import UserMenu from './UserMenu';

const LeftSidebar: React.FC = () => {
	const { t } = useTranslation('translation', { useSuspense: false });
	const { isLeftSidebarOpen, setIsLeftSidebarOpen } = useViewStore();
	const { chats, currentChat } = useChatStore();

	const chatsGroupedByFolder = useMemo(
		() =>
			Object.entries(
				chats?.reduce(
					(acc, chat) => {
						const timeRange = getTimeRange(chat.updated_at);
						acc[timeRange] = [...(acc[timeRange] || []), chat];
						return acc;
					},
					{} as Record<string, ChatInfo[]>
				)
			),
		[chats]
	);

	const [isChatsOpen, setIsChatsOpen] = useState(true);

	return (
		<nav className="shrink-0 text-sm z-50 top-0 left-0 overflow-x-hidden transition-width duration-200 ease-in-out">
			<div
				id="sidebar"
				className={cn(
					'h-screen max-h-[100dvh] min-h-screen fixed select-none',
					isLeftSidebarOpen
						? 'md:relative w-[260px] max-w-[260px]'
						: '-translate-x-[260px] w-[0px]',
					'transition-width duration-200 ease-in-out shrink-0 bg-gray-900 text-gray-900 dark:bg-gray-900 dark:text-gray-200 text-sm fixed z-50 top-0 left-0 overflow-x-hidden'
				)}
			>
				<div
					id="sidebar"
					className={`h-screen max-h-[100dvh] min-h-screen select-none ${
						isLeftSidebarOpen
							? 'md:relative w-[260px] max-w-[260px]'
							: '-translate-x-[260px] w-[0px]'
					}' transition-width duration-200 ease-in-out shrink-0 bg-gray-900 text-gray-900 dark:bg-gray-900 dark:text-gray-200 text-sm fixed z-50 top-0 left-0 overflow-x-hidden
				`}
				>
					<div
						className={`py-2 my-auto flex flex-col justify-between h-screen max-h-[100dvh] w-[260px] overflow-x-hidden z-50 ${
							isLeftSidebarOpen ? '' : 'invisible'
						}`}
					>
						{/* Top section */}
						<div className="flex flex-col items-center justify-between  px-2">
							<div className="flex w-full justify-between my-4 px-2">
								<button
									type="button"
									className="h-8 w-8 cursor-pointer shadow rounded flex items-center justify-center hover:bg-gray-850 dark:bg-[rgba(248,248,248,0.04)]"
								>
									<NearAIIcon className="w-4 h-4" />
								</button>
								<button
									type="button"
									className="text-white shadow dark:hover:text-gray-300 hover:bg-gray-850 h-8 w-8 rounded flex items-center justify-center dark:bg-[rgba(248,248,248,0.04)] transition-colors"
									onClick={() => setIsLeftSidebarOpen(false)}
								>
									<CloseIcon />
								</button>
							</div>
							<div className="w-full">
								<div className="flex justify-center mb-5 space-x-1 text-gray-600 dark:text-white h-9 items-center">
									<a
										id="sidebar-new-chat-button"
										className="flex justify-center items-center flex-1 gap-x-2 rounded-lg px-2 py-1 h-full text-right transition no-drag-region text-white bg-[#F8F8F80A] hover:bg-gray-850"
										href="/"
										draggable="false"
									>
										<div className="flex items-center">
											<div className=" self-center font-medium text-sm font-primary">
												{t('New Chat')}
											</div>
										</div>
										<div>
											<PencilIcon fill={'#000'} />
										</div>
									</a>
								</div>
							</div>
							<div className="w-full cursor-pointer" onClick={() => setIsChatsOpen(!isChatsOpen)}>
								<div>
									<div className="flex items-start justify-between">
										<div className="w-full group rounded-md relative flex items-center justify-between  text-gray-500  transition">
											<button className="w-full py-1.5 pl-2 flex items-center gap-1.5 text-xs font-medium">
												<div className="text-gray-300 dark:text-gray-600 size-3">
													<ChatArrowDown
														stroke="#676767"
														className={!isChatsOpen ? 'rotate-270 ' : ''}
													/>
												</div>
												<div className="translate-y-[0.5px]">{t('Chats')}</div>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="flex flex-col flex-1 w-full  rounded-lg  py-[6px]  group-hover:bg-gray-100 dark:group-hover:bg-gray-950 whitespace-nowrap text-ellipsis">
							{isChatsOpen &&
								chatsGroupedByFolder.map(([timeRange, chats], index) => (
									<div>
										<div
											className={cn(
												'w-full 5 text-xs text-gray-500 pl-2.5 dark:text-gray-500 font-medium  pb-1.5',
												index !== 0 && 'pt-5'
											)}
										>
											{timeRange}
										</div>
										{chats.map((chat) => (
											<ChatItem key={chat.id} chat={chat} isCurrentChat={chat.id === currentChat?.id} />
										))}
									</div>
								))}
						</div>

						{/* Bottom section */}
						<div className="px-2">
							<UserMenu />
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default LeftSidebar;
