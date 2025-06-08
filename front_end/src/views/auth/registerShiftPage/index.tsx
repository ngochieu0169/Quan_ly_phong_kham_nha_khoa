import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { shiftService } from '../../../services';

interface Shift {
  maCaKham: number;
  ngayKham: string;
  gioBatDau: string;
  gioKetThuc: string;
  moTa: string;
  maNhaSi: string | null;
  trangThaiLich?: string;
  maLichKham?: number;
}

interface ShiftFormData {
  ngayKham: string;
  gioBatDau: string;
  gioKetThuc: string;
  moTa: string;
}

const TIME_SLOTS = [
  { start: '08:00', end: '10:00', label: 'Ca sáng sớm (8:00 - 10:00)' },
  { start: '10:00', end: '12:00', label: 'Ca sáng muộn (10:00 - 12:00)' },
  { start: '13:00', end: '15:00', label: 'Ca chiều sớm (13:00 - 15:00)' },
  { start: '15:00', end: '17:00', label: 'Ca chiều muộn (15:00 - 17:00)' },
];

function RegisterShiftPage() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [formData, setFormData] = useState<ShiftFormData>({
    ngayKham: '',
    gioBatDau: '',
    gioKetThuc: '',
    moTa: ''
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchWeekShifts();
  }, [selectedWeek]);

  const fetchWeekShifts = async () => {
    try {
      const weekDates = getWeekDates(selectedWeek);
      const allShifts: Shift[] = [];

      for (const date of weekDates) {
        const dateStr = date.toISOString().split('T')[0];
        const res = await shiftService.all({ ngayKham: dateStr });
        allShifts.push(...res.data);
      }

      setShifts(allShifts);
    } catch (error) {
      toast.error('Không thể tải danh sách ca khám');
    }
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - date.getDay() + 1); // Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setFormData({
      ngayKham: dateStr,
      gioBatDau: '',
      gioKetThuc: '',
      moTa: ''
    });
    setShowModal(true);
  };

  const handleTimeSlotSelect = (slot: { start: string; end: string }) => {
    setFormData({
      ...formData,
      gioBatDau: slot.start,
      gioKetThuc: slot.end
    });
  };

  const handleRegisterShift = async () => {
    if (!currentUser?.nhaSi) {
      toast.error('Không tìm thấy thông tin nha sĩ');
      return;
    }

    if (!formData.ngayKham || !formData.gioBatDau || !formData.gioKetThuc) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const [day, month, year] = formData.ngayKham.split('-').reverse();
      const shiftData = {
        ngayKham: `${day}-${month}-${year}`,
        gioBatDau: formData.gioBatDau + ':00',
        gioKetThuc: formData.gioKetThuc + ':00',
        moTa: formData.moTa,
        maNhaSi: currentUser.nhaSi.maNhaSi
      };

      await shiftService.create(shiftData);
      toast.success('Đăng ký ca khám thành công');
      setShowModal(false);
      fetchWeekShifts();
    } catch (error) {
      toast.error('Đăng ký ca khám thất bại');
    }
  };

  const handleCancelShift = async (shiftId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy ca khám này?')) return;

    try {
      await shiftService.delete(shiftId);
      toast.success('Hủy ca khám thành công');
      fetchWeekShifts();
    } catch (error) {
      toast.error('Hủy ca khám thất bại');
    }
  };

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.ngayKham).toISOString().split('T')[0];
      return shiftDate === dateStr && shift.maNhaSi === currentUser?.nhaSi?.maNhaSi;
    });
  };

  const isSlotRegistered = (date: Date, timeSlot: { start: string; end: string }) => {
    const dayShifts = getShiftsForDate(date);
    return dayShifts.some(shift =>
      shift.gioBatDau.substring(0, 5) === timeSlot.start &&
      shift.gioKetThuc.substring(0, 5) === timeSlot.end
    );
  };

  const getRegisteredShift = (date: Date, timeSlot: { start: string; end: string }) => {
    const dayShifts = getShiftsForDate(date);
    return dayShifts.find(shift =>
      shift.gioBatDau.substring(0, 5) === timeSlot.start &&
      shift.gioKetThuc.substring(0, 5) === timeSlot.end
    );
  };

  const weekDates = getWeekDates(selectedWeek);
  const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newDate);
  };

  return (
    <div className="container-fluid">
      <ToastContainer />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Đăng ký ca khám</h4>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-primary me-2"
            onClick={() => navigateWeek('prev')}
          >
            <i className="icofont-arrow-left"></i>
          </button>
          <span className="fw-bold mx-3">
            Tuần {weekDates[0].toLocaleDateString('vi-VN')} - {weekDates[6].toLocaleDateString('vi-VN')}
          </span>
          <button
            className="btn btn-outline-primary ms-2"
            onClick={() => navigateWeek('next')}
          >
            <i className="icofont-arrow-right"></i>
          </button>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="card">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="icofont-calendar me-2"></i>Lịch đăng ký ca khám
          </h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Ca khám</th>
                  {weekDays.map((day, index) => (
                    <th key={index} className="text-center">
                      <div>{day}</div>
                      <div className="text-muted small">
                        {weekDates[index].getDate()}/{weekDates[index].getMonth() + 1}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot, slotIndex) => (
                  <tr key={slotIndex}>
                    <td className="fw-bold text-primary">
                      <div>{timeSlot.start} - {timeSlot.end}</div>
                    </td>
                    {weekDates.map((date, dateIndex) => {
                      const isRegistered = isSlotRegistered(date, timeSlot);
                      const shift = getRegisteredShift(date, timeSlot);
                      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                      return (
                        <td key={dateIndex} className="text-center position-relative" style={{ height: '80px' }}>
                          {isRegistered ? (
                            <div className="h-100 d-flex flex-column justify-content-center">
                              <div className="badge bg-success mb-1">Đã đăng ký</div>
                              {shift?.maLichKham ? (
                                <small className="text-danger">Đã có lịch hẹn</small>
                              ) : (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleCancelShift(shift!.maCaKham)}
                                  title="Hủy ca khám"
                                >
                                  <i className="icofont-close"></i>
                                </button>
                              )}
                              {shift?.moTa && (
                                <small className="text-muted">{shift.moTa}</small>
                              )}
                            </div>
                          ) : (
                            <div className="h-100 d-flex align-items-center justify-content-center">
                              {!isPast ? (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    setFormData({
                                      ngayKham: date.toISOString().split('T')[0],
                                      gioBatDau: timeSlot.start,
                                      gioKetThuc: timeSlot.end,
                                      moTa: ''
                                    });
                                    setShowModal(true);
                                  }}
                                  title="Đăng ký ca khám"
                                >
                                  <i className="icofont-plus"></i>
                                </button>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h4>{shifts.filter(s => s.maNhaSi === currentUser?.nhaSi?.maNhaSi).length}</h4>
              <small>Ca đã đăng ký tuần này</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h4>{shifts.filter(s => s.maNhaSi === currentUser?.nhaSi?.maNhaSi && s.maLichKham).length}</h4>
              <small>Ca có bệnh nhân đặt</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h4>{shifts.filter(s => s.maNhaSi === currentUser?.nhaSi?.maNhaSi && !s.maLichKham).length}</h4>
              <small>Ca trống</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h4>{28 - shifts.filter(s => s.maNhaSi === currentUser?.nhaSi?.maNhaSi).length}</h4>
              <small>Có thể đăng ký thêm</small>
            </div>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Đăng ký ca khám</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Ngày khám</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.ngayKham}
                    onChange={(e) => setFormData({ ...formData, ngayKham: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Chọn ca khám</label>
                  <div className="d-grid gap-2">
                    {TIME_SLOTS.map(slot => (
                      <button
                        key={`${slot.start}-${slot.end}`}
                        type="button"
                        className={`btn btn-outline-primary ${formData.gioBatDau === slot.start && formData.gioKetThuc === slot.end
                          ? 'active'
                          : ''
                          }`}
                        onClick={() => handleTimeSlotSelect(slot)}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label">Giờ bắt đầu</label>
                    <input
                      type="time"
                      className="form-control"
                      value={formData.gioBatDau}
                      onChange={(e) => setFormData({ ...formData, gioBatDau: e.target.value })}
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label">Giờ kết thúc</label>
                    <input
                      type="time"
                      className="form-control"
                      value={formData.gioKetThuc}
                      onChange={(e) => setFormData({ ...formData, gioKetThuc: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.moTa}
                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                    placeholder="Ghi chú về ca khám (tùy chọn)..."
                  ></textarea>
                </div>

                <div className="alert alert-info">
                  <i className="icofont-info-circle me-2"></i>
                  Sau khi đăng ký, bệnh nhân có thể đặt lịch khám trong ca này.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={handleRegisterShift}>
                  <i className="icofont-check me-2"></i>Đăng ký ca khám
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterShiftPage;
