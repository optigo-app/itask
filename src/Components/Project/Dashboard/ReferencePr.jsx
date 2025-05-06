import React, { useState, useMemo } from "react";
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
import { ImageUrl } from "../../../Utils/globalfun";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LinkIcon from "@mui/icons-material/Link";

const ReferencePr = ({ Loading, background, refferenceData = [] }) => {
    console.log('refferenceData: ', refferenceData);
    const uniqueFolders = useMemo(() => {
        const seen = new Set();
        return refferenceData.filter(item => {
            if (!item?.foldername || seen.has(item.foldername)) return false;
            seen.add(item.foldername);
            return true;
        });
    }, [refferenceData]);

    const [selectedFolder, setSelectedFolder] = useState(uniqueFolders[0]?.foldername || "");
    const [expanded, setExpanded] = useState(null);

    const handleRowExpand = (index) => {
        setExpanded(expanded === index ? null : index);
    };

    const filteredData = useMemo(() => {
        return refferenceData.filter(item => item.foldername === selectedFolder);
    }, [refferenceData, selectedFolder]);

    return (
        <div className="ref_MainDiv">
            <Box className="fileSideBarTDBox" mb={2}>
                <ToggleButtonGroup
                    value={selectedFolder}
                    exclusive
                    onChange={(e, value) => value && setSelectedFolder(value)}
                    className="toggle-group"
                >
                    {uniqueFolders.map((folder) => (
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
                            <TableCell width={30}/>
                            <TableCell>Task Name</TableCell>
                            <TableCell>Folder Name</TableCell>
                            <TableCell>Uploaded By</TableCell>
                            <TableCell>Upload Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((item, index) => (
                            <React.Fragment key={index}>
                                <TableRow>
                                    <TableCell width={30}>
                                        <IconButton onClick={() => handleRowExpand(index)} size="small">
                                            {expanded === index ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
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
                                                    {(item.DocumentName?.split(",") || []).map((doc, i) => (
                                                        <Grid item xs={12} sm={6} md={3} key={`doc-${i}`}>
                                                            <Card className="reference-card">
                                                                <CardMedia
                                                                    component="img"
                                                                    height="140"
                                                                    image={doc || placeholderImg}
                                                                    alt={`Document ${i + 1}`}
                                                                />
                                                                <CardContent>
                                                                    <Typography variant="body2">Image File</Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                                    {(item.DocumentUrl?.split(",") || []).map((url, i) => (
                                                        <Grid item xs={12} sm={6} md={3} key={`url-${i}`}>
                                                            <Card className="reference-card">
                                                                <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                    <LinkIcon />
                                                                    <Link href={url} target="_blank" rel="noopener noreferrer">
                                                                        {url}
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
        </div>
    );
};

export default ReferencePr;
