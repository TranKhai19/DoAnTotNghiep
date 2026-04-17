import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import './MediaUploader.css';

// Helpers
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('video')) return '🎬';
  return '📎';
};

const isImageType = (fileType) => fileType.startsWith('image/');

/**
 * MediaUploader – Component upload file/ảnh đầy đủ
 *
 * Props:
 *   bucket       {string}   – Supabase Storage bucket name  (default: 'campaign-media')
 *   folder       {string}   – Sub-folder in bucket          (default: 'uploads')
 *   accept       {string}   – Input accept string           (default: 'image/*,application/pdf')
 *   maxSizeMB    {number}   – Max file size in MB           (default: 5)
 *   multiple     {boolean}  – Allow multiple files          (default: false)
 *   onUploadComplete {fn}   – Called with (url | url[])    – single URL or array
 *   label        {string}   – Label shown above zone        (optional)
 */
const MediaUploader = ({
  bucket = 'campaign-media',
  folder = 'uploads',
  accept = 'image/*,application/pdf',
  maxSizeMB = 5,
  multiple = false,
  onUploadComplete,
  label,
}) => {
  const [fileItems, setFileItems] = useState([]); // [{id, file, preview, progress, status, url, error}]
  const [isDragging, setIsDragging] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const inputRef = useRef(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // ── Validate file ──────────────────────────────────────────────────────────────
  const validateFile = (file) => {
    if (file.size > maxSizeBytes)
      return `"${file.name}" vượt quá giới hạn ${maxSizeMB}MB (hiện tại: ${formatBytes(file.size)})`;

    const allowedTypes = accept.split(',').map(t => t.trim());
    const matchesType = allowedTypes.some(allowedType => {
      if (allowedType.endsWith('/*')) {
        const baseType = allowedType.split('/')[0];
        return file.type.startsWith(baseType + '/');
      }
      return file.type === allowedType;
    });

    if (!matchesType)
      return `"${file.name}" không đúng định dạng được phép.`;

    return null;
  };

  // ── Build file item object ─────────────────────────────────────────────────────
  const buildItem = (file) => ({
    id: `${file.name}-${Date.now()}-${Math.random()}`,
    file,
    preview: isImageType(file.type) ? URL.createObjectURL(file) : null,
    progress: 0,
    status: 'pending', // pending | uploading | done | error
    url: null,
    error: null,
  });

  // ── Add files to queue and kick off upload ─────────────────────────────────────
  const addFiles = useCallback(
    async (rawFiles) => {
      setGlobalError('');
      const toProcess = multiple ? Array.from(rawFiles) : [rawFiles[0]];

      // If single mode and already has items, replace
      if (!multiple) {
        setFileItems(prev => {
          prev.forEach(item => {
            if (item.preview) URL.revokeObjectURL(item.preview);
          });
          return [];
        });
      }

      const newItems = [];
      for (const file of toProcess) {
        const err = validateFile(file);
        if (err) {
          setGlobalError(err);
          continue;
        }
        newItems.push(buildItem(file));
      }

      if (newItems.length === 0) return;

      setFileItems(prev => multiple ? [...prev, ...newItems] : newItems);
      // Upload each in sequence
      for (const item of newItems) {
        await uploadFile(item);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bucket, folder, multiple, maxSizeBytes, accept]
  );

  // ── Upload to Supabase Storage ─────────────────────────────────────────────────
  const uploadFile = async (item) => {
    const { id, file } = item;
    const ext = file.name.split('.').pop();
    const safeBase = file.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
    const filePath = `${folder}/${safeBase}_${Date.now()}.${ext}`;

    // Mark as uploading
    setFileItems(prev =>
      prev.map(i => i.id === id ? { ...i, status: 'uploading', progress: 10 } : i)
    );

    // Simulate early progress (Supabase JS doesn't expose progress natively)
    const progressInterval = setInterval(() => {
      setFileItems(prev =>
        prev.map(i => {
          if (i.id !== id || i.progress >= 80) return i;
          return { ...i, progress: Math.min(i.progress + 15, 80) };
        })
      );
    }, 300);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: false, cacheControl: '3600' });

    clearInterval(progressInterval);

    if (uploadError) {
      setFileItems(prev =>
        prev.map(i =>
          i.id === id
            ? { ...i, status: 'error', error: uploadError.message, progress: 100 }
            : i
        )
      );
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    setFileItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, status: 'done', progress: 100, url: publicUrl } : i
      )
    );

    // Notify parent
    if (onUploadComplete) {
      if (multiple) {
        // Collect all done URLs + this new one
        setFileItems(current => {
          const doneUrls = current
            .map(i => (i.id === id ? publicUrl : i.url))
            .filter(Boolean);
          onUploadComplete(doneUrls);
          return current;
        });
      } else {
        onUploadComplete(publicUrl);
      }
    }
  };

  // ── Remove file item ───────────────────────────────────────────────────────────
  const removeItem = (id) => {
    setFileItems(prev => {
      const removed = prev.find(i => i.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      const next = prev.filter(i => i.id !== id);

      // Notify parent about updated URL list
      if (onUploadComplete) {
        if (multiple) {
          onUploadComplete(next.filter(i => i.url).map(i => i.url));
        } else {
          onUploadComplete(null);
        }
      }
      return next;
    });
  };

  // ── Copy URL to clipboard ──────────────────────────────────────────────────────
  const copyUrl = async (id, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* fallback */
    }
  };

  // ── Drag events ────────────────────────────────────────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };
  const handleInputChange = (e) => {
    if (e.target.files.length) addFiles(e.target.files);
    e.target.value = '';
  };

  // ── Determine accepted types for hint tags ─────────────────────────────────────
  const hintTags = accept
    .split(',')
    .map(t => t.trim())
    .map(t => {
      if (t === 'image/*') return ['JPG', 'PNG', 'WEBP', 'GIF'];
      if (t === 'application/pdf') return ['PDF'];
      if (t.startsWith('.')) return [t.toUpperCase()];
      return [t.split('/')[1]?.toUpperCase()].filter(Boolean);
    })
    .flat()
    .slice(0, 6);

  const hasDoneItem = fileItems.some(i => i.status === 'done');
  const singleDoneItem = !multiple && fileItems[0]?.status === 'done' ? fileItems[0] : null;

  return (
    <div className="media-uploader">
      {label && <label className="admin-label">{label}</label>}

      {/* ── Drop Zone ── */}
      {(!singleDoneItem) && (
        <div
          className={`media-uploader__dropzone ${isDragging ? 'is-dragging' : ''} ${globalError ? 'has-error' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Upload file zone"
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />

          <div className="media-uploader__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>

          <p className="media-uploader__title">
            {isDragging ? '📂 Thả file vào đây!' : 'Kéo & thả file vào đây'}
          </p>
          <p className="media-uploader__subtitle">
            hoặc <span>nhấp để chọn file</span>
          </p>

          <p className="media-uploader__hint">
            {hintTags.map(tag => (
              <span key={tag} className="media-uploader__hint-tag">{tag}</span>
            ))}
            <span className="media-uploader__hint-tag">≤ {maxSizeMB}MB</span>
          </p>
        </div>
      )}

      {/* ── Global Error ── */}
      {globalError && (
        <div className="media-uploader__error">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {globalError}
        </div>
      )}

      {/* ── Single Preview (image, after done) ── */}
      {singleDoneItem && isImageType(singleDoneItem.file.type) && (
        <div className="media-uploader__single-preview">
          <img src={singleDoneItem.preview || singleDoneItem.url} alt="preview" />
          <div className="media-uploader__single-preview-overlay">
            <button
              type="button"
              className="media-uploader__preview-action-btn view"
              onClick={() => window.open(singleDoneItem.url, '_blank')}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              Xem ảnh
            </button>
            <button
              type="button"
              className="media-uploader__preview-action-btn remove"
              onClick={() => removeItem(singleDoneItem.id)}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
              Thay ảnh
            </button>
          </div>
        </div>
      )}

      {/* ── File Queue ── */}
      {fileItems.length > 0 && (multiple || (!multiple && fileItems[0]?.status !== 'done') || (singleDoneItem && !isImageType(singleDoneItem.file.type))) && (
        <div className="media-uploader__queue">
          {fileItems.map(item => (
            <FileItem
              key={item.id}
              item={item}
              onRemove={removeItem}
              onCopy={copyUrl}
              isCopied={copiedId === item.id}
            />
          ))}
        </div>
      )}

      {/* ── Add more button (multiple mode, after first upload) ── */}
      {multiple && hasDoneItem && (
        <button
          type="button"
          className="btn btn-outline"
          style={{ marginTop: 12, fontSize: 13, padding: '8px 18px' }}
          onClick={() => inputRef.current?.click()}
        >
          + Thêm file khác
        </button>
      )}
    </div>
  );
};

// ── Sub-component: One file item row ──────────────────────────────────────────
const FileItem = ({ item, onRemove, onCopy, isCopied }) => {
  const { id, file, preview, progress, status, url, error } = item;

  const progressLabel =
    status === 'uploading' ? `Đang tải lên... ${progress}%` :
    status === 'done'      ? 'Hoàn thành' :
    status === 'error'     ? 'Lỗi tải lên' :
    'Đang chuẩn bị...';

  return (
    <div className="media-uploader__file-item">
      {/* Thumbnail */}
      {preview ? (
        <div className="media-uploader__thumb">
          <img src={preview} alt={file.name} />
        </div>
      ) : (
        <div className="media-uploader__thumb-icon">
          {getFileIcon(file.type)}
        </div>
      )}

      {/* Info + Progress */}
      <div className="media-uploader__file-info">
        <div className="media-uploader__file-name" title={file.name}>{file.name}</div>
        <div className="media-uploader__file-size">{formatBytes(file.size)}</div>

        {(status === 'uploading' || status === 'pending') && (
          <div className="media-uploader__progress-wrap">
            <div className="media-uploader__progress-track">
              <div
                className="media-uploader__progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="media-uploader__progress-text">
              <span>{progressLabel}</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        {status === 'done' && url && (
          <div className="media-uploader__link-row">
            <input
              className="media-uploader__link-input"
              type="text"
              value={url}
              readOnly
              onClick={(e) => e.target.select()}
            />
            <button
              type="button"
              className={`media-uploader__copy-btn ${isCopied ? 'copied' : ''}`}
              onClick={() => onCopy(id, url)}
            >
              {isCopied ? (
                <>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Đã chép
                </>
              ) : (
                <>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy URL
                </>
              )}
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ fontSize: 12, color: '#e53e3e', marginTop: 4 }}>
            ⚠️ {error || 'Tải lên thất bại. Vui lòng thử lại.'}
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="media-uploader__status">
        <span className={`media-uploader__status-badge ${status === 'done' ? 'done' : status === 'error' ? 'error' : 'uploading'}`}>
          {status === 'uploading' || status === 'pending' ? (
            <><div className="media-uploader__spinner" /> Đang tải</>
          ) : status === 'done' ? (
            <>
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Xong
            </>
          ) : (
            <>✕ Lỗi</>
          )}
        </span>

        <button
          type="button"
          className="media-uploader__remove-btn"
          onClick={() => onRemove(id)}
          title="Xóa file này"
          aria-label="Xóa file"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MediaUploader;
