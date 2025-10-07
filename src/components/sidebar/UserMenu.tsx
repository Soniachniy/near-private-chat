import React, { useMemo, useState } from 'react';

import { useUserStore } from '@/stores/useUserStore';
import UserIcon from '@/assets/icons/user-icon.png';
import SettingsIcon from '@/assets/icons/settings-icon.svg?react';
import ArchiveIcon from '@/assets/icons/archive-icon.svg?react';
import SignOutIcon from '@/assets/icons/sign-out-icon.svg?react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import SettingsDialog from '@/components/common/dialogs/settings/SettingsDialog';
import { useTranslation } from 'react-i18next';
import ArchivedChatsModal from '@/components/common/dialogs/archived-chats/ArchivedChatsModal';
import { useSignOut } from '@/api/auth/queries';

export const DropdownType = { Item: 'Item', Separator: 'Separator' } as const;

const UserMenu: React.FC = () => {
	const { t } = useTranslation('translation', { useSuspense: false });
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isArchivedChatsOpen, setIsArchivedChatsOpen] = useState(false);
	const user = useUserStore((state) => state.user);
	const { mutateAsync: signOut } = useSignOut();

	const dropdownItems = useMemo(
		() => [
			{
				title: t('Settings'),
				icon: <SettingsIcon />,
				type: DropdownType.Item,
				action: () => setIsSettingsOpen(true)
			},
			{
				title: t('Archived Chats'),
				icon: <ArchiveIcon />,
				type: DropdownType.Item,
				action: () => setIsArchivedChatsOpen(true)
			},
			{ type: DropdownType.Separator },
			{ title: t('Sign Out'), icon: <SignOutIcon />, type: DropdownType.Item, action: async () => await signOut() }
		],
		[t, signOut]
	);

	return (
		<>
			<DropdownMenu>
                <DropdownMenuTrigger className="flex items-center outline-none ring-none rounded-xl py-2.5 px-2.5 w-full transition">
                    <>
                        <div className="self-center mr-3">
                            <img
                                src={user?.profile_image_url || UserIcon}
                                alt="User"
                                className=" max-w-[30px] object-cover rounded-full"
                            />
                        </div>
                        <div className="self-center font-medium text-white">{user?.name}</div>
                    </>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-full bg-gray-875 min-w-[240px] outline-none ring-none border-none"
                    loop
                    side="top"
                >
                    {dropdownItems.map((el, index) => (
                        <React.Fragment key={el.type + index}>
                            {el.type === DropdownType.Separator && (
                                <DropdownMenuSeparator className="border-gray-100 bg-gray-850" />
                            )}
                            {el.type === DropdownType.Item && (
                                <DropdownMenuItem
                                    className="flex flex-row gap-2 py-2 px-3 hover:bg-gray-800 focus:bg-gray-800 text-white"
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
