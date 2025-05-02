import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <AppBar position="static" sx={{ direction: 'rtl' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          نظام حجز المجلس
        </Typography>
        {isAdmin() && (
          <Button color="inherit" component={Link} to="/admin">لوحة التحكم</Button>
        )}
        <Button color="inherit" component={Link} to="/bookings">الحجوزات</Button>
        <Button color="inherit" component={Link} to="/booking/new">حجز جديد</Button>
        <Button color="inherit" component={Link} to="/">الرئيسية</Button>
        {currentUser ? (
          <Button color="inherit" onClick={handleLogout}>تسجيل الخروج</Button>
        ) : (
          <Button color="inherit" component={Link} to="/login">تسجيل الدخول</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;