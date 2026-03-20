import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import AdminHallsTab from '../components/admin/AdminHallsTab';
import AdminCateringTab from '../components/admin/AdminCateringTab';
import AdminServicesTab from '../components/admin/AdminServicesTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminInventoryPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage your hotel's halls, catering options, and additional services
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="admin inventory tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Halls" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
          <Tab label="Catering" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
          <Tab label="Services" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <AdminHallsTab />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <AdminCateringTab />
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <AdminServicesTab />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AdminInventoryPage;
