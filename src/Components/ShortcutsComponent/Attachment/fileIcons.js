import {
  File,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileImage,
  FileVideo,
  FileArchive,
  FileAudio,
  FileType
} from "lucide-react";

// Mapping of extension → icon component
export const fileIconMap = {
  // Images
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  gif: FileImage,
  webp: FileImage,

  // Videos
  mp4: FileVideo,
  mov: FileVideo,
  avi: FileVideo,
  mkv: FileVideo,
  webm: FileVideo,

  // Audio
  mp3: FileAudio,
  wav: FileAudio,
  flac: FileAudio,

  // PDF
  pdf: FileText,

  // Excel / sheets
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,

  // Word / documents
  doc: FileText,
  docx: FileText,
  txt: FileText,

  // Code files
  js: FileCode,
  jsx: FileCode,
  ts: FileCode,
  tsx: FileCode,
  html: FileCode,
  css: FileCode,
  json: FileCode,

  // Compressed
  zip: FileArchive,
  rar: FileArchive,
  tar: FileArchive,
  gz: FileArchive,
};

// Return icon for extension
export const getFileIcon = (ext) => {
  if (!ext) return File; // default icon
  ext = ext.toLowerCase();

  return fileIconMap[ext] || FileType; // fallback generic icon
};
