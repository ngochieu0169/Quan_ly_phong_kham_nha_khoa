import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { shiftService, userServiceExtended, appointmentService, clinicService } from '../../../services';

interface Doctor {
    maNguoiDung: number;
    hoTen: string;
    eMail: string;
    soDienThoai: string;
    bacsiData?: {
        maNhaSi: string;
        maPhongKham: number;
        kinhNghiem: string;
        chucVu: string;
    };
}

interface Shift {
    maCaKham: number;
    ngayKham: string;
    gioBatDau: string;
    gioKetThuc: string;
    maNhaSi: string;
    moTa?: string;
    tenNhaSi?: string;
    // Appointment info
    maLichKham?: number;
    tenBenhNhan?: string;
    soDienThoai?: string;
    trangThai?: string;
}

interface Clinic {
    maPhongKham: number;
    tenPhongKham: string;
    diaChi: string;
}

interface WeekDay {
    date: Date;
    dateStr: string;
    dayName: string;
    shifts: Shift[];
}

function DoctorScheduleManager() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [selectedClinic, setSelectedClinic] = useState<number>(0);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [newShiftForm, setNewShiftForm] = useState({
        gioBatDau: '',
        gioKetThuc: '',
        moTa: ''
    });

    const timeSlots = [
        { start: '08:00', end: '10:00', label: 'Ca sáng sớm' },
        { start: '10:00', end: '12:00', label: 'Ca sáng muộn' },
        { start: '13:00', end: '15:00', label: 'Ca chiều sớm' },
        { start: '15:00', end: '17:00', label: 'Ca chiều muộn' },
        { start: '17:00', end: '19:00', label: 'Ca tối' }
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (doctors.length > 0) {
            generateWeekSchedule();
        }
    }, [currentWeek, selectedDoctor, selectedClinic, doctors]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [doctorsRes, clinicsRes] = await Promise.all([
                userServiceExtended.getFullList({ maQuyen: 2 }), // Doctors
                clinicService.all()
            ]);

            setDoctors(doctorsRes.data);
            setClinics(clinicsRes.data);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const generateWeekSchedule = async () => {
        try {
            setLoading(true);
            const weekStart = getWeekStart(currentWeek);
            const days: WeekDay[] = [];

            // Generate 7 days from Monday
            for (let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + i);

                const dayName = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'][i];

                days.push({
                    date: new Date(date),
                    dateStr: date.toISOString().split('T')[0],
                    dayName,
                    shifts: []
                });
            }

            // Fetch shifts for the week
            const shiftsPromises = days.map(day =>
                shiftService.all({ ngayKham: day.dateStr })
            );

            const shiftsResponses = await Promise.all(shiftsPromises);

            // Get appointments for shifts
            const appointmentsRes = await appointmentService.all();
            const appointments = appointmentsRes.data;

            days.forEach((day, index) => {
                let dayShifts = shiftsResponses[index].data || [];

                // Filter by doctor if selected
                if (selectedDoctor) {
                    dayShifts = dayShifts.filter((shift: any) => shift.maNhaSi === selectedDoctor);
                }

                // Filter by clinic if selected
                if (selectedClinic) {
                    const clinicDoctors = doctors.filter(doc =>
                        doc.bacsiData?.maPhongKham === selectedClinic
                    );
                    const clinicDoctorIds = clinicDoctors.map(doc => doc.bacsiData?.maNhaSi);
                    dayShifts = dayShifts.filter((shift: any) =>
                        clinicDoctorIds.includes(shift.maNhaSi)
                    );
                }

                // Enrich shifts with doctor and appointment info
                day.shifts = dayShifts.map((shift: any) => {
                    const doctor = doctors.find(doc => doc.bacsiData?.maNhaSi === shift.maNhaSi);
                    const appointment = appointments.find((apt: any) => apt.maCaKham === shift.maCaKham);

                    return {
                        ...shift,
                        tenNhaSi: doctor?.hoTen || 'N/A',
                        maLichKham: appointment?.maLichKham,
                        tenBenhNhan: appointment?.tenBenhNhan,
                        soDienThoai: appointment?.soDienThoai,
                        trangThai: appointment?.trangThai
                    };
                });

                // Sort shifts by time
                day.shifts.sort((a, b) => a.gioBatDau.localeCompare(b.gioBatDau));
            });

            setWeekDays(days);
        } catch (error) {
            toast.error('Không thể tải lịch làm việc');
        } finally {
            setLoading(false);
        }
    };

    const getWeekStart = (date: Date) => {
        const result = new Date(date);
        const day = result.getDay();
        const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Monday
        result.setDate(diff);
        return result;
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentWeek);
        newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeek(newDate);
    };

    const handleCreateShift = async () => {
        if (!selectedDoctor || !newShiftForm.gioBatDau || !newShiftForm.gioKetThuc) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            const shiftData = {
                ngayKham: selectedDate,
                gioBatDau: newShiftForm.gioBatDau + ':00',
                gioKetThuc: newShiftForm.gioKetThuc + ':00',
                moTa: newShiftForm.moTa,
                maNhaSi: selectedDoctor
            };

            await shiftService.create(shiftData);
            toast.success('Tạo ca khám thành công');
            setShowCreateModal(false);
            setNewShiftForm({ gioBatDau: '', gioKetThuc: '', moTa: '' });
            setSelectedDate('');
            generateWeekSchedule();
        } catch (error) {
            toast.error('Tạo ca khám thất bại');
        }
    };

    const handleDeleteShift = async (shiftId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa ca khám này?')) return;

        try {
            await shiftService.delete(shiftId);
            toast.success('Xóa ca khám thành công');
            generateWeekSchedule();
        } catch (error) {
            toast.error('Xóa ca khám thất bại');
        }
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    const getShiftStatusColor = (shift: Shift) => {
        if (shift.maLichKham) {
            switch (shift.trangThai) {
                case 'Chờ': return 'warning';
                case 'Đã đặt': return 'info';
                case 'Đã đến': return 'primary';
                case 'Đang khám': return 'success';
                case 'Hoàn thành': return 'secondary';
                case 'Hủy': return 'danger';
                default: return 'info';
            }
        }
        return 'light'; // Empty shift
    };

    const getFilteredDoctors = () => {
        if (selectedClinic) {
            return doctors.filter(doc => doc.bacsiData?.maPhongKham === selectedClinic);
        }
        return doctors;
    };

    const weekStartDate = getWeekStart(currentWeek);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    if (loading && doctors.length === 0) {
        return (
            <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Cập nhật lịch làm việc bác sĩ</h4>
                    <p className="text-muted mb-0">Theo dõi và cập nhật ca khám của các bác sĩ</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row align-items-end">
                        <div className="col-md-3">
                            <label className="form-label">Phòng khám</label>
                            <select
                                className="form-select"
                                value={selectedClinic}
                                onChange={(e) => setSelectedClinic(parseInt(e.target.value))}
                            >
                                <option value={0}>Tất cả phòng khám</option>
                                {clinics.map(clinic => (
                                    <option key={clinic.maPhongKham} value={clinic.maPhongKham}>
                                        {clinic.tenPhongKham}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Bác sĩ</label>
                            <select
                                className="form-select"
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                            >
                                <option value="">Tất cả bác sĩ</option>
                                {getFilteredDoctors().map(doctor => (
                                    <option key={doctor.maNguoiDung} value={doctor.bacsiData?.maNhaSi}>
                                        {doctor.hoTen}
                                        {selectedClinic === 0 && doctor.bacsiData?.maPhongKham && (
                                            ` - ${clinics.find(c => c.maPhongKham === doctor.bacsiData?.maPhongKham)?.tenPhongKham}`
                                        )}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Tuần</label>
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigateWeek('prev')}
                                >
                                    <i className="icofont-arrow-left"></i>
                                </button>
                                <div className="text-center flex-grow-1">
                                    <strong>
                                        {weekStartDate.toLocaleDateString('vi-VN')} - {weekEndDate.toLocaleDateString('vi-VN')}
                                    </strong>
                                </div>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigateWeek('next')}
                                >
                                    <i className="icofont-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <button
                                className="btn btn-primary w-100"
                                onClick={() => setCurrentWeek(new Date())}
                            >
                                Tuần hiện tại
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Schedule */}
            <div className="card">
                <div className="card-header">
                    <h6 className="mb-0">
                        <i className="icofont-calendar me-2"></i>Lịch tuần
                    </h6>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '14%' }} className="text-center">Thứ 2</th>
                                        <th style={{ width: '14%' }} className="text-center">Thứ 3</th>
                                        <th style={{ width: '14%' }} className="text-center">Thứ 4</th>
                                        <th style={{ width: '14%' }} className="text-center">Thứ 5</th>
                                        <th style={{ width: '14%' }} className="text-center">Thứ 6</th>
                                        <th style={{ width: '14%' }} className="text-center">Thứ 7</th>
                                        <th style={{ width: '16%' }} className="text-center">Chủ nhật</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {weekDays.map((day, index) => (
                                            <td key={index} className="align-top p-2" style={{ minHeight: '400px' }}>
                                                <div className="text-center mb-3">
                                                    <div className="fw-bold">
                                                        {day.date.getDate()}/{day.date.getMonth() + 1}
                                                    </div>
                                                    {selectedDoctor && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary mt-1"
                                                            onClick={() => {
                                                                setSelectedDate(day.dateStr);
                                                                setShowCreateModal(true);
                                                            }}
                                                        >
                                                            <i className="icofont-plus"></i>
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="shifts-container">
                                                    {day.shifts.map(shift => (
                                                        <div
                                                            key={shift.maCaKham}
                                                            className={`card mb-2 border-${getShiftStatusColor(shift)}`}
                                                            style={{ fontSize: '11px' }}
                                                        >
                                                            <div className="card-body p-2">
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <div className="flex-grow-1">
                                                                        <div className="fw-bold text-primary">
                                                                            {formatTime(shift.gioBatDau)} - {formatTime(shift.gioKetThuc)}
                                                                        </div>
                                                                        <div className="small text-muted">
                                                                            <i className="icofont-doctor me-1"></i>
                                                                            {shift.tenNhaSi}
                                                                        </div>
                                                                        {shift.maLichKham && (
                                                                            <div className="small">
                                                                                <strong>{shift.tenBenhNhan}</strong>
                                                                                <div className="text-muted">{shift.soDienThoai}</div>
                                                                                <span className={`badge bg-${getShiftStatusColor(shift)} mt-1`}>
                                                                                    {shift.trangThai}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {shift.moTa && (
                                                                            <div className="small text-muted mt-1">
                                                                                {shift.moTa}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {!shift.maLichKham && (
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() => handleDeleteShift(shift.maCaKham)}
                                                                            title="Xóa ca khám"
                                                                        >
                                                                            <i className="icofont-trash" style={{ fontSize: '10px' }}></i>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {day.shifts.length === 0 && (
                                                        <div className="text-center text-muted">
                                                            <small>Không có ca khám</small>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="card mt-4">
                <div className="card-body">
                    <h6 className="mb-3">Chú thích</h6>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center mb-2">
                                <div className="border border-light bg-light px-2 py-1 me-2" style={{ fontSize: '11px' }}>
                                    Ca trống
                                </div>
                                <span>Ca khám chưa có bệnh nhân đặt lịch</span>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                                <span className="badge bg-warning me-2">Chờ</span>
                                <span>Lịch chờ xác nhận</span>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                                <span className="badge bg-info me-2">Đã đặt</span>
                                <span>Đã xác nhận lịch hẹn</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex align-items-center mb-2">
                                <span className="badge bg-primary me-2">Đã đến</span>
                                <span>Bệnh nhân đã đến</span>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                                <span className="badge bg-success me-2">Đang khám</span>
                                <span>Đang thực hiện khám</span>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                                <span className="badge bg-secondary me-2">Hoàn thành</span>
                                <span>Đã hoàn thành khám</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Shift Modal */}
            {showCreateModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="icofont-plus me-2"></i>Tạo ca khám mới
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCreateModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Ngày khám</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={selectedDate}
                                        disabled
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Bác sĩ</label>
                                    <select
                                        className="form-select"
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                    >
                                        <option value="">-- Chọn bác sĩ --</option>
                                        {getFilteredDoctors().map(doctor => (
                                            <option key={doctor.maNguoiDung} value={doctor.bacsiData?.maNhaSi}>
                                                {doctor.hoTen}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label">Giờ bắt đầu *</label>
                                        <select
                                            className="form-select"
                                            value={newShiftForm.gioBatDau}
                                            onChange={(e) => setNewShiftForm({ ...newShiftForm, gioBatDau: e.target.value })}
                                        >
                                            <option value="">-- Chọn giờ --</option>
                                            {timeSlots.map(slot => (
                                                <option key={slot.start} value={slot.start}>
                                                    {slot.start} ({slot.label})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">Giờ kết thúc *</label>
                                        <select
                                            className="form-select"
                                            value={newShiftForm.gioKetThuc}
                                            onChange={(e) => setNewShiftForm({ ...newShiftForm, gioKetThuc: e.target.value })}
                                        >
                                            <option value="">-- Chọn giờ --</option>
                                            {timeSlots.map(slot => (
                                                <option key={slot.end} value={slot.end}>
                                                    {slot.end}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Ghi chú</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={newShiftForm.moTa}
                                        onChange={(e) => setNewShiftForm({ ...newShiftForm, moTa: e.target.value })}
                                        placeholder="Ghi chú về ca khám (tùy chọn)..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreateShift}
                                >
                                    <i className="icofont-check me-2"></i>Tạo ca khám
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorScheduleManager; 