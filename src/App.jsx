import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      {/* Backdrop: tapping it on mobile closes the sidebar */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={toggleSidebar} />}
      <ChatArea isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  );
}

export default App;
