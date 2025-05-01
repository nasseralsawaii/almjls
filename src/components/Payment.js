import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const Payment = ({ booking, onPaymentComplete }) => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
      return 'يرجى إدخال رقم بطاقة صحيح';
    }
    if (!paymentData.cardName) {
      return 'يرجى إدخال اسم حامل البطاقة';
    }
    if (!paymentData.expiryMonth || !paymentData.expiryYear) {
      return 'يرجى إدخال تاريخ انتهاء البطاقة';
    }
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      return 'يرجى إدخال رمز الأمان CVV';
    }
    return '';
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setProcessing(true);
    
    // محاكاة عملية الدفع
    setTimeout(() => {
      setProcessing(false);
      onPaymentComplete();
    }, 2000);
  };
  
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        الدفع
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          تفاصيل الحجز
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body1">
              <strong>نوع المناسبة:</strong> {booking.eventType}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">
              <strong>المبلغ المطلوب:</strong> {booking.fees} ر.س
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="رقم البطاقة"
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handleChange}
              inputProps={{ maxLength: 16 }}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="اسم حامل البطاقة"
              name="cardName"
              value={paymentData.cardName}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>الشهر</InputLabel>
              <Select
                name="expiryMonth"
                value={paymentData.expiryMonth}
                onChange={handleChange}
                label="الشهر"
                required
              >
                {months.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>السنة</InputLabel>
              <Select
                name="expiryYear"
                value={paymentData.expiryYear}
                onChange={handleChange}
                label="السنة"
                required
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="CVV"
              name="cvv"
              value={paymentData.cvv}
              onChange={handleChange}
              inputProps={{ maxLength: 3 }}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              startIcon={<CreditCardIcon />}
              disabled={processing}
              sx={{ mt: 2 }}
            >
              {processing ? 'جاري معالجة الدفع...' : `دفع ${booking.fees} ر.س`}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default Payment;