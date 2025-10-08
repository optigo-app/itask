import React from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Button,
    Container,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import { Plus } from 'lucide-react';
import TeamTemplateInfoButton from '../ShortcutsComponent/TeamTemplate/TeamTemplateInfoButton';

const TeamTemplateDemo = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#1976d2' }}>
                    Team Management Demo
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    This demo shows how the Team Template Info Button integrates into the Project Dashboard Team Member tab.
                </Typography>

                <Card elevation={1} sx={{ mb: 4 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Project Dashboard - Team Members Tab
                        </Typography>
                        
                        {/* Simulated Team Member Header */}
                        <Box sx={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            mb: 2,
                            p: 2,
                            bgcolor: '#f8f9fa',
                            borderRadius: 1,
                            border: '1px dashed #ccc'
                        }}>
                            <Box />
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <TeamTemplateInfoButton />
                                <Button
                                    variant="contained"
                                    startIcon={<Plus size={18} />}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Add Team
                                </Button>
                            </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Click the info icon to view team structure templates
                        </Typography>
                    </CardContent>
                </Card>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={1}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Features
                                </Typography>
                                <Box component="ul" sx={{ pl: 2, '& li': { mb: 0.5 } }}>
                                    <li>3 team structure templates</li>
                                    <li>Simple role-based cards</li>
                                    <li>Theme color integration</li>
                                    <li>Clean tabbed interface</li>
                                    <li>No complex details</li>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Card elevation={1}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Purpose
                                </Typography>
                                <Box component="ul" sx={{ pl: 2, '& li': { mb: 0.5 } }}>
                                    <li>Help organize teams effectively</li>
                                    <li>Provide role clarity</li>
                                    <li>Reference for team decisions</li>
                                    <li>Improve team composition</li>
                                    <li>Standardize organization</li>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#7367f0', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'white' }}>
                        <strong>Theme Integrated:</strong> Uses your app's theme colors (#7367f0) with simplified cards showing only names and roles.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default TeamTemplateDemo;
