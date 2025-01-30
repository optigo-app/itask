import { Package, List, UserCheck, UserX, CheckCircle, Clock, Settings, Layers } from 'lucide-react'; // Import Lucide icons
import { Card, CardContent, Box, Typography } from "@mui/material";

export default function SummaryDashboard() {
    // const metrics = [
    //     {
    //         title: "Total Projects",
    //         value: 15,
    //         icon: Package,
    //         color: "#3B82F6", // Blue
    //         bgColor: "#EFF6FF", // Light Blue
    //     },
    //     {
    //         title: "Total Tasks",
    //         value: 243,
    //         icon: ListTodo,
    //         color: "#10B981", // Green
    //         bgColor: "#ECFDF5", // Light Green
    //     },
    //     {
    //         title: "Assigned Tasks",
    //         value: 80,
    //         icon: UserCheck,
    //         color: "#F97316", // Orange
    //         bgColor: "#FFF7ED", // Light Orange
    //     },
    //     {
    //         title: "Unassigned Tasks",
    //         value: 63,
    //         icon: UserX,
    //         color: "#EF4444", // Red
    //         bgColor: "#FEF2F2", // Light Red
    //     },
    //     {
    //         title: "Completed",
    //         value: 142,
    //         icon: CheckCircle,
    //         color: "#14B8A6", // Teal
    //         bgColor: "#F0FDFA", // Light Teal
    //     },
    //     {
    //         title: "Due",
    //         value: 10,
    //         icon: Clock,
    //         color: "#8B5CF6", // Purple
    //         bgColor: "#F5F3FF", // Light Purple
    //     },
    // ];

    const iconMapping = {
        "Services Tasks": Package,
        "R&D Tasks": Layers,
        "UpComming Tasks": UserCheck,
        "Unassigned Tasks": UserX,
        "Maintenance Tasks": Settings,
        "Due": Clock
    };

    const metrics = [
        {
            title: "Services Tasks",
            value: 15,
            icon: iconMapping["Services Tasks"],
            color: "#3B82F6", // Blue
            bgColor: "#EFF6FF", // Light Blue
        },
        {
            title: "R&D Tasks",
            value: 243,
            icon: iconMapping["R&D Tasks"],
            color: "#10B981", // Green
            bgColor: "#ECFDF5", // Light Green
        },
        {
            title: "UpComming Tasks",
            value: 80,
            icon: iconMapping["UpComming Tasks"],
            color: "#F97316", // Orange
            bgColor: "#FFF7ED", // Light Orange
        },
        {
            title: "Unassigned Tasks",
            value: 63,
            icon: iconMapping["Unassigned Tasks"],
            color: "#EF4444", // Red
            bgColor: "#FEF2F2", // Light Red
        },
        {
            title: "Maintenance Tasks",
            value: 142,
            icon: iconMapping["Maintenance Tasks"],
            color: "#14B8A6", // Teal
            bgColor: "#F0FDFA", // Light Teal
        },
        {
            title: "Due",
            value: 10,
            icon: iconMapping["Due"],
            color: "#8B5CF6", // Purple
            bgColor: "#F5F3FF", // Light Purple
        },
    ];

    return (
        <Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 2,
                }}
            >
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <Card
                            key={index}
                            sx={{
                                transition: "all 0.2s",
                                "&:hover": {
                                    transform: "translateY(-5px)",
                                    boxShadow: 3,
                                },
                            }}
                            className='HomePageCom'
                        >
                            <CardContent sx={{ p: "15px", pb: "15px !important" }}>
                                <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: metric.bgColor }}>
                                        <Icon size={24} style={{ color: metric.color }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {metric.value}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                textTransform: "Capitalize",
                                                fontWeight: "medium",
                                                mt: 0.5,
                                            }}
                                        >
                                            {metric.title}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
}
