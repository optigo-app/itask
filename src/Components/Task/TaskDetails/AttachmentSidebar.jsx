import React, { useEffect, useState } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AttachmentGrid from '../../ShortcutsComponent/AttachmentGrid';
import attachment from "../../../Assests/document.png"

const AttachmentSidebar = ({ uploadedFile, isAtttLoading }) => {
    const [selectedFolder, setSelectedFolder] = useState('');

    useEffect(() => {
        if (uploadedFile?.attachment && Object.keys(uploadedFile.attachment).length > 0) {
            setSelectedFolder(Object.keys(uploadedFile.attachment)[0]);
        }
    }, [uploadedFile]);

    const hasNoData = !uploadedFile || !uploadedFile.attachment || Object.keys(uploadedFile.attachment).length === 0;
    const hasNoUrl = !uploadedFile || !uploadedFile.url || Object.keys(uploadedFile.url).length === 0;
    console.log('hasNoData: ', hasNoData, hasNoUrl);

    return (
        <>
            {!isAtttLoading && hasNoData && hasNoUrl ? (
                <Box className="noHistoryBox">
                    <img src={attachment} alt="empty" className="emptyImg" />
                    <Typography>No attachments found!</Typography>
                    <Typography>Start uploading files or adding reference links to keep everything organized in one place.</Typography>

                </Box>
            ) : (
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
                    </Box>
                    <AttachmentGrid uploadedFile={uploadedFile} selectedFolder={selectedFolder} />
                </Box>
            )}
        </>
    );
};

export default AttachmentSidebar;
