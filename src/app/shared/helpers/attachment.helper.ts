export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface FileIcon {
  icon: string;
  color: string;
}

export function getFileIconByType(typeOrName: string): FileIcon {
  const lower = typeOrName.toLowerCase();

  if (lower.includes('pdf') || lower.endsWith('.pdf')) {
    return { icon: 'bi-file-earmark-pdf-fill', color: '#e74c3c' };
  }
  if (
    lower.includes('word') ||
    lower.endsWith('.doc') ||
    lower.endsWith('.docx')
  ) {
    return { icon: 'bi-file-earmark-word-fill', color: '#2980b9' };
  }
  if (
    lower.includes('excel') ||
    lower.endsWith('.xls') ||
    lower.endsWith('.xlsx')
  ) {
    return { icon: 'bi-file-earmark-excel-fill', color: '#27ae60' };
  }
  if (
    lower.includes('ppt') ||
    lower.endsWith('.ppt') ||
    lower.endsWith('.pptx')
  ) {
    return { icon: 'bi-file-earmark-slides-fill', color: '#d35400' };
  }
  if (
    lower.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(lower)
  ) {
    return { icon: 'bi-file-earmark-image-fill', color: '#f39c12' };
  }
  if (lower.startsWith('video/') || /\.(mp4|avi|mov|wmv|mkv)$/.test(lower)) {
    return { icon: 'bi-file-earmark-play-fill', color: '#8e44ad' };
  }
  if (lower.startsWith('audio/') || /\.(mp3|wav|ogg|flac)$/.test(lower)) {
    return { icon: 'bi-file-earmark-music-fill', color: '#16a085' };
  }
  if (
    lower.endsWith('.zip') ||
    lower.endsWith('.rar') ||
    lower.endsWith('.7z')
  ) {
    return { icon: 'bi-file-earmark-zip-fill', color: '#34495e' };
  }

  return { icon: 'bi-file-earmark-fill', color: '#7f8c8d' }; // default
}
