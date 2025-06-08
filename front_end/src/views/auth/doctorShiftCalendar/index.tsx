import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { shiftService, appointmentService, userService } from '../../../services';

interface ShiftCalendarItem {
  maCaKham: number;
  ngayKham: string;
  gioBatDau: string;
  gioKetThuc: string;
  moTa: string;
  // Appointment info
  maLichKham?: number;
  maBenhNhan?: number;
  tenBenhNhan?: string;
  soDienThoai?: string;
  trieuChung?: string;
  trangThai?: string;
}

interface CalendarDay {
  date: Date;
  shifts: ShiftCalendarItem[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

function DoctorShiftCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<ShiftCalendarItem[]>([]);
  const [selectedShift, setSelectedShift] = useState<ShiftCalendarItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    if (user?.nhaSi) {
      fetchShifts();
    }
  }, [currentDate]);

  const fetchShifts = async () => {
    try {
      setLoading(true);

      // Get start and end dates for current view
      const { startDate, endDate } = getViewDateRange();

      // Fetch shifts for the date range
      const shiftsPromises = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        shiftsPromises.push(
          shiftService.all({
            ngayKham: dateStr,
            maNhaSi: currentUser?.nhaSi?.maNhaSi
          })
        );
      }

      const shiftsResponses = await Promise.all(shiftsPromises);
      const allShifts = shiftsResponses.flatMap(res => res.data);

      // Get appointments for these shifts
      const appointmentsRes = await appointmentService.all();
      const allAppointments = appointmentsRes.data;

      // Get patients
      const patientIds = [...new Set(allAppointments.map((a: any) => a.maBenhNhan))] as number[];
      const patientsPromises = patientIds.map(id => userService.get(id));
      const patientsResponses = await Promise.all(patientsPromises);
      const patients = patientsResponses.map(res => res.data);

      // Enrich shifts with appointment and patient data
      const enrichedShifts = allShifts.map((shift: any) => {
        const appointment = allAppointments.find((a: any) => a.maCaKham === shift.maCaKham);
        const patient = appointment ? patients.find(p => p.maNguoiDung === appointment.maBenhNhan) : null;

        return {
          ...shift,
          maLichKham: appointment?.maLichKham,
          maBenhNhan: appointment?.maBenhNhan,
          tenBenhNhan: patient?.hoTen,
          soDienThoai: patient?.soDienThoai,
          trieuChung: appointment?.trieuChung,
          trangThai: appointment?.trangThai
        };
      });

      setShifts(enrichedShifts);
    } catch (error) {
      toast.error('Không thể tải lịch ca khám');
    } finally {
      setLoading(false);
    }
  };

  const getViewDateRange = () => {
    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      return { startDate: startOfWeek, endDate: endOfWeek };
    } else {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return { startDate: startOfMonth, endDate: endOfMonth };
    }
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const { startDate, endDate } = getViewDateRange();

    if (viewMode === 'month') {
      // Add days from previous month
      const firstDayOfWeek = startDate.getDay();
      const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

      for (let i = mondayOffset; i > 0; i--) {
        const prevDate = new Date(startDate);
        prevDate.setDate(startDate.getDate() - i);
        days.push({
          date: prevDate,
          shifts: getShiftsForDate(prevDate),
          isCurrentMonth: false,
          isToday: isToday(prevDate)
        });
      }
    }

    // Add days of current period
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push({
        date: new Date(d),
        shifts: getShiftsForDate(d),
        isCurrentMonth: true,
        isToday: isToday(d)
      });
    }

    if (viewMode === 'month') {
      // Add days from next month to complete the grid
      const totalCells = Math.ceil(days.length / 7) * 7;
      let nextDate = new Date(endDate);
      nextDate.setDate(endDate.getDate() + 1);

      while (days.length < totalCells) {
        days.push({
          date: new Date(nextDate),
          shifts: getShiftsForDate(nextDate),
          isCurrentMonth: false,
          isToday: isToday(nextDate)
        });
        nextDate.setDate(nextDate.getDate() + 1);
      }
    }

    return days;
  };

  const getShiftsForDate = (date: Date): ShiftCalendarItem[] => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.ngayKham).toISOString().split('T')[0];
      return shiftDate === dateStr;
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getShiftStatusColor = (shift: ShiftCalendarItem) => {
    if (shift.maLichKham) {
      if (shift.trangThai === 'Hoàn thành') return 'success';
      if (shift.trangThai === 'Xác nhận') return 'primary';
      if (shift.trangThai === 'Chờ') return 'warning';
      if (shift.trangThai === 'Hủy') return 'danger';
    }
    return 'secondary'; // Empty shift
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const handleShiftClick = (shift: ShiftCalendarItem) => {
    setSelectedShift(shift);
    setShowDetailModal(true);
  };

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const calendarDays = generateCalendarDays();

  const currentPeriodText = viewMode === 'month'
    ? `Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`
    : `Tuần ${getWeekDates().start} - ${getWeekDates().end}`;

  function getWeekDates() {
    const { startDate, endDate } = getViewDateRange();
    return {
      start: startDate.toLocaleDateString('vi-VN'),
      end: endDate.toLocaleDateString('vi-VN')
    };
  }

  return (
    <div className="container-fluid">
      <ToastContainer />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Lịch ca khám của tôi</h4>
        <div className="d-flex align-items-center gap-3">
          {/* View Mode Toggle */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('month')}
            >
              Tháng
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('week')}
            >
              Tuần
            </button>
          </div>

          {/* Navigation */}
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => navigateDate('prev')}
            >
              <i className="icofont-arrow-left"></i>
            </button>
            <span className="fw-bold mx-3" style={{ minWidth: '200px', textAlign: 'center' }}>
              {currentPeriodText}
            </span>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigateDate('next')}
            >
              <i className="icofont-arrow-right"></i>
            </button>
          </div>

          <button
            className="btn btn-success"
            onClick={() => setCurrentDate(new Date())}
          >
            Hôm nay
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5>{shifts.length}</h5>
              <small>Tổng ca đăng ký</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h5>{shifts.filter(s => s.maLichKham && s.trangThai !== 'Hủy').length}</h5>
              <small>Ca có bệnh nhân</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h5>{shifts.filter(s => !s.maLichKham).length}</h5>
              <small>Ca trống</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h5>{shifts.filter(s => s.trangThai === 'Hoàn thành').length}</h5>
              <small>Ca hoàn thành</small>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="calendar-grid">
              {/* Week headers */}
              <div className="row mb-2">
                {weekDays.map((day, index) => (
                  <div key={index} className="col text-center fw-bold text-muted">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
                <div key={weekIndex} className="row mb-2">
                  {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                    <div key={dayIndex} className="col p-1">
                      <div
                        className={`calendar-day border rounded p-2 ${day.isCurrentMonth ? 'bg-white' : 'bg-light'
                          } ${day.isToday ? 'border-primary border-2' : ''}`}
                        style={{ minHeight: viewMode === 'month' ? '120px' : '150px' }}
                      >
                        {/* Day number */}
                        <div className={`day-number fw-bold mb-1 ${day.isCurrentMonth ? 'text-dark' : 'text-muted'
                          } ${day.isToday ? 'text-primary' : ''}`}>
                          {day.date.getDate()}
                        </div>

                        {/* Shifts for this day */}
                        <div className="shifts-container">
                          {day.shifts.map(shift => (
                            <div
                              key={shift.maCaKham}
                              className={`shift-item badge bg-${getShiftStatusColor(shift)} mb-1 d-block text-start cursor-pointer`}
                              onClick={() => handleShiftClick(shift)}
                              style={{
                                fontSize: '10px',
                                cursor: 'pointer',
                                whiteSpace: 'normal',
                                lineHeight: '1.2'
                              }}
                              title={`${formatTime(shift.gioBatDau)} - ${formatTime(shift.gioKetThuc)}${shift.tenBenhNhan ? ` • ${shift.tenBenhNhan}` : ''}`}
                            >
                              <div className="d-flex justify-content-between">
                                <small>{formatTime(shift.gioBatDau)}</small>
                                {shift.maLichKham && (
                                  <i className="icofont-user" style={{ fontSize: '8px' }}></i>
                                )}
                              </div>
                              {shift.tenBenhNhan && (
                                <div className="text-truncate" style={{ maxWidth: '100px' }}>
                                  {shift.tenBenhNhan}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="card mt-3">
        <div className="card-body">
          <h6 className="mb-3">Chú thích:</h6>
          <div className="row">
            <div className="col-md-2">
              <span className="badge bg-secondary me-2">Ca trống</span>
            </div>
            <div className="col-md-2">
              <span className="badge bg-warning me-2">Chờ xác nhận</span>
            </div>
            <div className="col-md-2">
              <span className="badge bg-primary me-2">Đã xác nhận</span>
            </div>
            <div className="col-md-2">
              <span className="badge bg-success me-2">Hoàn thành</span>
            </div>
            <div className="col-md-2">
              <span className="badge bg-danger me-2">Đã hủy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Detail Modal */}
      {showDetailModal && selectedShift && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="icofont-clock-time me-2"></i>
                  Chi tiết ca khám
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Ngày khám</label>
                    <p className="form-control-plaintext">
                      {new Date(selectedShift.ngayKham).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Thời gian</label>
                    <p className="form-control-plaintext">
                      {formatTime(selectedShift.gioBatDau)} - {formatTime(selectedShift.gioKetThuc)}
                    </p>
                  </div>

                  {selectedShift.moTa && (
                    <div className="col-12 mb-3">
                      <label className="form-label">Ghi chú ca khám</label>
                      <p className="form-control-plaintext">{selectedShift.moTa}</p>
                    </div>
                  )}

                  {selectedShift.maLichKham ? (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Bệnh nhân</label>
                        <p className="form-control-plaintext fw-bold">{selectedShift.tenBenhNhan}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Số điện thoại</label>
                        <p className="form-control-plaintext">{selectedShift.soDienThoai}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Trạng thái</label>
                        <p className="form-control-plaintext">
                          <span className={`badge bg-${getShiftStatusColor(selectedShift)}`}>
                            {selectedShift.trangThai}
                          </span>
                        </p>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">Triệu chứng</label>
                        <p className="form-control-plaintext">{selectedShift.trieuChung}</p>
                      </div>
                    </>
                  ) : (
                    <div className="col-12">
                      <div className="alert alert-info">
                        <i className="icofont-info-circle me-2"></i>
                        Ca khám này chưa có bệnh nhân đặt lịch.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .calendar-day {
          transition: all 0.2s ease;
        }
        .calendar-day:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .shift-item:hover {
          opacity: 0.8;
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

export default DoctorShiftCalendar;
