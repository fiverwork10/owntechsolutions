const uploadFile = (file, API, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const uploadUrl = (API.defaults?.baseURL || '') + '/upload/file';
  const token = localStorage.getItem('token');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    let displayedProgress = 0;
    let lastRealProgress = 0;
    let lastProgressTime = Date.now();
    let simTimer = null;

    const updateProgress = (pct) => {
      displayedProgress = pct;
      if (onProgress) onProgress(pct);
    };

    const startSimulatedProgress = () => {
      if (simTimer) return;
      simTimer = setInterval(() => {
        const elapsed = Date.now() - lastProgressTime;
        if (elapsed > 2000 && displayedProgress < 95) {
          const step = Math.max(1, Math.round((100 - displayedProgress) / 20));
          updateProgress(Math.min(displayedProgress + step, 95));
        }
      }, 800);
    };

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        lastRealProgress = Math.round((e.loaded / e.total) * 100);
        lastProgressTime = Date.now();
        if (lastRealProgress > displayedProgress) {
          updateProgress(lastRealProgress);
        }
        if (lastRealProgress >= 100 && simTimer) {
          clearInterval(simTimer);
          simTimer = null;
        }
        if (lastRealProgress > 0 && lastRealProgress < 100) {
          startSimulatedProgress();
        }
      }
    };

    xhr.onload = () => {
      if (simTimer) clearInterval(simTimer);
      updateProgress(100);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch { reject(new Error('Failed to parse upload response')); }
      } else {
        try {
          reject(new Error(JSON.parse(xhr.responseText).error?.message || 'Upload failed'));
        } catch { reject(new Error('Upload failed')); }
      }
    };

    xhr.onerror = () => {
      if (simTimer) clearInterval(simTimer);
      reject(new Error('Network error during upload'));
    };
    xhr.ontimeout = () => {
      if (simTimer) clearInterval(simTimer);
      reject(new Error('Upload timed out'));
    };

    xhr.timeout = 600000;
    xhr.send(formData);
  });
};

const openWidget = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!window.cloudinary) {
      reject(new Error('Cloudinary Upload Widget not loaded'));
      return;
    }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: options.cloudName || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dvyaqmxtg',
        uploadPreset: options.uploadPreset || process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'owntechsolutions_unsigned',
        folder: options.folder || 'owntechsolutions',
        maxFileSize: options.maxFileSize || 1048576000,
        multiple: options.multiple || false,
        showPoweredBy: false,
        styles: {
          palette: {
            window: '#0A0A0A',
            windowBorder: '#1E1E1E',
            tabIcon: '#8B5CF6',
            menuIcons: '#8B5CF6',
            textDark: '#FFFFFF',
            textLight: '#FFFFFF',
            link: '#8B5CF6',
            action: '#8B5CF6',
            inactiveTabIcon: '#6B7280',
            error: '#EF4444',
            inProgress: '#8B5CF6',
            complete: '#10B981',
            sourceBg: '#1A1A1A',
            video: '#8B5CF6',
          },
          fonts: { default: null },
        },
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (result.event === 'success') {
          resolve({
            url: result.info.secure_url,
            publicId: result.info.public_id,
            bytes: result.info.bytes,
          });
        } else if (result.event === 'close') {
          reject(new Error('Upload cancelled'));
        }
      }
    );
    widget.open();
  });
};

export { uploadFile, openWidget };
