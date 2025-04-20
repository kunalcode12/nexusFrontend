import { createContext, useContext, useState } from "react";

const TabsContext = createContext();

export const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }) => {
  return (
    <div className={`flex space-x-1 p-1 ${className}`} role="tablist">
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className, onClick }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);

  const handleClick = () => {
    setActiveTab(value);
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`
        px-3 py-1.5 
        text-sm font-medium
        rounded-md
        transition-colors duration-200
        hover:bg-gray-100
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${
          activeTab === value
            ? "bg-blue-500 text-white"
            : "text-gray-700 bg-white"
        }
        ${className}
      `}
      role="tab"
      aria-selected={activeTab === value}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div>{children}</div>;
};
