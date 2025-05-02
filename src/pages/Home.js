import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          مرحباً بكم في نظام حجز المجلس
        </Typography>
        <Typography variant="body1" paragraph>
          يمكنكم حجز المجلس للمناسبات المختلفة بكل سهولة
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/booking/new')}
          sx={{ mt: 2 }}
        >
          حجز جديد
        </Button>
      </Paper>
    </Box>
  );
};

export default Home;