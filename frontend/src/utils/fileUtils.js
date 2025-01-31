import {
  PictureAsPdf,
  Description,
  Image,
  InsertDriveFile,
  TableChart,
  Slideshow,
  TextSnippet,
  Folder
} from '@mui/icons-material';

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimeType) => {
  // Map MIME types to icons
  if (!mimeType) return InsertDriveFile;

  const mimeTypeLower = mimeType.toLowerCase();
  
  if (mimeTypeLower.includes('pdf')) {
    return PictureAsPdf;
  }
  if (mimeTypeLower.includes('word') || mimeTypeLower.includes('doc')) {
    return Description;
  }
  if (mimeTypeLower.includes('sheet') || mimeTypeLower.includes('excel')) {
    return TableChart;
  }
  if (mimeTypeLower.includes('presentation') || mimeTypeLower.includes('powerpoint')) {
    return Slideshow;
  }
  if (mimeTypeLower.includes('text')) {
    return TextSnippet;
  }
  if (mimeTypeLower.includes('image')) {
    return Image;
  }
  
  return InsertDriveFile;
};
