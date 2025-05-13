import React from 'react';
import { useDropzone } from 'react-dropzone';
import './FileDropzone.scss';
import { Upload } from 'lucide-react';

const FileDropzone = ({ onDrop }) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open
  } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    noKeyboard: false 
  });

  return (
    <div className="dropzone-container">
      <div
        {...getRootProps({
          className: `dropzone ${isDragActive ? 'active' : ''}`,
          tabIndex: 0 
        })}
      >
        <input {...getInputProps()} />
        <div className="upload-content">
          <Upload className="upload-icon" />
          <p className="upload-text">Drop files here or</p>
          <button
            type="button"
            onClick={open}
            className="browse-button"
          >
            Browse Files
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileDropzone;
