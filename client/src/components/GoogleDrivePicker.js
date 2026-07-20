import React, { useState, useEffect, useCallback } from 'react';
import { FiHardDrive, FiCheck, FiX, FiExternalLink, FiRefreshCw, FiVideo, FiSearch, FiFile } from 'react-icons/fi';

export default function GoogleDrivePicker({ API, onSelect, selectedFileId, previewUrl }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [browsing, setBrowsing] = useState(false);
  const [files, setFiles] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [fallbackStream, setFallbackStream] = useState(false);

  useEffect(() => {
    checkStatus();
    const handler = (e) => {
      if (e.data?.type === 'drive-connected') checkStatus();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    if (selectedFileId && previewUrl) {
      setSelectedFile({ id: selectedFileId, url: previewUrl });
    }
  }, [selectedFileId, previewUrl]);

  const checkStatus = async () => {
    try {
      const res = await API.get('/drive/status');
      setConnected(res.data.connected);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    API.get('/drive/auth').then(res => {
      window.open(res.data.url, '_blank', 'width=600,height=700');
    });
  };

  const handleDisconnect = async () => {
    await API.post('/drive/disconnect');
    setConnected(false);
    setSelectedFile(null);
    setFiles([]);
    onSelect(null);
  };

  const handleBrowse = useCallback(async () => {
    setFetching(true);
    setError('');
    try {
      const res = await API.get('/drive/files');
      setFiles(res.data.files || []);
      setBrowsing(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load files');
    } finally {
      setFetching(false);
    }
  }, [API]);

  const handleSelectFile = async (file) => {
    let directUrl = '';
    try {
      const res = await API.get(`/drive/video/${file.id}`);
      directUrl = res.data.directUrl || '';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get video URL');
    }
    const info = { id: file.id, name: file.name, mimeType: file.mimeType, size: file.size, directUrl };
    setSelectedFile(info);
    setVideoError(false);
    setFallbackStream(false);
    setBrowsing(false);
    onSelect(info);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(1)} ${units[i]}`;
  };

  if (loading) return <div className="text-sm text-text-muted animate-pulse">Checking Drive connection...</div>;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiHardDrive size={18} className={connected ? 'text-green-400' : 'text-text-muted'} />
          <span className="text-sm font-medium text-text-secondary">Google Drive</span>
        </div>
        {connected ? (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <FiCheck size={12} /> Connected
          </span>
        ) : (
          <span className="text-xs text-text-muted">Not connected</span>
        )}
      </div>

      {!connected ? (
        <button type="button" onClick={handleConnect}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium transition-all">
          <FiExternalLink size={14} /> Connect Google Drive
        </button>
      ) : (
        <div className="space-y-2">
          {!browsing ? (
            <button type="button" onClick={handleBrowse} disabled={fetching}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium transition-all disabled:opacity-50">
              {fetching ? <FiRefreshCw size={14} className="animate-spin" /> : <FiSearch size={14} />}
              {fetching ? 'Loading...' : 'Browse Drive videos'}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Your Drive videos ({files.length})</span>
                <button type="button" onClick={() => setBrowsing(false)}
                  className="text-xs text-primary hover:underline">Close</button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {error && <p className="text-xs text-red-400 p-2">{error}</p>}
                {files.length === 0 && !error && (
                  <p className="text-xs text-text-muted p-2 text-center">No video files found in Drive</p>
                )}
                {files.map((file) => (
                  <button key={file.id} type="button" onClick={() => handleSelectFile(file)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all hover:bg-white/10 ${
                      selectedFile?.id === file.id ? 'bg-primary/20 border border-primary/30' : 'border border-transparent'
                    }`}>
                    <FiVideo size={16} className="text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-secondary truncate">{file.name}</p>
                      <p className="text-[10px] text-text-muted">{formatSize(file.size)}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button type="button" onClick={handleBrowse} disabled={fetching}
                className="w-full flex items-center justify-center gap-1 text-xs text-primary hover:underline">
                <FiRefreshCw size={10} /> Refresh
              </button>
            </div>
          )}

          {selectedFile && !browsing && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FiVideo size={14} className="text-primary shrink-0" />
                  <span className="text-xs text-text-secondary truncate">{selectedFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {videoError && (
                    <button type="button" onClick={() => { setFallbackStream(true); setVideoError(false); }}
                      className="text-xs text-primary hover:underline">Retry with stream</button>
                  )}
                  <button type="button" onClick={() => { setSelectedFile(null); onSelect(null); }}
                    className="shrink-0 p-1 rounded hover:bg-white/10">
                    <FiX size={12} className="text-text-muted" />
                  </button>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden bg-black/50">
                <video key={selectedFile.id + (fallbackStream ? '-stream' : '')}
                  src={fallbackStream || !selectedFile.directUrl ? `/api/drive/video/${selectedFile.id}/stream` : selectedFile.directUrl}
                  controls className="w-full max-h-48 object-contain"
                  onError={() => setVideoError(true)} />
                {videoError && (
                  <div className="text-xs text-red-400 p-2 text-center">
                    Video failed to load. {!fallbackStream && 'Click "Retry with stream" to try server proxy.'}
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="button" onClick={handleDisconnect}
            className="w-full text-xs text-text-muted hover:text-red-400 transition-colors">
            Disconnect Drive
          </button>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 2px; }
      `}</style>
    </div>
  );
}
