import { Cog8ToothIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/time";
import AboutSettings from "./AboutSettings";
import GeneralSettings from "./GeneralSettings";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsTab = "general" | "about";

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const { t } = useTranslation("translation", { useSuspense: false });

  const tabs = useMemo(
    () => [
      {
        id: "general" as SettingsTab,
        label: t("General"),
        icon: Cog8ToothIcon,
      },
      {
        id: "about" as SettingsTab,
        label: t("About"),
        icon: InformationCircleIcon,
      },
    ],
    [t]
  );

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

        <div className="flex h-full flex-col gap-4 md:flex-row">
          <div className="md:w-40">
            <div className="flex overflow-x-auto md:flex-col md:overflow-x-visible">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex min-w-fit flex-1 rounded-lg px-0.5 py-1 outline-none ring-none transition-colors"
                >
                  <tab.icon
                    className={cn(
                      "mr-2 h-4 w-4 hover:text-foreground",
                      activeTab === tab.id ? "text-foreground" : "text-muted-foreground"
                    )}
                  />
                  <p
                    className={cn(
                      "font-medium text-sm hover:text-foreground",
                      activeTab === tab.id ? "font-medium text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {tab.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[32rem] flex-1 overflow-y-auto md:min-h-[32rem]">{renderContent()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
