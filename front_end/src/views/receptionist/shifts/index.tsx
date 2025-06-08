import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { shiftService, dentistService, appointmentService } from '../../../services';

interface Shift {
    maCaKham: number;
    ngayKham: string;
    gioBatDau: string;
    gioKetThuc: string;
    moTa: string;
    maNhaSi: string | null;
    tenNhaSi?: string;
    trangThaiLich?: string;
    maLichKham?: number;
    tenBenhNhan?: string;
    soDienThoai?: string;
}

interface Dentist {
    maNhaSi: string;
    hoTen: string;
    maPhongKham: number;
    kinhNghiem: string;
    chucVu: string;
}

interface ShiftForm {
    ngayKham: string;
    gioBatDau: string;
    gioKetThuc: string;
    moTa: string;
    maNhaSi: string | null;
}

function ReceptionistShifts() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showModal, setShowModal] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);

    const [formData, setFormData] = useState<ShiftForm>({
        ngayKham: '',
        gioBatDau: '',
        gioKetThuc: '',
        moTa: '',
        maNhaSi: null
    });

    const timeSlots = [
        { start: '08:00', end: '10:00', label: 'Ca sáng sớm' },
        { start: '10:00', end: '12:00', label: 'Ca sáng muộn' },
        { start: '13:00', end: '15:00', label: 'Ca chiều sớm' },
        { start: '15:00', end: '17:00', label: 'Ca chiều muộn' },
        { start: '17:00', end: '19:00', label: 'Ca tối' }
    ];

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [shiftRes, dentistRes, appointmentRes] = await Promise.all([
                shiftService.all(),
                dentistService.all(),
                appointmentService.all()
            ]);

            const shifts = shiftRes.data;
            const dentists = dentistRes.data;
            const appointments = appointmentRes.data;

            // Filter shifts by selected date
            const dayShifts = shifts.filter((shift: any) =>
                shift.ngayKham === selectedDate
            );

            // Enrich shifts with dentist and appointment info
            const enrichedShifts = dayShifts.map((shift: any) => {
                const dentist = dentists.find((d: any) => d.maNhaSi === shift.maNhaSi);
                const appointment = appointments.find((a: any) => a.maCaKham === shift.maCaKham);

                return {
                    ...shift,
                    tenNhaSi: dentist?.hoTen,
                    trangThaiLich: appointment?.trangThai,
                    maLichKham: appointment?.maLichKham,
                    tenBenhNhan: appointment?.tenBenhNhan,
                    soDienThoai: appointment?.soDienThoai
                };
            });

            setShifts(enrichedShifts);
            setDentists(dentists);
        } catch (error) {
            toast.error('Không thể tải dữ liệu ca khám');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingShift) {
                await shiftService.update(editingShift.maCaKham, formData);
                toast.success('Cập nhật ca khám thành công');
            } else {
                await shiftService.create(formData);
                toast.success('Tạo ca khám thành công');
            }

            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleEdit = (shift: Shift) => {
        setEditingShift(shift);
        setFormData({
            ngayKham: shift.ngayKham,
            gioBatDau: shift.gioBatDau,
            gioKetThuc: shift.gioKetThuc,
            moTa: shift.moTa,
            maNhaSi: shift.maNhaSi
        });
        setShowModal(true);
    };

    const handleAssignDentist = async (shiftId: number, dentistId: string) => {
        try {
            await shiftService.update(shiftId, { maNhaSi: dentistId });
            toast.success('Phân công nha sĩ thành công');
            fetchData();
        } catch (error) {
            toast.error('Phân công thất bại');
        }
    };

    const handleUnassignDentist = async (shiftId: number) => {
        try {
            await shiftService.update(shiftId, { maNhaSi: null });
            toast.success('Hủy phân công thành công');
            fetchData();
        } catch (error) {
            toast.error('Hủy phân công thất bại');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ca khám này?')) {
            try {
                await shiftService.delete(id);
                toast.success('Xóa ca khám thành công');
                fetchData();
            } catch (error) {
                toast.error('Không thể xóa ca khám');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            ngayKham: selectedDate,
            gioBatDau: '',
            gioKetThuc: '',
            moTa: '',
            maNhaSi: null
        });
        setEditingShift(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    const getShiftStatus = (shift: Shift) => {
        if (!shift.maNhaSi) return { status: 'Chưa phân công', color: 'warning' };
        if (shift.maLichKham) return { status: 'Có lịch hẹn', color: 'success' };
        return { status: 'Sẵn sàng', color: 'info' };
    };

    // Group shifts by time slots
    const groupedShifts = timeSlots.map(slot => {
        const slotShifts = shifts.filter(shift =>
            shift.gioBatDau === slot.start && shift.gioKetThuc === slot.end
        );

        return {
            ...slot,
            shifts: slotShifts
        };
    });

    // Statistics
    const stats = {
        total: shifts.length,
        assigned: shifts.filter(s => s.maNhaSi).length,
        unassigned: shifts.filter(s => !s.maNhaSi).length,
        withAppointments: shifts.filter(s => s.maLichKham).length,
        available: shifts.filter(s => s.maNhaSi && !s.maLichKham).length
    };

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Sắp xếp ca làm việc</h4>
                <div className="d-flex align-items-center gap-3">
                    <input
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '180px' }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        <i className="icofont-plus me-2"></i>Thêm ca khám
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="row mb-4">
                <div className="col-md-2">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.total}</h5>
                            <small>Tổng ca</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.assigned}</h5>
                            <small>Đã phân công</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-warning text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.unassigned}</h5>
                            <small>Chưa phân công</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.withAppointments}</h5>
                            <small>Có lịch hẹn</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-secondary text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.available}</h5>
                            <small>Sẵn sàng</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-dark text-white">
                        <div className="card-body text-center py-2">
                            <h5>{dentists.length}</h5>
                            <small>Nha sĩ</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shifts by Time Slots */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {groupedShifts.map((timeSlot, index) => (
                        <div key={index} className="col-lg-6 mb-4">
                            <div className="card h-100">
                                <div className="card-header bg-primary text-white">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">
                                            <i className="icofont-clock-time me-2"></i>
                                            {timeSlot.label} ({timeSlot.start} - {timeSlot.end})
                                        </h6>
                                        <span className="badge bg-light text-dark">
                                            {timeSlot.shifts.length} ca
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {timeSlot.shifts.length > 0 ? (
                                        <div className="row g-2">
                                            {timeSlot.shifts.map(shift => {
                                                const status = getShiftStatus(shift);
                                                return (
                                                    <div key={shift.maCaKham} className="col-12">
                                                        <div className={`card border-${status.color}`}>
                                                            <div className="card-body p-3">
                                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                                    <div>
                                                                        <h6 className="mb-1">Ca {shift.maCaKham}</h6>
                                                                        <span className={`badge bg-${status.color}`}>
                                                                            {status.status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="dropdown">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                                            type="button"
                                                                            data-bs-toggle="dropdown"
                                                                        >
                                                                            <i className="icofont-gear"></i>
                                                                        </button>
                                                                        <ul className="dropdown-menu">
                                                                            <li>
                                                                                <button
                                                                                    className="dropdown-item"
                                                                                    onClick={() => handleEdit(shift)}
                                                                                >
                                                                                    <i className="icofont-edit me-2"></i>Sửa
                                                                                </button>
                                                                            </li>
                                                                            <li>
                                                                                <button
                                                                                    className="dropdown-item text-danger"
                                                                                    onClick={() => handleDelete(shift.maCaKham)}
                                                                                >
                                                                                    <i className="icofont-trash me-2"></i>Xóa
                                                                                </button>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>

                                                                {shift.maNhaSi ? (
                                                                    <div className="mb-2">
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <div>
                                                                                <i className="icofont-doctor me-1"></i>
                                                                                <strong>{shift.tenNhaSi}</strong>
                                                                            </div>
                                                                            <button
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => handleUnassignDentist(shift.maCaKham)}
                                                                                title="Hủy phân công"
                                                                            >
                                                                                <i className="icofont-close"></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="mb-2">
                                                                        <select
                                                                            className="form-select form-select-sm"
                                                                            onChange={(e) => handleAssignDentist(shift.maCaKham, e.target.value)}
                                                                            defaultValue=""
                                                                        >
                                                                            <option value="">Chọn nha sĩ...</option>
                                                                            {dentists.map(dentist => (
                                                                                <option key={dentist.maNhaSi} value={dentist.maNhaSi}>
                                                                                    {dentist.hoTen}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                )}

                                                                {shift.maLichKham && (
                                                                    <div className="p-2 bg-light rounded">
                                                                        <small>
                                                                            <strong>Lịch hẹn:</strong> {shift.tenBenhNhan}<br />
                                                                            <strong>SĐT:</strong> {shift.soDienThoai}
                                                                        </small>
                                                                    </div>
                                                                )}

                                                                {shift.moTa && (
                                                                    <div className="mt-2">
                                                                        <small className="text-muted">
                                                                            <strong>Ghi chú:</strong> {shift.moTa}
                                                                        </small>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            <i className="icofont-clock-time fs-3"></i>
                                            <p className="mt-2 mb-0">Chưa có ca khám nào</p>
                                            <button
                                                className="btn btn-sm btn-outline-primary mt-2"
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        ngayKham: selectedDate,
                                                        gioBatDau: timeSlot.start,
                                                        gioKetThuc: timeSlot.end
                                                    });
                                                    setShowModal(true);
                                                }}
                                            >
                                                <i className="icofont-plus me-1"></i>Tạo ca
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Assignment for Unassigned Patients */}
            <div className="card mt-4">
                <div className="card-header">
                    <h6 className="mb-0">
                        <i className="icofont-users me-2"></i>Danh sách nha sĩ
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row">
                        {dentists.map(dentist => {
                            const dentistShifts = shifts.filter(s => s.maNhaSi === dentist.maNhaSi);
                            return (
                                <div key={dentist.maNhaSi} className="col-md-4 mb-3">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6 className="card-title">{dentist.hoTen}</h6>
                                            <p className="card-text">
                                                <small className="text-muted">
                                                    {dentist.chucVu} - {dentist.kinhNghiem}
                                                </small>
                                            </p>
                                            <div className="d-flex justify-content-between">
                                                <span className="badge bg-primary">
                                                    {dentistShifts.length} ca được phân
                                                </span>
                                                <span className="badge bg-success">
                                                    {dentistShifts.filter(s => s.maLichKham).length} có lịch hẹn
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingShift ? 'Sửa ca khám' : 'Thêm ca khám mới'}
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal} />
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Ngày khám *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.ngayKham}
                                            onChange={(e) => setFormData({ ...formData, ngayKham: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Giờ bắt đầu *</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                value={formData.gioBatDau}
                                                onChange={(e) => setFormData({ ...formData, gioBatDau: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Giờ kết thúc *</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                value={formData.gioKetThuc}
                                                onChange={(e) => setFormData({ ...formData, gioKetThuc: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Nha sĩ phụ trách</label>
                                        <select
                                            className="form-select"
                                            value={formData.maNhaSi || ''}
                                            onChange={(e) => setFormData({ ...formData, maNhaSi: e.target.value || null })}
                                        >
                                            <option value="">Chưa phân công</option>
                                            {dentists.map(dentist => (
                                                <option key={dentist.maNhaSi} value={dentist.maNhaSi}>
                                                    {dentist.hoTen} - {dentist.chucVu}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Mô tả</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={formData.moTa}
                                            onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                                            placeholder="Ghi chú về ca khám..."
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingShift ? 'Cập nhật' : 'Tạo mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReceptionistShifts; 