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
    trangThaiLich?: string;
    maLichKham?: number;
    maBenhNhan?: number;
    tenBenhNhan?: string;
    tenNhaSi?: string;
}

interface Dentist {
    maNhaSi: string;
    hoTen: string;
    maPhongKham: number;
    kinhNghiem: string;
    chucVu: string;
}

interface ShiftFormData {
    ngayKham: string;
    gioBatDau: string;
    gioKetThuc: string;
    moTa: string;
    maNhaSi: string;
}

const TIME_SLOTS = [
    { start: '08:00', end: '10:00', label: 'Ca sáng sớm (8:00 - 10:00)' },
    { start: '10:00', end: '12:00', label: 'Ca sáng muộn (10:00 - 12:00)' },
    { start: '13:00', end: '15:00', label: 'Ca chiều sớm (13:00 - 15:00)' },
    { start: '15:00', end: '17:00', label: 'Ca chiều muộn (15:00 - 17:00)' },
];

function ShiftManagerPage() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<ShiftFormData>({
        ngayKham: '',
        gioBatDau: '',
        gioKetThuc: '',
        moTa: '',
        maNhaSi: ''
    });

    useEffect(() => {
        fetchDentists();
    }, []);

    useEffect(() => {
        fetchShifts();
    }, [selectedDate]);

    const fetchShifts = async () => {
        try {
            const res = await shiftService.all({ ngayKham: selectedDate });
            setShifts(res.data);
        } catch (error) {
            toast.error('Không thể tải danh sách ca khám');
        }
    };

    const fetchDentists = async () => {
        try {
            const res = await dentistService.all();
            setDentists(res.data);
        } catch (error) {
            toast.error('Không thể tải danh sách nha sĩ');
        }
    };

    const handleCreate = () => {
        setFormData({
            ngayKham: selectedDate,
            gioBatDau: '',
            gioKetThuc: '',
            moTa: '',
            maNhaSi: ''
        });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEdit = (shift: Shift) => {
        setFormData({
            ngayKham: shift.ngayKham,
            gioBatDau: shift.gioBatDau.substring(0, 5),
            gioKetThuc: shift.gioKetThuc.substring(0, 5),
            moTa: shift.moTa || '',
            maNhaSi: shift.maNhaSi || ''
        });
        setEditingId(shift.maCaKham);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleTimeSlotSelect = (slot: { start: string; end: string }) => {
        setFormData({
            ...formData,
            gioBatDau: slot.start,
            gioKetThuc: slot.end
        });
    };

    const handleSave = async () => {
        if (!formData.ngayKham || !formData.gioBatDau || !formData.gioKetThuc) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const [day, month, year] = formData.ngayKham.split('-').reverse();
        const formattedData = {
            ...formData,
            ngayKham: `${day}-${month}-${year}`,
            gioBatDau: formData.gioBatDau + ':00',
            gioKetThuc: formData.gioKetThuc + ':00',
            maNhaSi: formData.maNhaSi || null
        };

        try {
            if (isEditing && editingId) {
                await shiftService.update(editingId, formattedData);
                toast.success('Cập nhật ca khám thành công');
            } else {
                await shiftService.create(formattedData);
                toast.success('Thêm ca khám thành công');
            }
            setShowModal(false);
            fetchShifts();
        } catch (error) {
            toast.error('Lưu ca khám thất bại');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa ca khám này?')) return;

        try {
            await shiftService.delete(id);
            toast.success('Xóa ca khám thành công');
            fetchShifts();
        } catch (error) {
            toast.error('Xóa ca khám thất bại');
        }
    };

    const handleAssignDentist = async (shiftId: number, dentistId: string) => {
        try {
            await shiftService.update(shiftId, { maNhaSi: dentistId });
            toast.success('Phân công nha sĩ thành công');
            fetchShifts();
        } catch (error) {
            toast.error('Phân công nha sĩ thất bại');
        }
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    const getShiftStatus = (shift: Shift) => {
        if (shift.maLichKham) {
            return { label: 'Đã đặt', color: 'danger' };
        } else if (shift.maNhaSi) {
            return { label: 'Có nha sĩ', color: 'success' };
        } else {
            return { label: 'Trống', color: 'warning' };
        }
    };

    const groupShiftsByTime = () => {
        const grouped: { [key: string]: Shift[] } = {};

        TIME_SLOTS.forEach(slot => {
            const key = `${slot.start}-${slot.end}`;
            grouped[key] = shifts.filter(shift =>
                formatTime(shift.gioBatDau) === slot.start &&
                formatTime(shift.gioKetThuc) === slot.end
            );
        });

        return grouped;
    };

    const groupedShifts = groupShiftsByTime();

    return (
        <div className="container-fluid">
            <ToastContainer />
            <h4 className="mb-4">Cập nhật ca khám</h4>

            {/* Date selector and Add button */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <label className="form-label">Chọn ngày:</label>
                    <input
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>
                <div className="col-md-8 d-flex align-items-end justify-content-end">
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <i className="icofont-plus me-2"></i>Thêm ca khám
                    </button>
                </div>
            </div>

            {/* Shift Grid */}
            <div className="row">
                {TIME_SLOTS.map(slot => {
                    const key = `${slot.start}-${slot.end}`;
                    const slotShifts = groupedShifts[key] || [];

                    return (
                        <div key={key} className="col-md-6 mb-4">
                            <div className="card h-100">
                                <div className="card-header bg-primary text-white">
                                    <h6 className="mb-0">
                                        <i className="icofont-clock-time me-2"></i>
                                        {slot.label}
                                    </h6>
                                </div>
                                <div className="card-body">
                                    {slotShifts.length === 0 ? (
                                        <div className="text-center text-muted py-3">
                                            <i className="icofont-calendar fs-3"></i>
                                            <p className="mb-0 mt-2">Chưa có ca khám</p>
                                        </div>
                                    ) : (
                                        <div className="list-group">
                                            {slotShifts.map(shift => {
                                                const status = getShiftStatus(shift);
                                                const dentist = dentists.find(d => d.maNhaSi === shift.maNhaSi);

                                                return (
                                                    <div key={shift.maCaKham} className="list-group-item">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex align-items-center mb-1">
                                                                    <span className={`badge bg-${status.color} me-2`}>
                                                                        {status.label}
                                                                    </span>
                                                                    {shift.moTa && (
                                                                        <small className="text-muted">{shift.moTa}</small>
                                                                    )}
                                                                </div>

                                                                {dentist ? (
                                                                    <p className="mb-1">
                                                                        <strong>Nha sĩ:</strong> {dentist.hoTen}
                                                                    </p>
                                                                ) : (
                                                                    <select
                                                                        className="form-select form-select-sm mb-1"
                                                                        value=""
                                                                        onChange={(e) => handleAssignDentist(shift.maCaKham, e.target.value)}
                                                                        disabled={!!shift.maLichKham}
                                                                    >
                                                                        <option value="">-- Chọn nha sĩ --</option>
                                                                        {dentists.map(d => (
                                                                            <option key={d.maNhaSi} value={d.maNhaSi}>
                                                                                {d.hoTen} ({d.chucVu})
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                )}

                                                                {shift.maLichKham && (
                                                                    <p className="mb-0 text-danger">
                                                                        <small>
                                                                            <i className="icofont-user me-1"></i>
                                                                            Đã đặt bởi: {shift.tenBenhNhan || 'Bệnh nhân #' + shift.maBenhNhan}
                                                                        </small>
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="btn-group btn-group-sm">
                                                                <button
                                                                    className="btn btn-warning"
                                                                    onClick={() => handleEdit(shift)}
                                                                    disabled={!!shift.maLichKham}
                                                                    title="Sửa"
                                                                >
                                                                    <i className="icofont-edit"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger"
                                                                    onClick={() => handleDelete(shift.maCaKham)}
                                                                    disabled={!!shift.maLichKham}
                                                                    title="Xóa"
                                                                >
                                                                    <i className="icofont-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary Statistics */}
            <div className="row mt-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="card-title">Thống kê ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</h6>
                            <div className="row text-center">
                                <div className="col">
                                    <h4 className="text-primary">{shifts.length}</h4>
                                    <small className="text-muted">Tổng ca khám</small>
                                </div>
                                <div className="col">
                                    <h4 className="text-success">{shifts.filter(s => s.maNhaSi).length}</h4>
                                    <small className="text-muted">Ca có nha sĩ</small>
                                </div>
                                <div className="col">
                                    <h4 className="text-warning">{shifts.filter(s => !s.maNhaSi && !s.maLichKham).length}</h4>
                                    <small className="text-muted">Ca trống</small>
                                </div>
                                <div className="col">
                                    <h4 className="text-danger">{shifts.filter(s => s.maLichKham).length}</h4>
                                    <small className="text-muted">Ca đã đặt</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {isEditing ? 'Sửa ca khám' : 'Thêm ca khám mới'}
                                </h5>
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
                                    <label className="form-label">Chọn ca khám nhanh</label>
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
                                    <label className="form-label">Nha sĩ phụ trách</label>
                                    <select
                                        className="form-select"
                                        value={formData.maNhaSi}
                                        onChange={(e) => setFormData({ ...formData, maNhaSi: e.target.value })}
                                    >
                                        <option value="">-- Chưa phân công --</option>
                                        {dentists.map(d => (
                                            <option key={d.maNhaSi} value={d.maNhaSi}>
                                                {d.hoTen} - {d.chucVu} ({d.kinhNghiem})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Mô tả</label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        value={formData.moTa}
                                        onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                                        placeholder="Ghi chú về ca khám..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Hủy
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>
                                    <i className="icofont-save me-2"></i>
                                    {isEditing ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShiftManagerPage;
