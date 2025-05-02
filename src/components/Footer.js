import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
        textAlign: 'center'
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="body1">
          نظام حجز المجلس © {new Date().getFullYear()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          جميع الحقوق محفوظة
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;