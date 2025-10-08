import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Card,
    Grid,
    Tabs,
    Tab,
    IconButton
} from '@mui/material';
import { 
    X, 
    Users, 
    User,
    Code2,
    Palette,
    BarChart3,
    Shield,
    Briefcase,
    ClipboardList
} from 'lucide-react';
import teamTemplateData from '../../../Data/teamSampleTmp.json';

const TeamTemplateInfoModal = ({ open, onClose }) => {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const getRoleIcon = (role) => {
        if (role.includes('Developer') || role.includes('Engineer')) return <Code2 size={20} />;
        if (role.includes('Designer')) return <Palette size={20} />;
        if (role.includes('Analyst') || role.includes('SEO')) return <BarChart3 size={20} />;
        if (role.includes('QA') || role.includes('Quality') || role.includes('Test')) return <ClipboardList size={20} />;
        if (role.includes('Manager') || role.includes('Owner')) return <Briefcase size={20} />;
        if (role.includes('Scrum') || role.includes('Master')) return <Users size={20} />;
        return <User size={20} />;
    };

    const getVariantTitle = (variant) => {
        const titles = {
            1: 'Development-Focused Team',
            2: 'Agile Cross-Functional Team',
            3: 'Technical Leadership Team'
        };
        return titles[variant] || `Team Variant ${variant}`;
    };

    const getVariantDescription = (variant) => {
        const descriptions = {
            1: 'Basic development team with essential roles',
            2: 'Agile team with cross-functional skills',
            3: 'Advanced team with technical leadership'
        };
        return descriptions[variant] || 'Team structure template';
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '8px'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Team Structure Templates
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <X size={18} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 2 }}>
                <Tabs 
                    value={selectedTab} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ 
                        mb: 2,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            minHeight: 48,
                            color: '#666',
                            '&.Mui-selected': {
                                color: '#7367f0',
                                fontWeight: 500
                            }
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#7367f0'
                        }
                    }}
                >
                    {teamTemplateData.teams.map((team, index) => (
                        <Tab 
                            key={index}
                            label={`Template ${team.variant}`}
                        />
                    ))}
                </Tabs>

                {teamTemplateData.teams.map((team, teamIndex) => (
                    <Box 
                        key={teamIndex}
                        hidden={selectedTab !== teamIndex}
                        sx={{ display: selectedTab === teamIndex ? 'block' : 'none' }}
                    >
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                {getVariantTitle(team.variant)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {getVariantDescription(team.variant)} • {team.members.length} members
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {team.members.map((member, memberIndex) => (
                                <Grid item xs={12} sm={6} md={4} key={memberIndex}>
                                    <Card 
                                        variant="outlined"
                                        sx={{ 
                                            p: 2,
                                            textAlign: 'center',
                                            '&:hover': {
                                                borderColor: '#7367f0',
                                                boxShadow: 1
                                            }
                                        }}
                                    >
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            width: 40, 
                                            height: 40, 
                                            borderRadius: 2,
                                            bgcolor: '#7367f0',
                                            color: 'white',
                                            mx: 'auto',
                                            mb: 1.5
                                        }}>
                                            {getRoleIcon(member.role)}
                                        </Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                            {member.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {member.role}
                                        </Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}

            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button 
                    onClick={onClose} 
                    variant="contained" 
                    size="small"
                    sx={{ 
                        bgcolor: '#7367f0',
                        '&:hover': {
                            bgcolor: '#5e56d6'
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TeamTemplateInfoModal;
