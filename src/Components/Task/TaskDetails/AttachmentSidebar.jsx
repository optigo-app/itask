import React, { useState } from 'react';
import { Box, Button, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CloudDownload } from 'lucide-react';
import AttachmentGrid from '../../ShortcutsComponent/AttachmentGrid';

const AttachmentSidebar = ({ uploadedFile }) => {
    const [selectedFolder, setSelectedFolder] = useState(Object.keys(uploadedFile.attachment || {})[0]);

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        const attachments = uploadedFile?.attachment[selectedFolder] || [];

        attachments.forEach((item) => {
            const fileName = item.fileName;
            const fileUrl = item.url;
            console.log('fileUrl: ', fileUrl);

            fetch(fileUrl)
                .then((response) => response.blob()) // Get the file as a blob
                .then((blob) => {
                    zip.file(fileName, blob); // Add the file to the ZIP with the given file name

                    // Optionally, generate the ZIP file and trigger the download
                    zip.generateAsync({ type: 'blob' })
                        .then((content) => {
                            // Create a download link and trigger it
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(content);
                            link.download = 'attachments.zip'; // Name of the zip file
                            link.click(); // Trigger the download
                        })
                        .catch((err) => {
                            console.error("Error generating ZIP:", err);
                        });
                })
                .catch((error) => {
                    console.error("Error fetching the file:", error);
                });
        });

        // Generate and download the ZIP file
        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, `${selectedFolder}_attachments.zip`);
        });
    };
    return (
        <Box>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'end', mb: 0.2 }}>
                <Box className="fileSideBarTDBox">
                    <ToggleButtonGroup
                        value={selectedFolder}
                        exclusive
                        onChange={(e, value) => value && setSelectedFolder(value)}
                        className="toggle-group"
                    >
                        {Object.keys(uploadedFile.attachment || {}).map((folder) => (
                            <ToggleButton className="toggle-button" key={folder} value={folder}>
                                {folder}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>
                {/* <Button
          variant="text"
          onClick={handleDownloadAll}
          startIcon={<CloudDownload color="#7367f0" size={20} />}
        >
          <Typography sx={{ textTransform: 'capitalize', color: '#7367f0 !important' }}>
            Download All
          </Typography>
        </Button> */}
            </Box>
            <AttachmentGrid uploadedFile={uploadedFile} selectedFolder={selectedFolder} />
        </Box>
    );
};

export default AttachmentSidebar;
