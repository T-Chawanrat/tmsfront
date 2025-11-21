import React, { useState, useEffect, useRef } from "react";
import ReceiveNoImage from "../pages/NoImage/ReceiveNoImage";
import MissingV2 from "../pages/NoImage/MissingV2";
import ImageV1 from "../pages/NoImage/ImageV1";

interface NoImageTabs {
  id: number;
  title: string;
  content: React.ReactNode;
}

const NoImageTabs: React.FC = () => {
  const [tabs] = useState<NoImageTabs[]>([
    { id: 1, title: "ไม่มีรูป 1 วัน", content: <ReceiveNoImage /> },
    { id: 2, title: "บิลวันที่xxไม่มีรูป", content: <ImageV1 /> },
    { id: 3, title: "ปิดบิลวันที่xxไม่มีรูป", content: <MissingV2 /> },
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
      const activeTab = tabsContainer.querySelector<HTMLDivElement>(
        `[data-id="${activeTabId}"]`
      );
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
                activeTabId === tab.id
                  ? "text-brand-600"
                  : "text-gray-600 hover:text-brand-600"
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

export default NoImageTabs;
