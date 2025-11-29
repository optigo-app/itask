import { Package, UserCheck, UserX, Clock, Settings, Layers, Star } from 'lucide-react';
import { Card, CardContent, Box, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import useSafeRedirect from '../../Utils/useSafeRedirect';

export default function SummaryDashboard() {
    const navigate = useSafeRedirect();
    const iconMapping = {
        "Favorite Tasks": Star,
        "Services Tasks": Package,
        "R&D Tasks": Layers,
        "UpComming Tasks": UserCheck,
        "Unassigned Tasks": UserX,
        "Maintenance Tasks": Settings,
        "Due": Clock
    };

    const metrics = [
        {
            title: "Favorite Tasks",
            value: 15,
            newTasks: 3,
            icon: iconMapping["Favorite Tasks"],
            color: "#FFB900", // Warmer yellow
            bgColor: "#FFF9E6", // Light warm yellow background
            borderColor: "#FFD700", // Yellow border
        },
        {
            title: "Services Tasks",
            value: 15,
            newTasks: 3,
            icon: iconMapping["Services Tasks"],
            color: "#3B82F6", // Blue
            bgColor: "#EFF6FF", // Light Blue
            borderColor: "#BEE3F8", // Light Blue
        },
        {
            title: "R&D Tasks",
            value: 243,
            newTasks: 12,
            icon: iconMapping["R&D Tasks"],
            color: "#10B981", // Green
            bgColor: "#ECFDF5", // Light Green
            borderColor: "#D1FAE5", // Light Green
        },
        {
            title: "UpComming Tasks",
            value: 80,
            newTasks: 5,
            icon: iconMapping["UpComming Tasks"],
            color: "#F97316", // Orange
            bgColor: "#FFF7ED", // Light Orange
            borderColor: "#FED7AA", // Light Orange
        },
        {
            title: "Maintenance Tasks",
            value: 142,
            newTasks: 8,
            icon: iconMapping["Maintenance Tasks"],
            color: "#14B8A6", // Teal
            bgColor: "#F0FDFA", // Light Teal
            borderColor: "#C6F7E2", // Light Teal
        },
        {
            title: "Unassigned Tasks",
            value: 63,
            newTasks: 7,
            icon: iconMapping["Unassigned Tasks"],
            color: "#EF4444", // Red
            bgColor: "#FEF2F2", // Light Red
            routes: '/tasks/unassigned',
            borderColor: "#FECACA", // Light Red
        },
        {
            title: "Due Tasks",
            value: 10,
            newTasks: 2,
            icon: iconMapping["Due"],
            color: "#8B5CF6", // Purple
            bgColor: "#F5F3FF", // Light Purple
            borderColor: "#EDE9FE", // Light Purple
        },
    ];

    const handleNavigate = (route) => {
        if (route) {
            navigate(route);
        }
    }

    return (
        <Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 2,
                }}
            >
                {metrics?.map((metric, index) => {
                    const Icon = metric?.icon;
                    return (
                        <Card
                            key={index}
                            sx={{
                                transition: "all 0.2s",
                                cursor: "pointer",
                                "&:hover": {
                                    transform: "translateY(-5px)",
                                    boxShadow: 3,
                                },
                                position: 'relative',
                            }}
                            className='HomePageCom'
                            onClick={() => handleNavigate(metric?.routes)}
                        >
                            <CardContent sx={{ p: "15px", pb: "15px !important" }}>
                                <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
                                    <Box sx={{ p: 1.2, borderRadius: 2, backgroundColor: metric.bgColor }}>
                                        <Icon size={20} style={{ color: metric.color }} />
                                    </Box>
                                    <Box>
                                        <Box className="taskCountBox" sx={{ display: "flex", alignItems: "center", gap: .2 }}>
                                            <Typography variant="h4" className='typoFirst'>
                                                {metric?.newTasks}
                                            </Typography>
                                            <Typography variant="h4" className='typoSecond'>/</Typography>
                                            <Typography variant="h4" className='typoSecond'>
                                                {metric.value}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        textAlign: "center",
                                        textTransform: "Capitalize",
                                        fontWeight: "medium",
                                        mt: 0.5,
                                    }}
                                >
                                    {metric?.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
}
