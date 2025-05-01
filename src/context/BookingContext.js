import React, { createContext, useState, useContext, useEffect } from 'react';

const BookingContext = createContext();

export const useBookings = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState(() => {
    const savedBookings = localStorage.getItem('bookings');
    if (savedBookings) {
      return JSON.parse(savedBookings);
    }
    return [];
  });

  // حفظ الحجوزات في التخزين المحلي عند تغييرها
  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      _style: { // إضافة ستايلات عرض للحجز
        borderLeft: '4px solid #3f51b5',
        backgroundColor: '#f5f5f5',
        padding: '16px',
        marginBottom: '16px',
        borderRadius: '4px'
      }
    };
    setBookings([...bookings, newBooking]);
    return newBooking;
  };

  const deleteBooking = (id) => {
    setBookings(bookings.filter(booking => booking.id !== id));
  };
  
  // إضافة دالة تحديث الحجز
  const updateBooking = (updatedBooking) => {
    setBookings(bookings.map(booking => 
      booking.id === updatedBooking.id ? updatedBooking : booking
    ));
  };

  const checkBookingOverlap = (newBooking) => {
    // تحويل التاريخ إلى سلسلة نصية للمقارنة
    const newBookingDateStr = newBooking.date ? newBooking.date.format('YYYY-MM-DD') : '';
    
    // التحقق من وجود حجز في نفس التاريخ
    const overlappingBooking = bookings.find(booking => {
      // إذا كان التاريخ غير محدد، نتخطى هذا الحجز
      if (!booking.date || !newBookingDateStr) return false;
      
      // تحويل تاريخ الحجز الموجود إلى سلسلة نصية
      let bookingDateStr;
      if (typeof booking.date === 'string') {
        // إذا كان التاريخ مخزنًا كسلسلة نصية
        bookingDateStr = booking.date.split('T')[0];
      } else if (booking.date.format) {
        // إذا كان التاريخ كائن moment
        bookingDateStr = booking.date.format('YYYY-MM-DD');
      } else {
        // إذا كان التاريخ بتنسيق آخر
        const date = new Date(booking.date);
        bookingDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      
      // التحقق من تطابق التاريخ
      if (bookingDateStr !== newBookingDateStr) return false;
      
      // التحقق من تداخل الأوقات
      const newStartTime = newBooking.startTime;
      const newEndTime = newBooking.endTime;
      const existingStartTime = booking.startTime;
      const existingEndTime = booking.endTime;
      
      // إذا كانت الأوقات غير محددة، نتخطى التحقق
      if (!newStartTime || !newEndTime || !existingStartTime || !existingEndTime) return false;
      
      // استخراج الساعات للمقارنة
      const getHour = (timeStr) => {
        if (typeof timeStr === 'string' && timeStr.includes('-')) {
          const [period, hourStr] = timeStr.split('-');
          const hour = parseInt(hourStr);
          return period === 'AM' ? hour : (hour === 12 ? 12 : hour + 12);
        }
        return 0; // قيمة افتراضية في حالة عدم توفر التنسيق المتوقع
      };
      
      const newStart = getHour(newStartTime);
      const newEnd = getHour(newEndTime);
      const existingStart = getHour(existingStartTime);
      const existingEnd = getHour(existingEndTime);
      
      // التحقق من تداخل الأوقات
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
    
    return !!overlappingBooking;
  };

  return (
    <BookingContext.Provider value={{ 
      bookings, 
      addBooking, 
      deleteBooking,
      updateBooking,
      checkBookingOverlap
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext;