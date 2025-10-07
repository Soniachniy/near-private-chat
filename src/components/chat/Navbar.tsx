import SafeLogo from '@/assets/images/safe.svg';
import { useViewStore } from '@/stores/useViewStore';
import { useCreateChat } from '@/api/chat/queries';
import { useNavigate, useParams } from 'react-router';
import ModelSelector from './ModelSelector';

export default function Navbar() {
	const { isLeftSidebarOpen, isRightSidebarOpen, setIsRightSidebarOpen, setIsLeftSidebarOpen } =
		useViewStore();

	const { chatId } = useParams<{ chatId: string }>();
	const params = useParams();
	const currentChatId = chatId || params.chatId;
	const navigate = useNavigate();
	const createChat = useCreateChat();

	const handleNewChat = async () => {
		try {
			const newChat = createChat('New Chat');
			navigate(`/c/${newChat.id}`);
		} catch (error) {
			console.error('Failed to create new chat:', error);	
		}
	};

	const handleToggleSidebar = () => {
		setIsLeftSidebarOpen(!isLeftSidebarOpen);
	};

	return (
		<nav className="sticky top-0 z-30 w-full py-1.5 -mb-6 flex flex-col items-center drag-region">
			<div className="flex items-center w-full px-1.5">
				<div className="bg-gradient-to-b via-50% from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pointer-events-none absolute inset-0 -bottom-7 z-[-1]"></div>

				<div className="flex max-w-full w-full mx-auto px-1 pt-1 bg-transparent">
					<div className="flex w-full max-w-full">
						{!isLeftSidebarOpen && (
							<div
								className={`mr-2 md:mr-4 pt-0.5 gap-y-3 self-start flex flex-col text-gray-600 dark:text-gray-400`}
							>
								<button
									type="button"
									className="text-white shadow h-8 w-8 cursor-pointer rounded flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-850 dark:bg-[rgba(248,248,248,0.04)]"
									onClick={handleToggleSidebar}
									title="Expand Sidebar"
								>
									<svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6h16M4 12h16M4 18h16"
										/>
									</svg>
								</button>
								<button
									id="new-chat-button"
									type="button"
									className="text-white shadow hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 h-8 w-8 rounded flex items-center justify-center dark:bg-[rgba(248,248,248,0.04)] transition-colors"
									onClick={handleNewChat}
									aria-label="New Chat"
									title="New Chat"
								>
									<svg
										className="size-4.5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
										/>
									</svg>
								</button>
							</div>
						)}

						<div className="flex-1 overflow-hidden max-w-full py-0.5 flex  justify-center">
							<ModelSelector />
						</div>

						<div className="self-start flex flex-none items-center text-gray-600 dark:text-gray-400">
							{currentChatId && (
								<button
									className="flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition"
									id="chat-context-menu-button"
									title="Chat Options"
								>
									<div className="m-auto self-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth="1.5"
											stroke="currentColor"
											className="size-5"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
											/>
										</svg>
									</div>
								</button>
							)}
							{!isRightSidebarOpen && (
								<button
									onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
									className=" right-4 top-4 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-200"
									title="Toggle Verification Panel"
								>
									<img alt="safe" src={SafeLogo} className="w-8 h-8" />
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
