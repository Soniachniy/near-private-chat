import {
  ArchiveBoxIcon,
  ArrowRightStartOnRectangleIcon,
  // CodeBracketSquareIcon,
  Cog8ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useSignOut } from "@/api/auth/queries";
import ArchivedChatsModal from "@/components/common/dialogs/archived-chats/ArchivedChatsModal";
import SettingsDialog from "@/components/common/dialogs/settings/SettingsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_ROUTES } from "@/pages/routes";
import { useUserStore } from "@/stores/useUserStore";

interface DropdownItem {
  title?: string;
  icon?: React.ReactNode;
  type: "item" | "separator";
  action?: () => void | Promise<void>;
}

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", { useSuspense: false });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchivedChatsOpen, setIsArchivedChatsOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const { mutateAsync: signOut } = useSignOut();

  const isAdmin = user?.role === "admin";

  const dropdownItems = useMemo<DropdownItem[]>(() => {
    const items: (DropdownItem | false)[] = [
      {
        title: t("Settings"),
        icon: <Cog8ToothIcon className="!h-5 !w-5" />,
        type: "item",
        action: () => setIsSettingsOpen(true),
      },
      {
        title: t("Archived Chats"),
        icon: <ArchiveBoxIcon className="!h-5 !w-5" />,
        type: "item",
        action: () => setIsArchivedChatsOpen(true),
      },
      //TODO: add playground
      // isAdmin && {
      //   title: t("Playground"),
      //   icon: <CodeBracketSquareIcon className="!h-5 !w-5" />,
      //   type: "item",
      //   action: () => navigate(APP_ROUTES.PLAYGROUND),
      // },
      isAdmin && {
        title: t("Admin Panel"),
        icon: <UserCircleIcon className="!h-5 !w-5" />,
        type: "item",
        action: () => navigate(APP_ROUTES.ADMIN),
      },
      { type: "separator" },
      {
        title: t("Sign Out"),
        icon: <ArrowRightStartOnRectangleIcon className="!h-5 !w-5" />,
        type: "item",
        action: async () => await signOut(),
      },
    ];

    return items.filter(Boolean) as DropdownItem[];
  }, [t, signOut, isAdmin, navigate, setIsSettingsOpen, setIsArchivedChatsOpen]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center rounded-xl px-2.5 py-2.5 outline-none ring-none transition">
          <>
            <div className="mr-3 self-center">
              <img
                src={user?.profile_image_url || "/user.png"}
                alt="User"
                className="max-w-[30px] rounded-full object-cover"
              />
            </div>
            <div className="self-center font-medium text-white">{user?.name}</div>
          </>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-full min-w-[240px] border-none bg-gray-875 outline-none ring-none"
          loop
          side="top"
        >
          {dropdownItems.map((el, index) => (
            <React.Fragment key={`${el.type}-${index}`}>
              {el.type === "separator" && <DropdownMenuSeparator className="border-gray-100 bg-gray-850" />}
              {el.type === "item" && (
                <DropdownMenuItem
                  className="flex flex-row gap-2 px-3 py-2 text-white hover:bg-gray-800 focus:bg-gray-800"
                  onClick={el.action}
                >
                  {el.icon} {el.title}
                </DropdownMenuItem>
              )}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <ArchivedChatsModal open={isArchivedChatsOpen} onOpenChange={setIsArchivedChatsOpen} />
    </>
  );
};

export default UserMenu;
