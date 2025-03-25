import React from "react";
import { Card, CardContent, CardHeader, Typography, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, Tabs, Tab } from "@mui/material";
import { Upload } from "@mui/icons-material";

const ProjectDashboard = () => {
  const [tab, setTab] = React.useState(0);

  return (
    <div className="p-6 grid gap-4">
      <Typography variant="h4" gutterBottom>Project Dashboard</Typography>
      
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
        <Tab label="Reference" />
        <Tab label="Milestones" />
        <Tab label="SOP Corrections" />
        <Tab label="Team Members" />
        <Tab label="Comments" />
        <Tab label="Challenges" />
        <Tab label="R&D" />
      </Tabs>
      
      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6">Reference Documents & Test Cases</Typography>
            <TextField type="file" fullWidth margin="normal" />
          </CardContent>
        </Card>
      )}
      
      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6">Milestones</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Phase</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Deadline</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Phase 1</TableCell>
                  <TableCell>70%</TableCell>
                  <TableCell>2025-04-15</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6">SOP Corrections</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>R&D</TableCell>
                  <TableCell>Challenges</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Documentation</TableCell>
                  <TableCell>Ongoing</TableCell>
                  <TableCell>Approval Delay</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6">Team Members</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell>Lead Developer</TableCell>
                  <TableCell>Backend</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6">Comments</Typography>
            <TextField label="Add a comment..." fullWidth margin="normal" />
            <Button variant="contained" className="mt-2">Submit</Button>
          </CardContent>
        </Card>
      )}

      {tab === 5 && (
        <Card>
          <CardContent>
            <Typography variant="h6">Challenges</Typography>
            <Typography>Tracking project hurdles...</Typography>
          </CardContent>
        </Card>
      )}

      {tab === 6 && (
        <Card>
          <CardContent>
            <Typography variant="h6">Research & Development</Typography>
            <Typography>Tracking R&D efforts...</Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectDashboard;