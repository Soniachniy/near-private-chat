import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import GeneralSettings from "./GeneralSettings";
import AboutSettings from "./AboutSettings";
import { Cog8ToothIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

interface SettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

type SettingsTab = "general" | "about";

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
	const [activeTab, setActiveTab] = useState<SettingsTab>("general");
    const { t } = useTranslation("translation", { useSuspense: false });

	const tabs = useMemo(() => [
		{ id: "general" as SettingsTab, label: t("General"), icon: Cog8ToothIcon },
		{ id: "about" as SettingsTab, label: t("About"), icon: InformationCircleIcon },
	], [t]);

	const renderContent = () => {
		switch (activeTab) {
			case "general":
				return <GeneralSettings />;
			case "about":
				return <AboutSettings />;
			default:
				return null;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("Settings")}</DialogTitle>
					<DialogDescription className="sr-only" />
				</DialogHeader>
				
				<div className="flex flex-col md:flex-row h-full gap-4">
					<div className="md:w-40">
						<div className="flex md:flex-col overflow-x-auto md:overflow-x-visible">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									className="px-0.5 py-1 min-w-fit rounded-lg flex-1 flex transition-colors ring-none outline-none"
								>
                                    <tab.icon className={cn("w-4 h-4 mr-2 hover:text-foreground", activeTab === tab.id ? "text-foreground" : "text-muted-foreground")} />
                                    <p className={cn("text-sm font-medium hover:text-foreground", activeTab === tab.id ? "text-foreground font-medium" : "text-muted-foreground")}>
                                        {tab.label}
                                    </p>
								</button>
							))}
						</div>
					</div>
					
					{/* Content */}
					<div className="flex-1 overflow-y-auto md:min-h-[32rem] max-h-[32rem]">
						{renderContent()}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default SettingsDialog;