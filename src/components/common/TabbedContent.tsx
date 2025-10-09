import type React from "react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/time";

type TabLike = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
};

type Props<T extends ReadonlyArray<TabLike>> = {
  tabs: T;
  defaultTab?: T[number]["id"];
  className?: string;
};

function TabbedContent<T extends ReadonlyArray<TabLike>>({ tabs, defaultTab, className }: Props<T>) {
  const [activeTab, setActiveTab] = useState<T[number]["id"] | undefined>(defaultTab ?? tabs[0]?.id);

  const activeContent = useMemo(() => tabs.find((tab) => tab.id === activeTab)?.content, [activeTab, tabs]);

  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-[10rem_1fr]", className)}>
      <div className="flex overflow-x-auto md:flex-col md:overflow-x-visible">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex min-w-fit rounded-lg px-0.5 py-1 outline-none ring-none transition-colors hover:text-foreground",
              activeTab === tab.id ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            <tab.icon className="mr-2 h-4 w-4" />
            <p className="font-medium text-sm">{tab.label}</p>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">{activeContent}</div>
    </div>
  );
}

export default TabbedContent;
