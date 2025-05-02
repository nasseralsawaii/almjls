import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  Stack
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import { useReactToPrint } from 'react-to-print';
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

  // تصدير الفاتورة كصورة PNG
  const exportToImage = () => {
    const input = invoiceRef.current;
    if (!input) {
      alert('لم يتم العثور على عنصر الفاتورة');
      return;
    }
    
    // إظهار رسالة للمستخدم
    const loadingMessage = document.createElement('div');
    loadingMessage.style.position = 'fixed';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.padding = '20px';
    loadingMessage.style.background = 'rgba(0, 0, 0, 0.7)';
    loadingMessage.style.color = 'white';
    loadingMessage.style.borderRadius = '5px';
    loadingMessage.style.zIndex = '9999';
    loadingMessage.textContent = 'جاري إنشاء الصورة، يرجى الانتظار...';
    document.body.appendChild(loadingMessage);
  
    // تأكد من أن العنصر مرئي تماماً
    window.scrollTo(0, 0);
    
    // تأخير قصير للتأكد من اكتمال عرض العناصر
    setTimeout(() => {
      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-invoice]');
          if (clonedElement) {
            clonedElement.style.width = input.offsetWidth + 'px';
            clonedElement.style.height = 'auto';
            clonedElement.style.overflow = 'visible';
          }
        }
      };
  
      html2canvas(input, options).then((canvas) => {
        document.body.removeChild(loadingMessage);
        
        try {
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `فاتورة-${booking.name || 'حجز'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          alert('تم إنشاء الصورة بنجاح!');
        } catch (error) {
          console.error('خطأ في حفظ الصورة:', error);
          alert('حدث خطأ أثناء حفظ الصورة. يرجى المحاولة مرة أخرى.');
        }
      }).catch(error => {
        document.body.removeChild(loadingMessage);
        console.error('خطأ في إنشاء الصورة:', error);
        alert('حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة مرة أخرى.');
      });
    }, 300);
  };

  // تصدير إلى Word (HTML)
  const exportToWord = () => {
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
            onClick={exportToImage}
            color="primary"
          >
            تصدير صورة
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
      <Paper
        ref={invoiceRef}
        elevation={3}
        data-invoice="true"
        sx={{
          p: 3,
          maxWidth: 600,
          mx: 'auto',
          direction: 'rtl',
          backgroundColor: '#fff',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          مجلس جعلان العام بحارة الصواويع
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
          فاتورة حجز
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
          <strong>رقم الفاتورة:</strong> {booking.id}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
          <strong>التاريخ:</strong> {getFormattedDate(booking.date)}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
          بيانات العميل
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
          <strong>الاسم:</strong> {booking.name}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
          <strong>رقم الهاتف:</strong> {booking.phone}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
          تفاصيل الحجز
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
          <strong>نوع المناسبة:</strong> {booking.eventType}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
          <strong>عدد الأيام:</strong> {booking.days || 1}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
          <strong>وقت البداية:</strong> {getReadableTime(booking.startTime)}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
          <strong>وقت النهاية:</strong> {getReadableTime(booking.endTime)}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          المجموع: {booking.fees} ر.ع
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          شكراً لاختياركم مجلس جعلان العام بحارة الصواويع
        </Typography>
      </Paper>
    </Box>
  );
};

export default Invoice;