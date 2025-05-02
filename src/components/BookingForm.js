import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useBookings } from '../context/BookingContext';
import Invoice from './Invoice';

/** قائمة أنواع المناسبات مع أيقونات **/
const eventTypes = [
  { value: 'زواج', label: 'زواج', icon: '💍' },
  { value: 'اجتماع', label: 'اجتماع', icon: '👥' },
  { value: 'عمل', label: 'عمل', icon: '💼' },
  { value: 'أخرى', label: 'أخرى', icon: '📅' }
];

/** يحول التوقيت من صيغة AM-hour إلى ساعة عددية 0–23 **/
const timeToHour = timeString => {
  if (!timeString) return -1;
  const [period, hourStr] = timeString.split('-');
  let hour = parseInt(hourStr, 10);
  if (period === 'AM' && hour === 12) hour = 0;
  if (period === 'PM' && hour !== 12) hour += 12;
  return hour;
};

const BookingForm = ({ onSuccess, initialData = {}, isEditing = false }) => {
  const navigate = useNavigate();
  const { bookings, addBooking, updateBooking } = useBookings();

  const [formData, setFormData] = useState({
    eventType:       initialData.eventType || '',
    customEventType: initialData.customEventType || '',
    name:            initialData.name || '',
    phone:           initialData.phone || '',
    date:            initialData.date || '',
    startTime:       initialData.startTime || '',
    endTime:         initialData.endTime || '',
    days:            initialData.days || 1,
    fees:            initialData.fees || 0,
    isPaid:          initialData.isPaid || false
  });

  const [error, setError]                     = useState('');
  const [showInvoice, setShowInvoice]         = useState(false);
  const [currentBooking, setCurrentBooking]   = useState(null);
  const [openConflict, setOpenConflict]       = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');

  /** تحقق الحقول **/
  const validateForm = () => {
    if (!formData.eventType)                                      return 'يرجى اختيار نوع المناسبة';
    if (formData.eventType === 'أخرى' && !formData.customEventType) return 'يرجى إدخال نوع المناسبة';
    if (!formData.name)                                           return 'يرجى إدخال اسم صاحب المناسبة';
    if (!/^[972]\d{7}$/.test(formData.phone))                     return 'يرجى إدخال رقم هاتف عماني صالح';
    if (!formData.date)                                           return 'يرجى اختيار التاريخ';
    if (!formData.startTime)                                      return 'يرجى اختيار وقت البداية';
    if (!formData.endTime)                                        return 'يرجى اختيار وقت النهاية';
    if (formData.fees === null || formData.fees === undefined)    return 'يرجى إدخال المبلغ';
    return '';
  };

  /** عند الإرسال **/
  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    setConflictMessage('');
    const err = validateForm();
    if (err) {
      setError(err);
      return;
    }

    // تحقق من التعارض
    const newStart = timeToHour(formData.startTime);
    const newEnd   = timeToHour(formData.endTime);
    const conflict = bookings.find(b => {
      if (isEditing && b.id === initialData.id) return false;
      if (b.date !== formData.date)              return false;
      const start = timeToHour(b.startTime);
      const end   = timeToHour(b.endTime);
      return newStart < end && newEnd > start;
    });
    if (conflict) {
      setConflictMessage(`يوجد حجز متداخل (${conflict.startTime}–${conflict.endTime}). اختر وقتًا آخر.`);
      setOpenConflict(true);
      return;
    }

    const payload = {
      ...formData,
      eventType: formData.eventType === 'أخرى' ? formData.customEventType : formData.eventType
    };

    if (isEditing) {
      updateBooking({ ...payload, id: initialData.id, createdAt: initialData.createdAt });
      onSuccess?.();
    } else {
      const newB = { ...payload, id: Date.now().toString(), createdAt: new Date().toISOString() };
      addBooking(newB);
      setCurrentBooking(newB);
      setShowInvoice(true);
    }
  };

  const handleCloseConflict = () => setOpenConflict(false);
  const handleNew = () => {
    setShowInvoice(false);
    setError('');
    setFormData({
      eventType: '',
      customEventType: '',
      name: '',
      phone: '',
      date: '',
      startTime: '',
      endTime: '',
      days: 1,
      fees: 0,
      isPaid: false
    });
  };

  // عرض الفاتورة بعد الإنشاء
  if (showInvoice && currentBooking) {
    return (
      <>
        <Invoice booking={currentBooking} />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
          <Button variant="contained" onClick={handleNew}>حجز جديد</Button>
          <Button variant="outlined" onClick={() => navigate('/bookings')}>الحجوزات</Button>
          <Button variant="outlined" onClick={() => navigate('/admin')}>لوحة التحكم</Button>
        </Box>
      </>
    );
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 4, direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
        {isEditing ? 'تعديل الحجز' : 'إنشاء حجز جديد'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>

          {/* نوع المناسبة */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>نوع المناسبة</InputLabel>
              <Select
                value={formData.eventType}
                onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                label="نوع المناسبة"
                required
                sx={{ '& .MuiSelect-select': { textAlign: 'right' } }}
              >
                {eventTypes.map(t => (
                  <MenuItem key={t.value} value={t.value} sx={{ textAlign: 'right' }}>
                    {t.icon} {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* اسم صاحب المناسبة */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="اسم صاحب المناسبة"
              fullWidth
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              sx={{ '& .MuiInputBase-input': { textAlign: 'right' } }}
            />
          </Grid>

          {/* تفصيل أخرى */}
          {formData.eventType === 'أخرى' && (
            <Grid item xs={12}>
              <TextField
                label="نوع المناسبة (تفصيل)"
                fullWidth
                value={formData.customEventType}
                onChange={e => setFormData({ ...formData, customEventType: e.target.value })}
                required
                sx={{ '& .MuiInputBase-input': { textAlign: 'right' } }}
              />
            </Grid>
          )}

          {/* رقم الهاتف */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="رقم الهاتف"
              fullWidth
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
              inputProps={{ maxLength: 8 }}
              helperText="8 أرقام تبدأ بـ 9 أو 7 أو 2"
              sx={{ 
                '& .MuiInputBase-input': { textAlign: 'right' },
                '& .MuiFormHelperText-root': { textAlign: 'right' }
              }}
            />
          </Grid>

          {/* التاريخ */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="التاريخ"
              type="date"
              fullWidth
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiInputBase-input': { textAlign: 'right' } }}
            />
          </Grid>

          {/* وقت البداية */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>وقت البداية</InputLabel>
              <Select
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                label="وقت البداية"
                required
                sx={{ '& .MuiSelect-select': { textAlign: 'right' } }}
              >
                {['AM-8','AM-9','AM-10','AM-11','PM-12','PM-1','PM-2','PM-3','PM-4','PM-5','PM-6','PM-7','PM-8','PM-9','PM-10']
                  .map(v => (
                    <MenuItem key={v} value={v} sx={{ textAlign: 'right' }}>
                      {v.split('-')[1]}:00 {v.startsWith('AM') ? 'صباحاً' : v.includes('PM-12') ? 'ظهراً' : 'مساءً'}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {/* وقت النهاية */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>وقت النهاية</InputLabel>
              <Select
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                label="وقت النهاية"
                required
                sx={{ '& .MuiSelect-select': { textAlign: 'right' } }}
              >
                {['AM-9','AM-10','AM-11','PM-12','PM-1','PM-2','PM-3','PM-4','PM-5','PM-6','PM-7','PM-8','PM-9','PM-10','PM-11']
                  .map(v => (
                    <MenuItem key={v} value={v} sx={{ textAlign: 'right' }}>
                      {v.split('-')[1]}:00 {v.startsWith('AM') ? 'صباحاً' : v.includes('PM-12') ? 'ظهراً' : 'مساءً'}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {/* المبلغ */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="المبلغ (ر.ع)"
              type="number"
              fullWidth
              value={formData.fees}
              onChange={e => setFormData({ ...formData, fees: parseFloat(e.target.value) || 0 })}
              InputProps={{ 
                startAdornment: <InputAdornment position="start">ر.ع</InputAdornment> 
              }}
              required
              sx={{ '& .MuiInputBase-input': { textAlign: 'right' } }}
            />
          </Grid>

          {/* عدد الأيام */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="عدد الأيام"
              type="number"
              fullWidth
              value={formData.days}
              onChange={e => {
                const days = Math.max(1, Math.min(7, parseInt(e.target.value) || 1));
                setFormData({ ...formData, days });
              }}
              InputProps={{ 
                startAdornment: <InputAdornment position="start">أيام</InputAdornment> 
              }}
              required
              sx={{ '& .MuiInputBase-input': { textAlign: 'right' } }}
            />
          </Grid>

          {/* تم الدفع */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isPaid}
                  onChange={e => setFormData({ ...formData, isPaid: e.target.checked })}
                />
              }
              label="تم الدفع"
              sx={{ mr: 0, ml: 'auto' }}
            />
          </Grid>

          {/* زر الإرسال */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth>
              {isEditing ? 'تحديث الحجز' : 'إنشاء الحجز'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* نافذة تعارض المواعيد */}
      <Dialog open={openConflict} onClose={handleCloseConflict}>
        <DialogTitle>تعارض في المواعيد</DialogTitle>
        <DialogContent>
          <DialogContentText>{conflictMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConflict}>حسناً</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BookingForm;
