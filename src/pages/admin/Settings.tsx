import { CloudIcon, Cog8ToothIcon } from "@heroicons/react/24/solid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import TabbedContent from "@/components/common/TabbedContent";

const AdminSettingsPage = () => {
  const { t } = useTranslation("translation", { useSuspense: false });
  const tabs = useMemo(
    () =>
      [
        {
          id: "general",
          label: t("General"),
          icon: Cog8ToothIcon,
          content: <div>General</div>,
        },
        {
          id: "connections",
          label: t("Connections"),
          icon: CloudIcon,
          content: <div>Connections</div>,
        },
      ] as const,
    [t]
  );

  return <TabbedContent tabs={tabs} defaultTab="general" />;
};

export default AdminSettingsPage;
