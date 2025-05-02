import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton
} from '@mui/material';
import { useBookings } from '../context/BookingContext';
import moment from 'moment';
import 'moment/locale/ar';
import PrintIcon from '@mui/icons-material/Print';
import Invoice from './Invoice';

const BookingList = () => {
  const { bookings } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // تهيئة moment للغة العربية
  moment.locale('ar');
  
  const handlePrintInvoice = (booking) => {
    setSelectedBooking(booking);
  };
  
  const handleCloseInvoice = () => {
    setSelectedBooking(null);
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        قائمة الحجوزات
      </Typography>
      
      {selectedBooking && (
        <Box sx={{ mb: 4 }}>
          <Invoice booking={selectedBooking} />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="contained" onClick={handleCloseInvoice}>
              العودة إلى القائمة
            </Button>
          </Box>
        </Box>
      )}
      
      {!selectedBooking && (
        bookings.length === 0 ? (
          <Typography variant="body1" align="center">
            لا توجد حجوزات حالياً
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نوع المناسبة</TableCell>
                  <TableCell>الاسم</TableCell>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>الوقت</TableCell>
                  <TableCell>المبلغ</TableCell>
                  <TableCell>حالة الدفع</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.eventType}</TableCell>
                    <TableCell>{booking.name}</TableCell>
                    <TableCell sx={{ 
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      minWidth: 150 
                    }}>
                      {moment(booking.date).format('dddd، D MMMM YYYY')}
                    </TableCell>
                    <TableCell>
                      {booking.startTime} - {booking.endTime}
                    </TableCell>
                    <TableCell>{booking.fees} ر.ع</TableCell>
                    <TableCell>
                      {booking.isPaid ? 'تم الدفع' : 'لم يتم الدفع'}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handlePrintInvoice(booking)}
                        title="طباعة الفاتورة"
                      >
                        <PrintIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
    </Box>
  );
};

export default BookingList;