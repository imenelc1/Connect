import Button from "./Button";

export default function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "recent", label: "Recent" },
    { id: "popular", label: "Popular" },
    { id: "myforums", label: "My forums" }
  ];

  return (
    <div className="flex justify-center gap-3 mb-6">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          text={tab.label}
          onClick={() => setActiveTab(tab.id)}
          variant={activeTab === tab.id ? "tabActive" : "tab"}
          className="!w-auto"
        />
      ))}
    </div>
  );
}
