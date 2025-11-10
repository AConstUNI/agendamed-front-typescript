'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
} from '@mui/material';

interface AdminLog {
  id: number;
  adminEmail: string;
  action: string;
  target?: string;
  createdAt: string;
}

export default function Log() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/admin/logs`);
      if (!res.ok) throw new Error('Falha ao buscar logs');
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Algo deu errado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Admin Logs
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error} &nbsp;
          <Button size="small" variant="outlined" onClick={fetchLogs}>
            Tentar novamente
          </Button>
        </Alert>
      )}

      {!loading && !error && (
        <TableContainer
          component={Paper}
          sx={{
            mt: 3,
            maxHeight: '70vh',
            overflowY: 'auto',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f3f6f9' }}>
                <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Quem</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ação</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log, idx) => (
                <TableRow
                  key={log.id}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
                    '&:hover': { backgroundColor: 'rgba(52,78,181,0.08)' },
                  }}
                >
                  <TableCell>
                    {new Date(log.createdAt).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>{log.adminEmail}</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color:
                        log.action.toLowerCase().includes('delete')
                          ? '#d32f2f'
                          : log.action.toLowerCase().includes('update')
                          ? '#ed6c02'
                          : '#1976d2',
                    }}
                  >
                    {log.action}
                  </TableCell>
                  <TableCell>{log.target || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
