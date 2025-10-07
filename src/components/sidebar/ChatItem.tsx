import { toChatRoute } from "@/pages/routes";
import { Link } from "react-router";
import ChatMenu from "../sidebar/ChatMenu";
import type { ChatInfo } from "@/types";
import { useRef, useState } from "react";
import { CompactTooltip } from "../ui/tooltip";
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRenameChat } from "@/api/chat/queries";

type ChatItemProps = {
    chat: ChatInfo;
    isCurrentChat: boolean;
};

const ChatItem = ({ chat, isCurrentChat }: ChatItemProps) => {
    const [showRename, setShowRename] = useState(false);
    const renameRef = useRef<HTMLInputElement>(null);
    const [renameInput, setRenameInput] = useState(chat.title);
    const { mutate: renameChat } = useRenameChat();

    const confirmRename = () => {
        renameChat({ id: chat.id, title: renameInput });
        setShowRename(false);
    };

    const handleRename = async () => {
        setShowRename(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        renameRef.current?.focus();
    };

    const handleCancelRename = () => {
        setShowRename(false);
        setRenameInput(chat.title);
    };

    return (
        <div className="w-full  relative group" draggable="true">
            <Link
                className={
                    `w-full flex justify-between rounded-lg px-[11px] py-[6px] whitespace-nowrap text-ellipsis` +
                    (isCurrentChat ? ' bg-[#00ec9714]' : '')
                }
                to={toChatRoute(chat.id)}
                draggable="false"
            >
                {showRename ? (
                    <>
                        <div className="flex self-center flex-1 w-full">
                            <input
                                ref={renameRef}
                                className="w-full bg-transparent outline-none border-none text-left self-center text-white h-[20px]"
                                value={renameInput}
                                onChange={(e) => setRenameInput(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <CompactTooltip content='Confirm' align="center">
                                <button onClick={confirmRename}>
                                    <CheckIcon className="size-4" />
                                </button>
                            </CompactTooltip>
                            <CompactTooltip content='Cancel' align="center">
                                <button onClick={handleCancelRename}>
                                    <XMarkIcon className="size-4" />
                                </button>
                            </CompactTooltip>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex self-center flex-1 w-full">
                            <div
                                dir="auto"
                                className="text-left self-center text-white overflow-hidden w-full h-[20px]"
                            >
                                {chat.title}
                            </div>
                        </div>
                        <ChatMenu chat={chat} handleRename={handleRename} />
                    </>
                )}
            </Link>
        </div>
    )
}

export default ChatItem;