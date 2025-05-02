import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
// إزالة PaymentIcon لأنه غير مستخدم
import { useBookings } from '../context/BookingContext';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import moment from 'moment';
import BookingForm from './BookingForm';
import EditIcon from '@mui/icons-material/Edit';
// إزالة SearchIcon, FilterListIcon, TextField, InputAdornment, FormControl, Select, MenuItem لأنها غير مستخدمة
import TablePagination from '@mui/material/TablePagination';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AdminPanel = () => {
  const { bookings, deleteBooking, updateBooking } = useBookings();
  const [showStats, setShowStats] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState(''); // سنبقي هذه للمستقبل
  const [filterEventType, setFilterEventType] = useState(''); // سنبقي هذه للمستقبل
  const [filterPaymentStatus, setFilterPaymentStatus] = useState(''); // سنبقي هذه للمستقبل

  // فلترة الحجوزات
  const filteredBookings = bookings.filter(booking => {
    // البحث في الاسم أو رقم الهاتف
    const matchesSearch = searchTerm === '' || 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm);
    
    // فلترة حسب نوع المناسبة
    const matchesEventType = filterEventType === '' || booking.eventType === filterEventType;
    
    // فلترة حسب حالة الدفع
    const matchesPaymentStatus = filterPaymentStatus === '' || 
      (filterPaymentStatus === 'paid' && booking.isPaid) ||
      (filterPaymentStatus === 'unpaid' && !booking.isPaid);
    
    return matchesSearch && matchesEventType && matchesPaymentStatus;
  });

  // حساب إجمالي المبالغ
  const totalFees = bookings.reduce((sum, booking) => sum + (booking.fees || 0), 0);
  
  // حساب إجمالي المبالغ المدفوعة
  const paidFees = bookings
    .filter(booking => booking.isPaid)
    .reduce((sum, booking) => sum + (booking.fees || 0), 0);
  
  // حساب إجمالي المبالغ غير المدفوعة
  const unpaidFees = totalFees - paidFees;
  
  // حساب عدد الحجوزات حسب نوع المناسبة
  const eventTypeCounts = bookings.reduce((counts, booking) => {
    const type = booking.eventType || 'أخرى';
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});

  // تصدير إلى PDF
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // لا تضف خطوط Google Fonts هنا، استخدم الخط الافتراضي فقط
    // doc.addFont('https://fonts.googleapis.com/css2?family=Tajawal&display=swap', 'Tajawal', 'normal');
    // doc.setFont('Tajawal');
    doc.setFont('helvetica'); // الخط الافتراضي

    // إضافة العنوان
    doc.setFontSize(18);
    doc.text('مجلس جعلان العام بحارة الصواويع - سجل الحجوزات', 200, 15, { align: 'right' });

    // إعداد البيانات للجدول
    const tableColumn = ['عدد الأيام', 'المبلغ', 'إلى', 'من', 'التاريخ', 'رقم الهاتف', 'نوع المناسبة', 'الاسم'];
    const tableRows = [];

    bookings.forEach(booking => {
      const bookingData = [
        booking.days || 1,
        `${booking.fees || 0} ر.ع`,
        getReadableTime(booking.endTime),
        getReadableTime(booking.startTime),
        booking.date ? moment(booking.date).format('DD/MM/YYYY') : '',
        booking.phone || '',
        booking.eventType || '',
        booking.name || ''
      ];
      tableRows.push(bookingData);
    });

    // إنشاء الجدول
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: {
        halign: 'right',
        font: 'helvetica',
        fontSize: 10
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { right: 15, left: 15 },
      theme: 'grid'
    });

    // إضافة ملخص المبالغ
    const finalY = doc.lastAutoTable.finalY || 25;
    doc.setFontSize(14);
    doc.text(`إجمالي المبالغ: ${totalFees} ر.ع`, 200, finalY + 15, { align: 'right' });
    doc.text(`المبالغ المدفوعة: ${paidFees} ر.ع`, 200, finalY + 25, { align: 'right' });
    doc.text(`المبالغ غير المدفوعة: ${unpaidFees} ر.ع`, 200, finalY + 35, { align: 'right' });

    // حفظ الملف
    doc.save('bookings-report.pdf');
  };

  // تصدير إلى Word (HTML)
  const exportToWord = () => {
    // إنشاء محتوى HTML
    let html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>مجلس جعلان العام بحارة الصواويع - سجل الحجوزات</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f2f2f2; }
          .summary { margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>مجلس جعلان العام بحارة الصواويع - سجل الحجوزات</h1>
        <table>
          <tr>
            <th>نوع المناسبة</th>
            <th>الاسم</th>
            <th>رقم الهاتف</th>
            <th>التاريخ</th>
            <th>من</th>
            <th>إلى</th>
            <th>عدد الأيام</th>
            <th>المبلغ</th>
            <th>حالة الدفع</th>
          </tr>
    `;
    
    // إضافة صفوف البيانات
    bookings.forEach(booking => {
      html += `
        <tr>
          <td>${booking.eventType || ''}</td>
          <td>${booking.name || ''}</td>
          <td>${booking.phone || ''}</td>
          <td>${booking.date ? moment(booking.date).format('DD/MM/YYYY') : ''}</td>
          <td>${getReadableTime(booking.startTime)}</td>
          <td>${getReadableTime(booking.endTime)}</td>
          <td>${booking.days || 1}</td>
          <td>${booking.fees || 0} ر.ع</td>
          <td>${booking.isPaid ? 'تم الدفع' : 'لم يتم الدفع'}</td>
        </tr>
      `;
    });
    
    // إضافة ملخص المبالغ
    html += `
        </table>
        <div class="summary">
          <p><strong>إجمالي المبالغ:</strong> ${totalFees} ر.ع</p>
          <p><strong>المبالغ المدفوعة:</strong> ${paidFees} ر.ع</p>
          <p><strong>المبالغ غير المدفوعة:</strong> ${unpaidFees} ر.ع</p>
        </div>
      </body>
      </html>
    `;
    
    // إنشاء Blob وتنزيل الملف
    const blob = new Blob([html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bookings-report.doc';
    link.click();
  };

  // تصدير إلى Excel
  const exportToExcel = () => {
    // إعداد البيانات
    const data = bookings.map(booking => ({
      'نوع المناسبة': booking.eventType || '',
      'الاسم': booking.name || '',
      'رقم الهاتف': booking.phone || '',
      'التاريخ': booking.date ? moment(booking.date).format('DD/MM/YYYY') : '',
      'من': getReadableTime(booking.startTime),
      'إلى': getReadableTime(booking.endTime),
      'عدد الأيام': booking.days || 1,
      'المبلغ': booking.fees || 0,
      'حالة الدفع': booking.isPaid ? 'تم الدفع' : 'لم يتم الدفع'
    }));
    
    // إضافة صف ملخص المبالغ
    data.push({
      'نوع المناسبة': '',
      'الاسم': '',
      'رقم الهاتف': '',
      'التاريخ': '',
      'من': '',
      'إلى': '',
      'عدد الأيام': 'إجمالي المبالغ:',
      'المبلغ': totalFees,
      'حالة الدفع': ''
    });
    
    data.push({
      'نوع المناسبة': '',
      'الاسم': '',
      'رقم الهاتف': '',
      'التاريخ': '',
      'من': '',
      'إلى': '',
      'عدد الأيام': 'المبالغ المدفوعة:',
      'المبلغ': paidFees,
      'حالة الدفع': ''
    });
    
    data.push({
      'نوع المناسبة': '',
      'الاسم': '',
      'رقم الهاتف': '',
      'التاريخ': '',
      'من': '',
      'إلى': '',
      'عدد الأيام': 'المبالغ غير المدفوعة:',
      'المبلغ': unpaidFees,
      'حالة الدفع': ''
    });
    
    // إنشاء ورقة عمل
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // إنشاء مصنف
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الحجوزات');
    
    // حفظ الملف
    XLSX.writeFile(workbook, 'bookings-report.xlsx');
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

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('DD/MM/YYYY');
  };

  // فتح مربع حوار الحذف
  const handleOpenDeleteDialog = (booking) => {
    setBookingToDelete(booking);
    setOpenDeleteDialog(true);
  };

  // إغلاق مربع حوار الحذف
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setBookingToDelete(null);
  };

  // تأكيد حذف الحجز
  const handleConfirmDelete = () => {
    if (bookingToDelete) {
      deleteBooking(bookingToDelete.id);
      handleCloseDeleteDialog();
    }
  };

  // فتح مربع حوار الإضافة
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  // إغلاق مربع حوار الإضافة
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  // فتح مربع حوار التعديل
  const handleOpenEditDialog = (booking) => {
    setBookingToEdit(booking);
    setOpenEditDialog(true);
  };

  // إغلاق مربع حوار التعديل
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setBookingToEdit(null);
  };

  // تغيير حالة الدفع
  const togglePaymentStatus = (booking) => {
    const updatedBooking = {
      ...booking,
      isPaid: !booking.isPaid
    };
    updateBooking(updatedBooking);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          لوحة الإدارة
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          إضافة حجز جديد
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          تصدير البيانات
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PictureAsPdfIcon />}
              onClick={exportToPDF}
              sx={{ mb: 2 }}
            >
              تصدير PDF
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<DescriptionIcon />}
              onClick={exportToWord}
              sx={{ mb: 2 }}
            >
              تصدير Word
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<TableChartIcon />}
              onClick={exportToExcel}
              sx={{ mb: 2 }}
            >
              تصدير Excel
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Button
        variant="contained"
        startIcon={<PictureAsPdfIcon />}
        onClick={exportToImage}
        sx={{ mb: 2, mr: 2 }}
      >
        تصدير PNG
      </Button>
      
      <Button
        variant="contained"
        startIcon={<BarChartIcon />}
        onClick={() => setShowStats(!showStats)}
        sx={{ mb: 3 }}
      >
        {showStats ? 'إخفاء الإحصائيات' : 'عرض الإحصائيات'}
      </Button>
      
      {showStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  إجمالي المبالغ
                </Typography>
                <Typography variant="h4" color="primary">
                  {totalFees} ر.ع
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  المبالغ المدفوعة
                </Typography>
                <Typography variant="h4" color="success.main">
                  {paidFees} ر.ع
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  المبالغ غير المدفوعة
                </Typography>
                <Typography variant="h4" color="error.main">
                  {unpaidFees} ر.ع
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  الحجوزات حسب نوع المناسبة
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {Object.entries(eventTypeCounts).map(([type, count]) => (
                    <Grid item xs={6} sm={3} key={type}>
                      <Typography variant="body1">
                        {type}: <strong>{count}</strong>
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          قائمة الحجوزات
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>نوع المناسبة</TableCell>
                <TableCell>الاسم</TableCell>
                {/* Replace dynamic date formatting with static text */}
                <TableCell>التاريخ</TableCell>
                <TableCell>من</TableCell>
                <TableCell>إلى</TableCell>
                <TableCell>المبلغ</TableCell>
                <TableCell>حالة الدفع</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* The booking variable is correctly used here within the map function */}
              {filteredBookings
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Apply pagination
                .map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.eventType}</TableCell>
                  <TableCell>{booking.name}</TableCell>
                  {/* Format the date correctly for each row */}
                  <TableCell>{booking.date ? moment(booking.date).format('DD/MM/YYYY') : ''}</TableCell>
                  <TableCell>{getReadableTime(booking.startTime)}</TableCell>
                  <TableCell>{getReadableTime(booking.endTime)}</TableCell>
                  <TableCell>{booking.fees} ر.ع</TableCell>
                  {/* Display payment status with icons */}
                  <TableCell>
                    <IconButton
                      color={booking.isPaid ? "success" : "error"}
                      size="small"
                      title={booking.isPaid ? "تم الدفع" : "لم يتم الدفع"}
                      onClick={() => togglePaymentStatus(booking)} // Keep toggle functionality
                    >
                      {booking.isPaid ? <CheckCircleIcon /> : <CancelIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {/* Action buttons */}
                    <IconButton color="primary" onClick={() => handleOpenEditDialog(booking)} sx={{ mr: 1 }} size="small" title="تعديل">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDeleteDialog(booking)} size="small" title="حذف">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="عدد الصفوف في الصفحة:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
        />
      </Paper>
      
      {/* مربع حوار تأكيد الحذف */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف هذا الحجز؟
          </Typography>
          {bookingToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>نوع المناسبة:</strong> {bookingToDelete.eventType}
              </Typography>
              <Typography variant="body2">
                <strong>الاسم:</strong> {bookingToDelete.name}
              </Typography>
              <Typography variant="body2">
                <strong>التاريخ:</strong> {bookingToDelete.date ? moment(bookingToDelete.date).format('DD/MM/YYYY') : ''}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
          <Button onClick={handleConfirmDelete} color="error">حذف</Button>
        </DialogActions>
      </Dialog>
      
      {/* مربع حوار إضافة حجز جديد */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>إضافة حجز جديد</DialogTitle>
        <DialogContent>
          <BookingForm onSuccess={handleCloseAddDialog} />
        </DialogContent>
      </Dialog>
      
      {/* مربع حوار تعديل الحجز */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>تعديل الحجز</DialogTitle>
        <DialogContent>
          {bookingToEdit && (
            <BookingForm 
              onSuccess={handleCloseEditDialog} 
              initialData={bookingToEdit} 
              isEditing={true} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;


  // تصدير إلى صورة PNG
  const exportToImage = () => {
    const tableElement = document.querySelector('.MuiTableContainer-root');
    if (!tableElement) {
      alert('لم يتم العثور على جدول الحجوزات');
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
        logging: true
      };
  
      html2canvas(tableElement, options).then((canvas) => {
        document.body.removeChild(loadingMessage);
        
        try {
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = 'bookings-report.png';
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