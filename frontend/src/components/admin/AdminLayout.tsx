import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Typography,
  Divider,
  Badge,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Assignment as AssignmentIcon,
  Hotel as HotelIcon,
  Restaurant as RestaurantIcon,
  RoomService as RoomServiceIcon,
  People as PeopleIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

const FULL_WIDTH = 240;
const MINI_WIDTH = 64;
const APP_VERSION = '2.0.0-mvp';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  superAdminOnly?: boolean;
  badge?: number;
}

interface AdminLayoutProps {
  /** Number of bookings awaiting processing (PENDING) — shown as a badge. */
  pendingCount?: number;
}

/**
 * Collapsible sidebar shell for the admin section.
 * Renders nested routes through <Outlet />.
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ pendingCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isSuperAdmin = localStorage.getItem('userRole') === 'ADMIN';

  const width = collapsed ? MINI_WIDTH : FULL_WIDTH;

  const items: NavItem[] = [
    { label: 'Дашборд', path: '/admin/dashboard', icon: <BarChartIcon /> },
    {
      label: 'Заявки',
      path: '/admin/bookings',
      icon: <AssignmentIcon />,
      badge: pendingCount,
    },
    { label: 'Инвентарь', path: '/admin/inventory', icon: <HotelIcon /> },
    { label: 'Кейтеринг', path: '/admin/inventory', icon: <RestaurantIcon /> },
    { label: 'Услуги', path: '/admin/inventory', icon: <RoomServiceIcon /> },
    {
      label: 'Пользователи',
      path: '/admin/users',
      icon: <PeopleIcon />,
      superAdminOnly: true,
    },
  ];

  const visible = items.filter((i) => !i.superAdminOnly || isSuperAdmin);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            position: 'relative',
            transition: 'width 0.2s',
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar sx={{ justifyContent: collapsed ? 'center' : 'space-between', px: 1 }}>
          {!collapsed && (
            <Typography variant="subtitle1" noWrap>
              Админ-панель
            </Typography>
          )}
          <IconButton onClick={() => setCollapsed((c) => !c)} size="small">
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {visible.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <ListItemButton
                key={`${item.label}-${item.path}`}
                selected={selected}
                onClick={() => navigate(item.path)}
                sx={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40 }}>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.label} />}
              </ListItemButton>
            );
          })}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        {!collapsed && (
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Версия {APP_VERSION}
            </Typography>
          </Box>
        )}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
