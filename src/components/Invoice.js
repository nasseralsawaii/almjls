import React, { useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  Button,
  Stack
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import moment from 'moment';

const Invoice = ({ booking }) => {
  const invoiceRef = useRef();
  
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
  });
  
  // تحويل التاريخ إلى صيغة مقروءة
  const getFormattedDate = (date) => {
    if (!date) return '';
    
    let momentDate;
    if (typeof date === 'string') {
      momentDate = moment(date);
    } else if (date.format) {
      momentDate = date;
    } else {
      momentDate = moment(date);
    }
    
    return momentDate.format('DD/MM/YYYY');
  };
  
  // تحويل الوقت إلى صيغة مقروءة
  const getReadableTime = (timeCode) => {
    if (!timeCode) return '';
    
    if (typeof timeCode === 'string' && timeCode.includes('-')) {
      const [period, hour] = timeCode.split('-');
      return period === 'AM' 
        ? `${hour}:00 صباحاً` 
        : hour === '12' 
          ? '12:00 ظهراً' 
          : `${hour}:00 مساءً`;
    }
    
    return timeCode;
  };
  
  // تصدير إلى PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // إضافة العنوان
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('مجلس جعلان العام بحارة الصواويع', 105, 15, { align: 'center' });
    doc.setFontSize(16);
    doc.text('فاتورة حجز', 105, 25, { align: 'center' });
    
    // إضافة بيانات الفاتورة
    doc.setFontSize(12);
    doc.text(`رقم الفاتورة: ${booking.id}`, 190, 40, { align: 'right' });
    doc.text(`التاريخ: ${getFormattedDate(booking.date)}`, 190, 50, { align: 'right' });
    
    // بيانات العميل
    doc.setFontSize(14);
    doc.text('بيانات العميل', 190, 65, { align: 'right' });
    doc.setFontSize(12);
    doc.text(`الاسم: ${booking.name}`, 190, 75, { align: 'right' });
    doc.text(`رقم الهاتف: ${booking.phone}`, 190, 85, { align: 'right' });
    
    // تفاصيل الحجز
    doc.setFontSize(14);
    doc.text('تفاصيل الحجز', 190, 100, { align: 'right' });
    doc.setFontSize(12);
    doc.text(`نوع المناسبة: ${booking.eventType}`, 190, 110, { align: 'right' });
    doc.text(`عدد الأيام: ${booking.days}`, 190, 120, { align: 'right' });
    doc.text(`وقت البداية: ${getReadableTime(booking.startTime)}`, 190, 130, { align: 'right' });
    doc.text(`وقت النهاية: ${getReadableTime(booking.endTime)}`, 190, 140, { align: 'right' });
    
    // المجموع
    doc.setLineWidth(0.5);
    doc.line(20, 155, 190, 155);
    doc.setFontSize(14);
    doc.text(`المجموع: ${booking.fees} ر.ع`, 190, 170, { align: 'right' });
    
    // الختام
    doc.setFontSize(10);
    doc.text('شكراً لاختياركم مجلس جعلان العام بحارة الصواويع', 105, 200, { align: 'center' });
    
    // حفظ الملف
    doc.save(`فاتورة-${booking.name}.pdf`);
  };
  
  // تصدير إلى Word (HTML)
  const exportToWord = () => {
    // إنشاء محتوى HTML
    let html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>فاتورة حجز - مجلس جعلان العام بحارة الصواويع</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; }
          h1, h2 { text-align: center; }
          .invoice-header { margin-bottom: 20px; }
          .invoice-details { display: flex; justify-content: space-between; }
          .customer-info, .booking-info { margin-top: 20px; }
          .total { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; text-align: left; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1>مجلس جعلان العام بحارة الصواويع</h1>
          <h2>فاتورة حجز</h2>
        </div>
        
        <div class="invoice-details">
          <div>رقم الفاتورة: ${booking.id}</div>
          <div>التاريخ: ${getFormattedDate(booking.date)}</div>
        </div>
        
        <div class="customer-info">
          <h3>بيانات العميل</h3>
          <p>الاسم: ${booking.name}</p>
          <p>رقم الهاتف: ${booking.phone}</p>
        </div>
        
        <div class="booking-info">
          <h3>تفاصيل الحجز</h3>
          <p>نوع المناسبة: ${booking.eventType}</p>
          <p>عدد الأيام: ${booking.days}</p>
          <p>وقت البداية: ${getReadableTime(booking.startTime)}</p>
          <p>وقت النهاية: ${getReadableTime(booking.endTime)}</p>
        </div>
        
        <div class="total">
          <h3>المجموع: ${booking.fees} ر.ع</h3>
        </div>
        
        <div class="footer">
          <p>شكراً لاختياركم مجلس جعلان العام بحارة الصواويع</p>
        </div>
      </body>
      </html>
    `;
    
    // إنشاء Blob وتنزيل الملف
    const blob = new Blob([html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `فاتورة-${booking.name}.doc`;
    link.click();
  };
  
  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            طباعة الفاتورة
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={exportToPDF}
            color="primary"
          >
            تصدير PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<DescriptionIcon />}
            onClick={exportToWord}
            color="secondary"
          >
            تصدير Word
          </Button>
        </Stack>
      </Box>
      
      <Paper elevation={3} ref={invoiceRef} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            مجلس جعلان العام بحارة الصواويع
          </Typography>
          <Typography variant="h5" gutterBottom>
            فاتورة حجز
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body1">
              <strong>رقم الفاتورة:</strong> {booking.id}
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'left' }}>
            <Typography variant="body1">
              <strong>التاريخ:</strong> {getFormattedDate(booking.date)}
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            بيانات العميل
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>الاسم:</strong> {booking.name}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>رقم الهاتف:</strong> {booking.phone}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mt: 4 }}>
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
                <strong>عدد الأيام:</strong> {booking.days}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>وقت البداية:</strong> {getReadableTime(booking.startTime)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>وقت النهاية:</strong> {getReadableTime(booking.endTime)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Typography variant="h6">
                المجموع
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'left' }}>
              <Typography variant="h6">
                {booking.fees} ر.ع
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            شكراً لاختياركم مجلس جعلان العام بحارة الصواويع
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Invoice;