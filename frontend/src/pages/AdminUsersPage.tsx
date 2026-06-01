import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Switch,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import api from '../services/api';

interface AdminUser {
  id: string;
  email: string;
  role: 'CLIENT' | 'MANAGER' | 'ADMIN';
  isActive: boolean;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLES: AdminUser['role'][] = ['CLIENT', 'MANAGER', 'ADMIN'];

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (id: string, role: string) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось изменить роль');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { isActive });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось изменить статус');
    }
  };

  const name = (u: AdminUser) =>
    [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Пользователи
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Компания</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Последний вход</TableCell>
                <TableCell>Регистрация</TableCell>
                <TableCell align="center">Активен</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{name(u)}</TableCell>
                  <TableCell>{u.companyName || '—'}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString()
                      : '—'}
                  </TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={u.isActive}
                      onChange={(e) => toggleActive(u.id, e.target.checked)}
                    />
                    {!u.isActive && <Chip label="Отключен" size="small" color="error" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminUsersPage;
