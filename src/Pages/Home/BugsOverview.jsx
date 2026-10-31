import React, { useEffect, useState } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { ArrowRight, Bug } from 'lucide-react'
import RowSkeleton from './RowSkeleton'
import { getBugDashboardApi } from '../../Api/BugApi/bugApi'
import { getDynamicStatusColor, handleBugTrackRedirect } from '../../Utils/globalfun'
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog'

const BugsOverview = ({ navigate }) => {
    const [bugData, setBugData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bugTrackDialogOpen, setBugTrackDialogOpen] = useState(false);

    useEffect(() => {
        let mounted = true;
        getBugDashboardApi()
            .then((res) => { if (mounted) setBugData(res); })
            .catch(() => { })
            .finally(() => { if (mounted) setIsLoading(false); });
        return () => { mounted = false; };
    }, []);

    const totalBugs = bugData?.rd?.[0]?.totalBugs ?? 0;
    const statusCounts = (Array.isArray(bugData?.rd1) ? bugData.rd1 : [])
        .slice(0, 4);

    const bugStatusData = JSON.parse(localStorage.getItem('taskbugstatusData') || '[]');
    const getStatusMeta = (statusId) => {
        const label = bugStatusData?.find((s) => s.id == statusId)?.labelname ?? `Status ${statusId}`;
        const colors = getDynamicStatusColor(label.toLowerCase());
        return { label, colors };
    };

    const handleViewAll = () => setBugTrackDialogOpen(true);

    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Box className='cardHeader'>
                    <Typography className='cardTitle' component="div" variant="h5">
                        Bug Track
                        {totalBugs > 0 && <Box component="span" className='countBadge bug'>{totalBugs}</Box>}
                    </Typography>
                    {totalBugs > 0 && (
                        <Typography className='viewAllLink' onClick={handleViewAll}>
                            View all <ArrowRight size={14} />
                        </Typography>
                    )}
                </Box>
                {isLoading ? (
                    <RowSkeleton rows={3} chips={1} />
                ) : statusCounts.length > 0 ? (
                    <Box className='listBox'>
                        {statusCounts.map((item) => {
                            const meta = getStatusMeta(item?.statusId);
                            return (
                                <Box className='listRow' key={item?.statusId}>
                                    <Box className='statusDot' sx={{ backgroundColor: meta?.colors?.color }} />
                                    <Typography className='rowTitle' noWrap>
                                        {meta.label}
                                    </Typography>
                                    <Box className='rowRight'>
                                        <Box className='countBadge'>{item?.count ?? 0}</Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            mb: 2,
                        }}
                    >
                        <Bug size={34} color="#7d7f85" />
                        <Typography variant="body" sx={{ mt: 1, mb: 0.5, color: '#6D6B77' }}>
                            No open bugs
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#7d7f85', mb: 1 }}>
                            Nothing reported — all clear.
                        </Typography>
                    </Box>
                )}
            </CardContent>
            <ConfirmationDialog
                open={bugTrackDialogOpen}
                onClose={() => setBugTrackDialogOpen(false)}
                onConfirm={() => {
                    setBugTrackDialogOpen(false);
                    handleBugTrackRedirect();
                }}
                title="Redirect to Bug Tracker"
                content="You will be redirected to the Bug Tracker in a new tab. Do you want to continue?"
                confirmLabel="Continue"
                cancelLabel="Cancel"
            />
        </Card>
    )
}

export default BugsOverview
