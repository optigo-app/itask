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
import LinkIcon from "@mui/icons-material/Link";
import { Link as Linkicons } from "lucide-react";

const ReferencePr = ({ Loading, background, refferenceData = [], decodedData }) => {
    const [expanded, setExpanded] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState("");
    const [reffData, setReffData] = useState([]);
    console.log('reffData: ', reffData);

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
            const documentNameParts = item.DocumentName?.split('/');
            const fileNameWithExt = documentNameParts?.[documentNameParts.length - 1] || '';
            const extension = fileNameWithExt.split('.').pop();
            const filetype = extension?.match(/jpg|jpeg|png|gif/i) ? 'image' : 'other';

            return {
                ...item,
                DocumentName: {
                    url: item.DocumentName,
                    filename: fileNameWithExt,
                    extension: extension,
                    filetype: filetype
                },
                DocumentUrl: {
                    filetype: "other",
                    url: item.DocumentUrl
                }
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
    console.log('filteredData: ', filteredData);

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
                                                            {item.DocumentName.filetype === 'image' && (
                                                                <Grid item xs={12} sm={6} md={3} key={`image-${index}`}>
                                                                    <Card className="reference-card">
                                                                        <CardMedia
                                                                            component="img"
                                                                            height="140"
                                                                            image={item.DocumentName.url || placeholderImg}
                                                                            alt={`Document ${index + 1}`}
                                                                        />
                                                                        <CardContent>
                                                                            <Typography variant="body2">
                                                                                {item.DocumentName.filename}
                                                                            </Typography>
                                                                        </CardContent>
                                                                    </Card>
                                                                </Grid>
                                                            )}

                                                            {item.DocumentUrl.filetype === 'other' && (
                                                                <Grid item xs={12} sm={6} md={3} key={`other-${index}`}>
                                                                    <Card className="reference-card">
                                                                        <Box
                                                                            sx={{
                                                                                display: "flex",
                                                                                justifyContent: "center",
                                                                                alignItems: "center",
                                                                                height: 100,
                                                                                pt: 2
                                                                            }}
                                                                        >
                                                                            <LinkIcon sx={{ fontSize: 48, color: "#666" }} />
                                                                        </Box>
                                                                        <CardContent sx={{ display: "flex", justifyContent: "center" }}>
                                                                            <Link href={item.DocumentUrl.url} target="_blank" rel="noopener noreferrer" underline="hover">
                                                                                {item.DocumentUrl.url}
                                                                            </Link>
                                                                        </CardContent>
                                                                    </Card>
                                                                </Grid>
                                                            )}

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
