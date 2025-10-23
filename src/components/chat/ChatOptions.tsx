import { ChatBubbleLeftEllipsisIcon, ClipboardIcon, CubeIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import EllipsisHorizontal from "@/assets/icons/ellipsis-horizontal.svg?react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyToClipboard, createMessagesList } from "@/lib";
import type { Chat } from "@/types";
import DownloadDropdown from "./DownloadDropdown";

type ChatOptionsProps = {
  chat: Chat;
};

const ChatOptions = ({ chat }: ChatOptionsProps) => {
  const { t } = useTranslation("translation", { useSuspense: false });

  const copyChatAsText = async () => {
    const history = chat.chat.history;
    const messages = createMessagesList(history, history.currentId);
    const chatText = messages
      .reduce((a, message) => `${a}### ${message.role.toUpperCase()}\n${message.content}\n\n`, "")
      .trim();

    const res = await copyToClipboard(chatText).catch((e) => {
      console.error(e);
    });

    if (res) {
      toast.success(t("Copied to clipboard"));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer rounded-xl px-2 py-2 transition hover:bg-gray-50 dark:hover:bg-gray-850"
          id="chat-context-menu-button"
          title="Chat Options"
        >
          <EllipsisHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-full min-w-[200px] rounded-xl border-none bg-gray-875 px-1 py-1.5 outline-none ring-0"
        sideOffset={-2}
        side="bottom"
        align="end"
      >
        <DropdownMenuItem
          disabled
          className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-1.5 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
        >
          <ChatBubbleLeftEllipsisIcon className="h-4 w-4" strokeWidth={2} />
          <span>{t("Overview")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled
          className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-1.5 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
        >
          <CubeIcon className="h-4 w-4" strokeWidth={2} />
          <span>{t("Artifacts")}</span>
        </DropdownMenuItem>
        <DownloadDropdown chatId={chat.id} />
        <DropdownMenuItem
          className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-1.5 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
          onClick={copyChatAsText}
        >
          <ClipboardIcon className="h-4 w-4" strokeWidth={2} />
          <span>{t("Copy")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatOptions;
