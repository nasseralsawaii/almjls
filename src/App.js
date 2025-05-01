import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import theme, { cacheRtl } from './styles/theme';
import { BookingProvider } from './context/BookingContext';

// استيراد المكونات
import BookingForm from './components/BookingForm';
import BookingsTable from './components/BookingsTable';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Navigation from './components/Navigation';

function App() {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          p: 2, 
          textAlign: 'center',
          boxShadow: 3
        }}>
          <Typography variant="h4" component="h1">
            مجلس جعلان العام بحارة الصواويع
          </Typography>
          <Typography variant="subtitle1">
            نظام حجز المجلس
          </Typography>
        </Box>
        <BookingProvider>
          <Router>
            <Navigation />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Routes>
                <Route path="/" element={<BookingForm />} />
                <Route path="/bookings" element={<BookingsTable />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </Container>
          </Router>
        </BookingProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;