import React from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <CalendarTodayIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          نظام حجز المجلس
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            onClick={() => navigate('/')}
            sx={{ color: location.pathname === '/' ? '#fff' : 'rgba(255,255,255,0.7)' }}
          >
            حجز جديد
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/bookings')}
            sx={{ color: location.pathname === '/bookings' ? '#fff' : 'rgba(255,255,255,0.7)' }}
          >
            الحجوزات
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/admin')}
            sx={{ color: location.pathname === '/admin' ? '#fff' : 'rgba(255,255,255,0.7)' }}
          >
            لوحة التحكم
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;