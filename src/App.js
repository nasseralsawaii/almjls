import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import theme, { cacheRtl } from './styles/theme';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
// Add these missing imports
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import AdminPanel from './components/AdminPanel';
// You need to create or import these components
import Home from './pages/Home'; // This file needs to be created
import Footer from './components/Footer'; // This file needs to be created

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <CacheProvider value={cacheRtl}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <Navbar />
              <Container>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/bookings" element={<BookingList />} />
                  <Route path="/booking/new" element={<BookingForm />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminPanel />
                    </ProtectedRoute>
                  } />
                  <Route path="/booking/edit/:id" element={
                    <ProtectedRoute>
                      <BookingForm isEditing={true} />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Container>
              <Footer />
            </Router>
          </ThemeProvider>
        </CacheProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;