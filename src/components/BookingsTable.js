import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import { useBookings } from '../context/BookingContext';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CloseIcon from '@mui/icons-material/Close';
import Invoice from './Invoice';
import moment from 'moment';

const BookingsTable = () => {
  const { bookings } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openInvoice, setOpenInvoice] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShowInvoice = (booking) => {
    setSelectedBooking(booking);
    setOpenInvoice(true);
  };

  const handleCloseInvoice = () => {
    setOpenInvoice(false);
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

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          سجل الحجوزات
        </Typography>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          طباعة
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>نوع المناسبة</TableCell>
              <TableCell>الاسم</TableCell>
              <TableCell>رقم الهاتف</TableCell>
              <TableCell>التاريخ</TableCell>
              <TableCell>من</TableCell>
              <TableCell>إلى</TableCell>
              <TableCell>عدد الأيام</TableCell>
              <TableCell>المبلغ</TableCell>
              <TableCell>حالة الدفع</TableCell>
              <TableCell>الفاتورة</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.eventType}</TableCell>
                <TableCell>{booking.name}</TableCell>
                <TableCell>{booking.phone}</TableCell>
                <TableCell>{booking.date ? moment(booking.date).format('DD/MM/YYYY') : ''}</TableCell>
                <TableCell>{getReadableTime(booking.startTime)}</TableCell>
                <TableCell>{getReadableTime(booking.endTime)}</TableCell>
                <TableCell>{booking.days}</TableCell>
                <TableCell>{booking.fees} ر.ع</TableCell>
                <TableCell>{booking.isPaid ? '✓' : '✗'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleShowInvoice(booking)}>
                    <ReceiptIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openInvoice}
        onClose={handleCloseInvoice}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleCloseInvoice}>
              <CloseIcon />
            </IconButton>
          </Box>
          {selectedBooking && <Invoice booking={selectedBooking} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsTable;