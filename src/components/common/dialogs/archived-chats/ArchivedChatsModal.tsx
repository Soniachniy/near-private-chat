import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import fileSaver from 'file-saver';
import { MagnifyingGlassIcon, TrashIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CompactTooltip } from '@/components/ui/tooltip';
import ConfirmDialog from '../ConfirmDialog';
import { cn } from '@/lib/utils';

dayjs.extend(localizedFormat);
const { saveAs } = fileSaver;

interface Chat {
	id: string;
	title: string;
	created_at: number;
}

// Mock data for archived chats
const MOCK_ARCHIVED_CHATS: Chat[] = [
	{
		id: '1a2b3c4d',
		title: 'Discussion about React best practices',
		created_at: Math.floor(new Date('2024-09-15').getTime() / 1000)
	},
	{
		id: '2b3c4d5e',
		title: 'How to optimize database queries',
		created_at: Math.floor(new Date('2024-08-28').getTime() / 1000)
	},
	{
		id: '3c4d5e6f',
		title: 'TypeScript generic types explained',
		created_at: Math.floor(new Date('2024-08-10').getTime() / 1000)
	},
	{
		id: '4d5e6f7g',
		title: 'Building a responsive navigation menu',
		created_at: Math.floor(new Date('2024-07-22').getTime() / 1000)
	},
	{
		id: '5e6f7g8h',
		title: 'Understanding async/await patterns',
		created_at: Math.floor(new Date('2024-07-05').getTime() / 1000)
	},
	{
		id: '6f7g8h9i',
		title: 'CSS Grid vs Flexbox: when to use each',
		created_at: Math.floor(new Date('2024-06-18').getTime() / 1000)
	},
	{
		id: '7g8h9i0j',
		title: 'API design principles and REST conventions',
		created_at: Math.floor(new Date('2024-06-01').getTime() / 1000)
	},
	{
		id: '8h9i0j1k',
		title: 'State management in React applications',
		created_at: Math.floor(new Date('2024-05-14').getTime() / 1000)
	},
	{
		id: '9i0j1k2l',
		title: 'Docker containerization basics',
		created_at: Math.floor(new Date('2024-04-27').getTime() / 1000)
	},
	{
		id: '0j1k2l3m',
		title: 'Git workflow strategies for teams',
		created_at: Math.floor(new Date('2024-04-10').getTime() / 1000)
	},
	{
		id: '1k2l3m4n',
		title: 'Security best practices for web apps',
		created_at: Math.floor(new Date('2024-03-23').getTime() / 1000)
	},
	{
		id: '2l3m4n5o',
		title: 'Performance optimization techniques',
		created_at: Math.floor(new Date('2024-03-05').getTime() / 1000)
	}
];

interface ArchivedChatsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onChange?: () => void;
}

const ArchivedChatsModal = ({ open, onOpenChange, onChange }: ArchivedChatsModalProps) => {
	const { t } = useTranslation('translation', { useSuspense: false });
	
	const [chats, setChats] = useState<Chat[]>([]);
	const [searchValue, setSearchValue] = useState('');
	const [showUnarchiveAllConfirmDialog, setShowUnarchiveAllConfirmDialog] = useState(false);

	// Fetch archived chats when modal opens
	useEffect(() => {
		if (open) {
			fetchArchivedChats();
		}
	}, [open]);

	const fetchArchivedChats = async () => {
		// const chats = await getArchivedChatList(localStorage.token);
		// setChats(chats);
		
		// Using mock data for development
		setChats(MOCK_ARCHIVED_CHATS);
	};

	const unarchiveChatHandler = async (chatId: string) => {
		try {
			// await archiveChatById(localStorage.token, chatId);
			void chatId; // TODO: Remove when API is implemented
			await fetchArchivedChats();
			onChange?.();
		} catch (error) {
			toast.error(`${error}`);
		}
	};

	const deleteChatHandler = async (chatId: string) => {
		try {
			// await deleteChatById(localStorage.token, chatId);
			void chatId; // TODO: Remove when API is implemented
			await fetchArchivedChats();
		} catch (error) {
			toast.error(`${error}`);
		}
	};

	const exportChatsHandler = async () => {
		try {
			// const allChats = await getAllArchivedChats(localStorage.token);
			
			// Using mock data for development
			const allChats = MOCK_ARCHIVED_CHATS;
			const blob = new Blob([JSON.stringify(allChats, null, 2)], {
				type: 'application/json'
			});
			saveAs(blob, `${t('archived-chat-export')}-${Date.now()}.json`);
		} catch (error) {
			toast.error(`${error}`);
		}
	};

	const unarchiveAllHandler = async () => {
		try {
			for (const chat of chats) {
				void chat.id; // TODO: Use in archiveChatById when API is implemented
				// await archiveChatById(localStorage.token, chat.id);
			}
			await fetchArchivedChats();
			onChange?.();
		} catch (error) {
			toast.error(`${error}`);
		}
	};

	const filteredChats = chats.filter((chat) => 
		searchValue === '' || chat.title.toLowerCase().includes(searchValue.toLowerCase())
	);

	return (
		<>
			<ConfirmDialog
				open={showUnarchiveAllConfirmDialog}
				title={t('Unarchive All')}
				description={t('Are you sure you want to unarchive all archived chats?')}
				confirmText={t('Unarchive All')}
				onConfirm={() => {
					setShowUnarchiveAllConfirmDialog(false);
					unarchiveAllHandler();
				}}
				onCancel={() => setShowUnarchiveAllConfirmDialog(false)}
			/>

			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle className="text-lg font-medium">{t('Archived Chats')}</DialogTitle>
                        <DialogDescription className="sr-only" />
					</DialogHeader>

					<div className="flex flex-col w-full dark:text-gray-200">
						{/* Search Input */}
						<div className="flex w-full mt-2 space-x-2">
							<div className="flex flex-1">
								<div className="self-center ml-1 mr-3">
									<MagnifyingGlassIcon className="size-4" />
								</div>
								<input
									className="w-full text-sm pr-4 py-1 rounded-r-xl outline-hidden bg-transparent"
									value={searchValue}
									onChange={(e) => setSearchValue(e.target.value)}
									placeholder={t('Search Chats')}
								/>
							</div>
						</div>

						<hr className="border-gray-100 dark:border-gray-850 my-2" />

						{/* Table or Empty State */}
						<div className="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6">
							{chats.length > 0 ? (
								<div className="w-full">
									<div className="text-left text-sm w-full mb-3 max-h-[22rem] overflow-y-scroll">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="px-3 py-2">{t('Name')}</TableHead>
													<TableHead className="px-3 py-2 hidden md:table-cell">
														{t('Created At')}
													</TableHead>
													<TableHead className="px-3 py-2 text-right" />
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredChats.map((chat, idx) => (
													<TableRow
														key={chat.id}
														className={cn(`bg-gray-900 border-gray-50 dark:border-gray-850 text-xs`, idx !== chats.length - 1 && 'border-b')}
													>
														<TableCell className="px-3 py-1 w-2/3">
															<a href={`/c/${chat.id}`} target="_blank" rel="noreferrer">
																<div className="underline line-clamp-1">
																	{chat.title}
																</div>
															</a>
														</TableCell>

														<TableCell className="px-3 py-1 hidden md:table-cell h-[2.5rem]">
															<div className="my-auto">
																{dayjs(chat.created_at * 1000).format('LLL')}
															</div>
														</TableCell>

														<TableCell className="px-3 py-1 text-right">
															<div className="flex justify-end w-full">
																{/* Unarchive Button */}
																<CompactTooltip content={t('Unarchive Chat')} align="center">
																	<button
																		className="self-center w-fit text-sm px-2 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"
																		onClick={() => unarchiveChatHandler(chat.id)}
																	>
                                                                        <ArrowUpOnSquareIcon className="size-4" />
																	</button>
																</CompactTooltip>

																{/* Delete Button */}
																<CompactTooltip content={t('Delete Chat')} align="center">
																	<button
																		className="self-center w-fit text-sm px-2 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"
																		onClick={() => deleteChatHandler(chat.id)}
																	>
                                                                        <TrashIcon className="size-4" />
																	</button>
																</CompactTooltip>
															</div>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>

									{/* Action Buttons */}
									<div className="flex flex-wrap text-sm font-medium gap-1.5 mt-2 m-1 justify-end w-full">
										<button
											className="px-3.5 py-1.5 font-medium hover:bg-black/5 dark:hover:bg-white/5 outline-1 outline-gray-300 dark:outline-gray-800 rounded-3xl"
											onClick={() => setShowUnarchiveAllConfirmDialog(true)}
										>
											{t('Unarchive All Archived Chats')}
										</button>

										<button
											className="px-3.5 py-1.5 font-medium hover:bg-black/5 dark:hover:bg-white/5 outline-1 outline-gray-300 dark:outline-gray-800 rounded-3xl"
											onClick={exportChatsHandler}
										>
											{t('Export All Archived Chats')}
										</button>
									</div>
								</div>
							) : (
								<div className="text-left text-sm w-full mb-8">
									{t('You have no archived conversations.')}
								</div>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ArchivedChatsModal;

