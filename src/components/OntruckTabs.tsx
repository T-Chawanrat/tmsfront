import React, { useState, useEffect, useRef } from "react";
import OntruckStd from "../pages/Ontruck/OntruckStd";
import OntruckOutbound from "../pages/Ontruck/OntruckOutbound";
import OntruckInbound from "../pages/Ontruck/OntruckInbound";
import OntruckWh from "../pages/Ontruck/OntruckWh";

interface OntruckTabs {
  id: number;
  title: string;
  content: React.ReactNode;
}

const OntruckTabs: React.FC = () => {
  const [tabs] = useState<OntruckTabs[]>([
    { id: 1, title: "ทั้งหมด", content: <OntruckStd /> },
    { id: 2, title: "กทม. - ตจว.", content: <OntruckOutbound /> },
    { id: 3, title: "ตจว. - กทม.", content: <OntruckInbound /> },
    { id: 4, title: "ตจว. - ตจว.", content: <OntruckWh /> },
  ]);
  const [activeTabId, setActiveTabId] = useState<number>(1);
  const [underlineStyle, setUnderlineStyle] = useState({
    left: "0px",
    width: "0px",
  });
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const selectTab = (id: number) => {
    setActiveTabId(id);
  };

  useEffect(() => {
    // Update underline position and width based on the active tab
    const tabsContainer = tabsContainerRef.current;
    if (tabsContainer) {
      const activeTab = tabsContainer.querySelector<HTMLDivElement>(`[data-id="${activeTabId}"]`);
      if (activeTab) {
        setUnderlineStyle({
          left: `${activeTab.offsetLeft}px`,
          width: `${activeTab.offsetWidth}px`,
        });
      }
    }
  }, [activeTabId]);

  return (
    <div className="w-full font-thai">
      {/* Tab Headers */}
      <div className="relative" ref={tabsContainerRef}>
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              data-id={tab.id}
              className={`px-4 py-2 cursor-pointer text-sm font-medium ${
                activeTabId === tab.id ? "text-brand-600" : "text-gray-600 hover:text-brand-600"
              }`}
              onClick={() => selectTab(tab.id)}
            >
              {tab.title}
            </div>
          ))}
        </div>

        {/* Animated Underline */}
        <div
          className="absolute bottom-0 h-0.5 bg-brand-600 transition-all duration-300 ease-in-out"
          style={{
            left: underlineStyle.left,
            width: underlineStyle.width,
          }}
        />
      </div>

      {/* Tab Content */}
      <div className="p-2 border border-gray-200 bg-white">
        {tabs.find((tab) => tab.id === activeTabId)?.content || "No active tab"}
      </div>

    
    </div>
  );
};

export default OntruckTabs;
