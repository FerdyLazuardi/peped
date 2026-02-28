import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Menu, FileText, X } from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [kbFiles, setKbFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load file list from auto-generated manifest.json
  useEffect(() => {
    fetch('/knowledge_base/manifest.json?t=' + Date.now())
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(names => {
        setKbFiles(names.map(name => ({
          name: name.replace(/\.txt$/i, '.pdf'), // Show as .pdf for UI
          actualName: name,
          path: `/knowledge_base/${name}`
        })));
      })
      .catch(() => setKbFiles([]));
  }, []);

  const handleFileClick = async (file) => {
    setSelectedFile(file);
    setFileContent('');
    setIsLoading(true);
    try {
      const res = await fetch(file.path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const content = await res.text();
      setFileContent(content || 'No readable text content found.');
    } catch (err) {
      console.error('[KB] Error reading file:', err);
      setFileContent('❌ Failed to load text: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedFile(null);
    setFileContent('');
  };

  // Portal ensures modal always renders above everything — including the mobile sidebar
  const modal = selectedFile ? ReactDOM.createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedFile.name}
          </h3>
          <button className="modal-close-btn" onClick={closeModal}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {isLoading ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              <span>&nbsp;Loading content...</span>
            </div>
          ) : (
            fileContent
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className={`sidebar ${isOpen ? '' : 'closed'}`}>
        <div className="sidebar-header">
          <button onClick={toggleSidebar} className="hamburger-btn" title="Close sidebar">
            <Menu size={24} />
          </button>
        </div>

        <div className="knowledge-base-section">
          <div className="kb-title">Knowledge Base</div>

          <div className="file-list">
            {kbFiles.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '10px 5px' }}>
                No files available.
              </div>
            ) : (
              kbFiles.map((file, i) => (
                <div key={i} className="file-item" onClick={() => handleFileClick(file)}>
                  <FileText size={18} color="#ececec" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.name}>
                    {file.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modal}
    </>
  );
}
