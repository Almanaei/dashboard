export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const iconMap = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📎',
    pptx: '📎',
    txt: '📋',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    default: '📁'
  };
  return iconMap[extension] || iconMap.default;
};
