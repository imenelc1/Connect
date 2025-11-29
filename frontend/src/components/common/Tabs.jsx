export default function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "recent", label: "Recent" },
    { id: "popular", label: "Popular" },
    { id: "myforums", label: "My forums" }
  ];

  return (
    <div className="flex gap-3 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            px-5 py-2 rounded-full transition-all shadow 
            ${activeTab === tab.id
              ? "bg-blue text-white"
              : "bg-surface text-textc border border-grayc/20"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
