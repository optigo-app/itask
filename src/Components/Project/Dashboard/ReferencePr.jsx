import React, { useState, useMemo, useEffect } from "react";
import "./Styles/ReferencePr.scss";
import placeholderImg from "../../../Assests/Attachment.webp";
import {
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Collapse,
    Grid,
    Card,
    CardMedia,
    CardContent,
    IconButton,
    Avatar,
    Link
} from "@mui/material";
import { ImageUrl, transformAttachments } from "../../../Utils/globalfun";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Link as Linkicons } from 'lucide-react';
import pdfIcon from '../../../Assests/pdf.png';
import sheetIcon from '../../../Assests/xls.png';
import Document from '../../../Assests/document.png'

const ReferencePr = ({ Loading, background, refferenceData = [], decodedData }) => {
    const [expanded, setExpanded] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState("");
    const [reffData, setReffData] = useState([]);

    const groupedByProjectId = refferenceData.reduce((acc, item) => {
        const { projectid } = item;
        if (!acc[projectid]) {
            acc[projectid] = [];
        }
        acc[projectid].push(item);
        return acc;
    }, {});

    useEffect(() => {
        const filteredProjectData = groupedByProjectId[decodedData?.projectid];

        const transformedData = filteredProjectData?.map(item => {
            const parseFiles = (value) => {
                if (!value) return [];

                return value.split(',').map(url => {
                    const trimmedUrl = url.trim();
                    const parts = trimmedUrl.split('/');
                    const filename = parts[parts.length - 1] || '';
                    const extension = filename.split('.').pop()?.toLowerCase();
                    const filetype = extension?.match(/jpg|jpeg|png|gif/i) ? 'image' : 'other';

                    return {
                        url: trimmedUrl,
                        filename,
                        extension,
                        filetype
                    };
                });
            };

            return {
                ...item,
                DocumentName: parseFiles(item.DocumentName),
                DocumentUrl: parseFiles(item.DocumentUrl)
            };
        });

        setReffData(transformedData);
    }, []);




    const uniqueFolders = useMemo(() => {
        const seen = new Set();
        return reffData?.filter(item => {
            if (!item?.foldername || seen.has(item.foldername)) return false;
            seen.add(item.foldername);
            return true;
        });
    }, [reffData]);

    useEffect(() => {
        if (uniqueFolders?.length > 0) {
            setSelectedFolder(uniqueFolders[0]?.foldername);
        }
    }, [uniqueFolders]);



    const handleRowExpand = (index) => {
        setExpanded(expanded === index ? null : index);
    };

    const filteredData = useMemo(() => {
        return reffData?.filter(item => item.foldername === selectedFolder);
    }, [reffData, selectedFolder]);

    const getFilePreviewIcon = (extension) => {
        switch (extension?.toLowerCase()) {
            case 'xlsx':
            case 'xls':
                return sheetIcon;
            case 'pdf':
                return pdfIcon;
            default:
                return Document;
        }
    };


    return (
        <div className="ref_MainDiv">
            {Loading && (
                <div className="ref_Loading">
                    <div className="ref_LoadingInner">
                        <Typography variant="h6">Loading...</Typography>
                    </div>
                </div>
            )}
            {filteredData ? (
                <>
                    <Box className="fileSideBarTDBox" mb={2}>
                        <ToggleButtonGroup
                            value={selectedFolder}
                            exclusive
                            onChange={(e, value) => value && setSelectedFolder(value)}
                            className="toggle-group"
                        >
                            {uniqueFolders?.map((folder) => (
                                <ToggleButton
                                    className="toggle-button"
                                    key={folder.foldername}
                                    value={folder.foldername}
                                >
                                    {folder.foldername}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell width={10} />
                                    <TableCell>Task Name</TableCell>
                                    <TableCell>Folder Name</TableCell>
                                    <TableCell>Uploaded By</TableCell>
                                    <TableCell>Upload Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData?.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <TableRow onClick={() => handleRowExpand(index)}>
                                            <TableCell width={10}>
                                                <IconButton onClick={() => handleRowExpand(index)} size="small">
                                                    <PlayArrowIcon
                                                        style={{
                                                            color: expanded === index ? "#444050" : "#c7c7c7",
                                                            fontSize: "1rem",
                                                            transform: expanded === index ? "rotate(90deg)" : "rotate(0deg)",
                                                            transition: "transform 0.2s ease-in-out",
                                                        }}
                                                    />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{item.taskname}</TableCell>
                                            <TableCell>{item.foldername}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Avatar
                                                        src={ImageUrl(item?.guest)}
                                                        alt={item?.guest?.firstname}
                                                        sx={{ width: 28, height: 28 }}
                                                    />
                                                    <Typography variant="body2">
                                                        {item?.guest?.firstname} {item?.guest?.lastname}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{item.entrydate}</TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
                                                <Collapse in={expanded === index} timeout="auto" unmountOnExit>
                                                    <Box margin={1}>
                                                        <Grid container spacing={2} className="collapse-grid">
                                                            {/* Render from DocumentName */}
                                                            {item.DocumentName?.map((doc, docIndex) => (
                                                                <Grid item xs={12} sm={6} md={3} key={`docname-${docIndex}`}>
                                                                    <Card className="reference-card">
                                                                        {doc.filetype === 'image' ? (
                                                                            <CardMedia
                                                                                component="img"
                                                                                height="140"
                                                                                image={doc.url || placeholderImg}
                                                                                alt={`Document ${docIndex + 1}`}
                                                                            />
                                                                        ) : (
                                                                            <Box
                                                                                component="img"
                                                                                src={getFilePreviewIcon(doc.extension)}
                                                                                alt="File icon"
                                                                                sx={{
                                                                                    height: 120,
                                                                                    width: 'auto',
                                                                                    objectFit: 'contain',
                                                                                    display: 'block',
                                                                                    mx: 'auto',
                                                                                    mt: 2,
                                                                                    filter: doc.filetype === 'image' ? 'none' : 'opacity(0.6)',
                                                                                }}
                                                                            />
                                                                        )}
                                                                        <CardContent sx={{ textAlign: 'center' }}>
                                                                            <Link
                                                                                href={doc.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                underline="hover"
                                                                            >
                                                                                {doc.filename}
                                                                            </Link>
                                                                        </CardContent>
                                                                    </Card>
                                                                </Grid>
                                                            ))}

                                                            {/* Render from DocumentUrl */}
                                                            {item.DocumentUrl?.map((doc, docIndex) => (
                                                                <Grid item xs={12} sm={6} md={3} key={`docurl-${docIndex}`}>
                                                                    <Card className="reference-card">
                                                                        <CardContent sx={{ textAlign: 'center' }}>
                                                                            <Box
                                                                                sx={{
                                                                                    display: "flex",
                                                                                    justifyContent: "center",
                                                                                    alignItems: "center",
                                                                                    height: 120,
                                                                                    pt: 2
                                                                                }}
                                                                            >
                                                                                <Linkicons size={48} sx={{ color: "#666" }} />
                                                                            </Box>
                                                                            <Link
                                                                                href={doc.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                underline="hover"
                                                                            >
                                                                                {doc.url}
                                                                            </Link>
                                                                        </CardContent>
                                                                    </Card>
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            ) : (
                <Box className="noHistoryBox">
                    <Linkicons className="emptyImg" color="#6D6B77" />
                    <Typography>No Reference Found!</Typography>
                    <Typography></Typography>
                </Box>
            )}
        </div>
    );
};

export default ReferencePr;
