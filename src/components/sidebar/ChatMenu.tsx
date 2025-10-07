import type { ChatInfo } from "@/types";
import { 
	DropdownMenu, 
	DropdownMenuContent, 
	DropdownMenuItem, 
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import EllipsisHorizontal from '@/assets/icons/ellipsis-horizontal.svg?react';

import BookmarkIcon from '@heroicons/react/24/outline/BookmarkIcon';
import BookmarkSlashIcon from '@heroicons/react/24/outline/BookmarkSlashIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import DocumentDuplicateIcon from '@heroicons/react/24/outline/DocumentDuplicateIcon';
import ArchiveBoxIcon from '@heroicons/react/24/outline/ArchiveBoxIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';

import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useArchiveChat, useTogglePinnedStatus, useDeleteChat, useCloneChat, useChatPinnedStatus } from "@/api/chat/queries";
import ConfirmDialog from "../common/dialogs/ConfirmDialog";
import { useState } from "react";
import { chatClient } from "@/api/chat/client";
import { useSettingsStore } from "@/stores/useSettingsStore";

import FileSaver from 'file-saver';
import { createMessagesList } from "@/lib";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

type ChatMenuProps = {
	chat: ChatInfo;
    handleRename: () => void;
};

export default function ChatMenu({ 
	chat,
    handleRename,
}: ChatMenuProps) {
	const { t } = useTranslation('translation', { useSuspense: false });
	const { settings } = useSettingsStore();
	const { data: isPinned } = useChatPinnedStatus({ id: chat.id });
	const { mutate: toggleChatPinnedStatusById } = useTogglePinnedStatus();
	const { mutate: cloneChatById } = useCloneChat();
	const { mutate: archiveChatById } = useArchiveChat();
	const { mutate: deleteChatById } = useDeleteChat();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handlePinToggle = () => {
		toggleChatPinnedStatusById({ id: chat.id });
	};

	const handleClone = () => {
		cloneChatById({ id: chat.id });
	};

	const handleArchive = () => {
		archiveChatById({ id: chat.id });
	};

	const handleDelete = () => {
        setShowDeleteConfirm(true);
	};

	const downloadAsJSON = async () => {
		try {
			const chatData = await chatClient.getChatById(chat.id);
			if (!chatData) return;
            const blob = new Blob([JSON.stringify([chatData])], {
                type: 'application/json'
            });
            FileSaver.saveAs(blob, `chat-export-${Date.now()}.json`);
            toast.info('Download JSON - coming soon');
		} catch (error) {
			console.error('Failed to download JSON:', error);
		}
	};

	const downloadAsTXT = async () => {
		try {
			const chatData = await chatClient.getChatById(chat.id);
			if (!chatData) return;
		
			const history = chatData.chat.history;
			const messages = createMessagesList(history, history.currentId);
			const chatText = messages.reduce((a, message) => {
				return `${a}### ${message.role.toUpperCase()}\n${message.content}\n\n`;
			}, '');
		
			const blob = new Blob([chatText.trim()], {
				type: 'text/plain'
			});
			FileSaver.saveAs(blob, `chat-${chatData.chat.title}.txt`);
            toast.info('Download TXT - coming soon');
		} catch (error) {
			console.error('Failed to download TXT:', error);
		}
		
	};

	const downloadAsPDF = async () => {
		try {
			const chatData = await chatClient.getChatById(chat.id);
			if (!chatData) return;
			const containerElement = document.getElementById('messages-container');
		
			if (containerElement) {
				const isDarkMode = settings.theme === 'dark';
		
				// Define a fixed virtual screen size
				const virtualWidth = 1024;
				const virtualHeight = 1400;
		
				// Clone the container to avoid layout shifts
				const clonedElement = containerElement.cloneNode(true) as HTMLElement;
				clonedElement.style.width = `${virtualWidth}px`;
				clonedElement.style.height = 'auto';
		
				document.body.appendChild(clonedElement);
		
				// Render to canvas with predefined width
				const canvas = await html2canvas(clonedElement, {
					backgroundColor: isDarkMode ? '#000' : '#fff',
					useCORS: true,
					scale: 2,
					width: virtualWidth,
					windowWidth: virtualWidth,
					windowHeight: virtualHeight
				});
		
				document.body.removeChild(clonedElement);
		
				const imgData = canvas.toDataURL('image/png');
		
				// A4 page settings
				const pdf = new jsPDF('p', 'mm', 'a4');
				const imgWidth = 210;
				const pageHeight = 297;
		
				const imgHeight = (canvas.height * imgWidth) / canvas.width;
				let heightLeft = imgHeight;
				let position = 0;
		
				// Set page background for dark mode
				if (isDarkMode) {
					pdf.setFillColor(0, 0, 0);
					pdf.rect(0, 0, imgWidth, pageHeight, 'F');
				}
		
				pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
		
				// Handle additional pages
				while (heightLeft > 0) {
					position -= pageHeight;
					pdf.addPage();
		
					if (isDarkMode) {
						pdf.setFillColor(0, 0, 0);
						pdf.rect(0, 0, imgWidth, pageHeight, 'F');
					}
		
					pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
					heightLeft -= pageHeight;
				}
		
				pdf.save(`chat-${chatData.chat.title}.pdf`);
                toast.info('Download PDF - coming soon');
			}
		} catch (error) {
			console.error('Error generating PDF:', error);
		}
		
	};

	return (
        <>
            <ConfirmDialog 
                title={t('Delete chat?')}
                description={<>{t('This will delete')} <span className="font-semibold">{chat.title}</span></>}
                onConfirm={() => deleteChatById({ id: chat.id })}
                onCancel={() => setShowDeleteConfirm(false)}
                open={showDeleteConfirm}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none">
                        <EllipsisHorizontal
                            className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="white"
                            stroke="white"
                        />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-full bg-gray-875 min-w-[200px] outline-none ring-0 border-none rounded-xl px-1 py-1.5"
                    sideOffset={-2}
                    side="bottom"
                    align="start"
                >
                    {/* Pin/Unpin */}
                    <DropdownMenuItem 
                        className="flex flex-row gap-2 py-1.5 px-3 hover:bg-gray-800 focus:bg-gray-800 focus:text-white hover:text-white text-white cursor-pointer rounded-md"
                        onClick={handlePinToggle}
                    >
                        {isPinned ? (
                            <>
                                <BookmarkSlashIcon className="w-4 h-4" strokeWidth={2} />
                                <span>{t('Unpin')}</span>
                            </>
                        ) : (
                            <>
                                <BookmarkIcon className="w-4 h-4" strokeWidth={2} />
                                <span>{t('Pin')}</span>
                            </>
                        )}
                    </DropdownMenuItem>

                    {/* Rename */}
                    <DropdownMenuItem 
                        className="flex flex-row gap-2 py-1.5 px-3 hover:bg-gray-800 focus:bg-gray-800 focus:text-white hover:text-white text-white cursor-pointer rounded-md"
                        onClick={handleRename}
                    >
                        <PencilIcon className="w-4 h-4" strokeWidth={2} />
                        <span>{t('Rename')}</span>
                    </DropdownMenuItem>

                    {/* Clone */}
                    <DropdownMenuItem 
                        className="flex flex-row gap-2 py-1.5 px-3 hover:bg-gray-800 focus:bg-gray-800 focus:text-white hover:text-white text-white cursor-pointer rounded-md"
                        onClick={handleClone}
                    >
                        <DocumentDuplicateIcon className="w-4 h-4" strokeWidth={2} />
                        <span>{t('Clone')}</span>
                    </DropdownMenuItem>

                    {/* Archive */}
                    <DropdownMenuItem 
                        className="flex flex-row gap-2 py-1.5 px-3 hover:bg-gray-800 focus:bg-gray-800 focus:text-white hover:text-white text-white cursor-pointer rounded-md"
                        onClick={handleArchive}
                    >
                        <ArchiveBoxIcon className="w-4 h-4" strokeWidth={2} />
                        <span>{t('Archive')}</span>
                    </DropdownMenuItem>

                    {/* Download Submenu */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex flex-row gap-2 py-2 px-3 hover:bg-gray-800 focus:bg-gray-800 focus:text-white hover:text-white text-white cursor-pointer rounded-md">
                            <ArrowDownTrayIcon className="w-4 h-4" strokeWidth={2} />
                            <span>{t('Download')}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent 
                            className="w-full bg-gray-850 min-w-[200px] rounded-xl px-1 py-1.5 border-none"
                            sideOffset={8}
                        >
                            <DropdownMenuItem 
                                className="flex flex-row gap-2 py-2 px-3 hover:bg-gray-800 focus:bg-gray-800 focus:text-white hover:text-white text-white cursor-pointer rounded-md"
                                onClick={downloadAsJSON}
                            >
                                <span className="line-clamp-1">{t('Export chat (.json)')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="flex flex-row gap-2 py-2 px-3 hover:bg-gray-800 focus:bg-gray-800 focus:text-white hover:text-white text-white cursor-pointer rounded-md"
                                onClick={downloadAsTXT}
                            >
                                <span className="line-clamp-1">{t('Plain text (.txt)')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="flex flex-row gap-2 py-2 px-3 hover:bg-gray-800 focus:bg-gray-800 focus:text-white hover:text-white text-white cursor-pointer rounded-md"
                                onClick={downloadAsPDF}
                            >
                                <span className="line-clamp-1">{t('PDF document (.pdf)')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Delete */}
                    <DropdownMenuItem 
                        className="flex flex-row gap-2 py-1.5 px-3 hover:bg-gray-800 focus:bg-gray-800 focus:text-white hover:text-white text-white cursor-pointer rounded-md"
                        onClick={handleDelete}
                    >
                        <TrashIcon className="w-4 h-4" strokeWidth={2} />
                        <span>{t('Delete')}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
	);
}