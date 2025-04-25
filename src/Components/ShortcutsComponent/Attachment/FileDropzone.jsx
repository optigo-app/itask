import React from 'react';
import { useDropzone } from 'react-dropzone';
import './FileDropzone.scss';
import { Upload } from 'lucide-react';

const FileDropzone = ({onDrop}) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    return (
        <div className="dropzone-container">
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <div className="upload-content">
                    <Upload  className="upload-icon" />
                    <p className="upload-text">Drop files here or click to upload</p>
                </div>
            </div>
        </div>
    );
};

export default FileDropzone;
