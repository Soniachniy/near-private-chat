import ArchiveBoxIcon from "@heroicons/react/24/outline/ArchiveBoxIcon";
import ArrowDownTrayIcon from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import BookmarkIcon from "@heroicons/react/24/outline/BookmarkIcon";
import BookmarkSlashIcon from "@heroicons/react/24/outline/BookmarkSlashIcon";
import DocumentDuplicateIcon from "@heroicons/react/24/outline/DocumentDuplicateIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import FileSaver from "file-saver";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { chatClient } from "@/api/chat/client";
import {
  useArchiveChat,
  useChatPinnedStatus,
  useCloneChat,
  useDeleteChat,
  useTogglePinnedStatus,
} from "@/api/chat/queries";
import EllipsisHorizontal from "@/assets/icons/ellipsis-horizontal.svg?react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createMessagesList } from "@/lib";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { ChatInfo } from "@/types";
import ConfirmDialog from "../common/dialogs/ConfirmDialog";

type ChatMenuProps = {
  chat: ChatInfo;
  handleRename: () => void;
};

export default function ChatMenu({ chat, handleRename }: ChatMenuProps) {
  const { t } = useTranslation("translation", { useSuspense: false });
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
        type: "application/json",
      });
      FileSaver.saveAs(blob, `chat-export-${Date.now()}.json`);
      toast.info("Download JSON - coming soon");
    } catch (error) {
      console.error("Failed to download JSON:", error);
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
      }, "");

      const blob = new Blob([chatText.trim()], {
        type: "text/plain",
      });
      FileSaver.saveAs(blob, `chat-${chatData.chat.title}.txt`);
      toast.info("Download TXT - coming soon");
    } catch (error) {
      console.error("Failed to download TXT:", error);
    }
  };

  const downloadAsPDF = async () => {
    try {
      const chatData = await chatClient.getChatById(chat.id);
      if (!chatData) return;
      const containerElement = document.getElementById("messages-container");

      if (containerElement) {
        const isDarkMode = settings.theme === "dark";

        // Define a fixed virtual screen size
        const virtualWidth = 1024;
        const virtualHeight = 1400;

        // Clone the container to avoid layout shifts
        const clonedElement = containerElement.cloneNode(true) as HTMLElement;
        clonedElement.style.width = `${virtualWidth}px`;
        clonedElement.style.height = "auto";

        document.body.appendChild(clonedElement);

        // Render to canvas with predefined width
        const canvas = await html2canvas(clonedElement, {
          backgroundColor: isDarkMode ? "#000" : "#fff",
          useCORS: true,
          scale: 2,
          width: virtualWidth,
          windowWidth: virtualWidth,
          windowHeight: virtualHeight,
        });

        document.body.removeChild(clonedElement);

        const imgData = canvas.toDataURL("image/png");

        // A4 page settings
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 297;

        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Set page background for dark mode
        if (isDarkMode) {
          pdf.setFillColor(0, 0, 0);
          pdf.rect(0, 0, imgWidth, pageHeight, "F");
        }

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Handle additional pages
        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();

          if (isDarkMode) {
            pdf.setFillColor(0, 0, 0);
            pdf.rect(0, 0, imgWidth, pageHeight, "F");
          }

          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`chat-${chatData.chat.title}.pdf`);
        toast.info("Download PDF - coming soon");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <>
      <ConfirmDialog
        title={t("Delete chat?")}
        description={
          <>
            {t("This will delete")} <span className="font-semibold">{chat.title}</span>
          </>
        }
        onConfirm={() => deleteChatById({ id: chat.id })}
        onCancel={() => setShowDeleteConfirm(false)}
        open={showDeleteConfirm}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus:outline-none">
            <EllipsisHorizontal
              className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
              fill="white"
              stroke="white"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-full min-w-[200px] rounded-xl border-none bg-gray-875 px-1 py-1.5 outline-none ring-0"
          sideOffset={-2}
          side="bottom"
          align="start"
        >
          {/* Pin/Unpin */}
          <DropdownMenuItem
            className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-1.5 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
            onClick={handlePinToggle}
          >
            {isPinned ? (
              <>
                <BookmarkSlashIcon className="h-4 w-4" strokeWidth={2} />
                <span>{t("Unpin")}</span>
              </>
            ) : (
              <>
                <BookmarkIcon className="h-4 w-4" strokeWidth={2} />
                <span>{t("Pin")}</span>
              </>
            )}
          </DropdownMenuItem>

          {/* Rename */}
          <DropdownMenuItem
            className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-1.5 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
            onClick={handleRename}
          >
            <PencilIcon className="h-4 w-4" strokeWidth={2} />
            <span>{t("Rename")}</span>
          </DropdownMenuItem>

          {/* Clone */}
          <DropdownMenuItem
            className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-1.5 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
            onClick={handleClone}
          >
            <DocumentDuplicateIcon className="h-4 w-4" strokeWidth={2} />
            <span>{t("Clone")}</span>
          </DropdownMenuItem>

          {/* Archive */}
          <DropdownMenuItem
            className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-1.5 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
            onClick={handleArchive}
          >
            <ArchiveBoxIcon className="h-4 w-4" strokeWidth={2} />
            <span>{t("Archive")}</span>
          </DropdownMenuItem>

          {/* Download Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-2 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white">
              <ArrowDownTrayIcon className="h-4 w-4" strokeWidth={2} />
              <span>{t("Download")}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              className="w-full min-w-[200px] rounded-xl border-none bg-gray-850 px-1 py-1.5"
              sideOffset={8}
            >
              <DropdownMenuItem
                className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-2 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
                onClick={downloadAsJSON}
              >
                <span className="line-clamp-1">{t("Export chat (.json)")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-2 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
                onClick={downloadAsTXT}
              >
                <span className="line-clamp-1">{t("Plain text (.txt)")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-2 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
                onClick={downloadAsPDF}
              >
                <span className="line-clamp-1">{t("PDF document (.pdf)")}</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Delete */}
          <DropdownMenuItem
            className="flex cursor-pointer flex-row gap-2 rounded-md px-3 py-1.5 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
            onClick={handleDelete}
          >
            <TrashIcon className="h-4 w-4" strokeWidth={2} />
            <span>{t("Delete")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
