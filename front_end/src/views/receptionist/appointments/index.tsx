import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { appointmentService, shiftService, userService, userServiceExtended, dentistService } from '../../../services';

interface Appointment {
    maLichKham: number;
    maBenhNhan: number;
    maCaKham: number;
    trieuChung: string;
    ngayDatLich: string;
    trangThai: string;
    // Extended fields
    tenBenhNhan?: string;
    soDienThoai?: string;
    tenNhaSi?: string;
    gioBatDau?: string;
    gioKetThuc?: string;
}

interface AppointmentForm {
    maBenhNhan: number;
    maCaKham: number;
    trieuChung: string;
    trangThai: string;
}

interface Patient {
    maNguoiDung: number;
    hoTen: string;
    soDienThoai: string;
    eMail: string;
}

interface Shift {
    maCaKham: number;
    ngayKham: string;
    gioBatDau: string;
    gioKetThuc: string;
    maNhaSi?: string;
    tenNhaSi?: string;
}

function ReceptionistAppointments() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<AppointmentForm>({
        maBenhNhan: 0,
        maCaKham: 0,
        trieuChung: '',
        trangThai: 'Chờ'
    });

    const statusOptions = [
        { value: 'Chờ', label: 'Chờ xác nhận', color: 'warning' },
        { value: 'Đã đặt', label: 'Đã đặt', color: 'info' },
        { value: 'Đã đến', label: 'Đã đến', color: 'primary' },
        { value: 'Đang khám', label: 'Đang khám', color: 'success' },
        { value: 'Hoàn thành', label: 'Hoàn thành', color: 'secondary' },
        { value: 'Hủy', label: 'Hủy', color: 'danger' }
    ];

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [appointmentRes, patientRes, shiftRes] = await Promise.all([
                appointmentService.all(),
                userServiceExtended.getFullList({ maQuyen: 4 }),
                shiftService.all()
            ]);

            const appointments = appointmentRes.data;
            const patients = patientRes.data;
            const shifts = shiftRes.data;

            // Filter appointments by selected date
            const dateAppointments = appointments.filter((apt: any) => {
                const aptDate = new Date(apt.ngayDatLich).toISOString().split('T')[0];
                return aptDate === selectedDate;
            });

            // Enrich appointments with patient and shift info
            const enrichedAppointments = dateAppointments.map((apt: any) => {
                const patient = patients.find((p: any) => p.maNguoiDung === apt.maBenhNhan);
                const shift = shifts.find((s: any) => s.maCaKham === apt.maCaKham);

                return {
                    ...apt,
                    tenBenhNhan: patient?.hoTen,
                    soDienThoai: patient?.soDienThoai,
                    gioBatDau: shift?.gioBatDau,
                    gioKetThuc: shift?.gioKetThuc,
                    tenNhaSi: shift?.tenNhaSi
                };
            });

            setAppointments(enrichedAppointments);
            setPatients(patients);
            setShifts(shifts.filter((s: any) => s.ngayKham === selectedDate));
        } catch (error) {
            toast.error('Không thể tải dữ liệu lịch khám');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingAppointment) {
                await appointmentService.update(editingAppointment.maLichKham, formData);
                toast.success('Cập nhật lịch khám thành công');
            } else {
                await appointmentService.create(formData);
                toast.success('Tạo lịch khám thành công');
            }

            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleEdit = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setFormData({
            maBenhNhan: appointment.maBenhNhan,
            maCaKham: appointment.maCaKham,
            trieuChung: appointment.trieuChung,
            trangThai: appointment.trangThai
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lịch khám này?')) {
            try {
                await appointmentService.delete(id);
                toast.success('Xóa lịch khám thành công');
                fetchData();
            } catch (error) {
                toast.error('Không thể xóa lịch khám');
            }
        }
    };

    const handleStatusChange = async (appointmentId: number, newStatus: string) => {
        try {
            await appointmentService.update(appointmentId, { trangThai: newStatus });
            toast.success('Cập nhật trạng thái thành công');
            fetchData();
        } catch (error) {
            toast.error('Cập nhật trạng thái thất bại');
        }
    };

    const resetForm = () => {
        setFormData({
            maBenhNhan: 0,
            maCaKham: 0,
            trieuChung: '',
            trangThai: 'Chờ'
        });
        setEditingAppointment(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const formatTime = (time: string | undefined) => {
        if (!time) return '';
        return time.substring(0, 5);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = statusOptions.find(s => s.value === status);
        return `badge bg-${statusConfig?.color || 'secondary'}`;
    };

    // Filter appointments
    const filteredAppointments = appointments.filter(appointment => {
        const matchStatus = !filterStatus || appointment.trangThai === filterStatus;
        const matchSearch = !searchTerm ||
            appointment.tenBenhNhan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.soDienThoai?.includes(searchTerm) ||
            appointment.trieuChung.toLowerCase().includes(searchTerm.toLowerCase());

        return matchStatus && matchSearch;
    });

    // Statistics
    const stats = {
        total: appointments.length,
        waiting: appointments.filter(a => a.trangThai === 'Chờ').length,
        confirmed: appointments.filter(a => a.trangThai === 'Đã đặt').length,
        arrived: appointments.filter(a => a.trangThai === 'Đã đến').length,
        examining: appointments.filter(a => a.trangThai === 'Đang khám').length,
        completed: appointments.filter(a => a.trangThai === 'Hoàn thành').length,
        cancelled: appointments.filter(a => a.trangThai === 'Hủy').length
    };

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Quản lý lịch khám</h4>
                <div className="d-flex align-items-center gap-3">
                    <input
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '180px' }}
                    />
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/le-tan/appointments/create')}
                        >
                            <i className="icofont-plus me-2"></i>Tạo lịch khám mới
                        </button>
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => setShowModal(true)}
                        >
                            <i className="icofont-edit me-2"></i>Thêm nhanh
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="row mb-4">
                <div className="col-md-2">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.total}</h5>
                            <small>Tổng số</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-warning text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.waiting}</h5>
                            <small>Chờ</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.arrived}</h5>
                            <small>Đã đến</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.examining}</h5>
                            <small>Đang khám</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-secondary text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.completed}</h5>
                            <small>Hoàn thành</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-danger text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.cancelled}</h5>
                            <small>Hủy</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-3">
                <div className="card-body py-2">
                    <div className="row align-items-center">
                        <div className="col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm kiếm theo tên, SĐT, triệu chứng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                {statusOptions.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-5 text-end">
                            <button className="btn btn-outline-primary me-2" onClick={fetchData}>
                                <i className="icofont-refresh"></i> Làm mới
                            </button>
                            <button className="btn btn-outline-success">
                                <i className="icofont-download"></i> Xuất Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointments List */}
            <div className="card">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Thời gian</th>
                                        <th>Bệnh nhân</th>
                                        <th>Nha sĩ</th>
                                        <th>Triệu chứng</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAppointments.map((appointment, index) => (
                                        <tr key={appointment.maLichKham}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="fw-bold">
                                                    {formatTime(appointment.gioBatDau)} - {formatTime(appointment.gioKetThuc)}
                                                </div>
                                                <small className="text-muted">
                                                    {new Date(appointment.ngayDatLich).toLocaleDateString('vi-VN')}
                                                </small>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-bold">{appointment.tenBenhNhan}</div>
                                                    <small className="text-muted">{appointment.soDienThoai}</small>
                                                </div>
                                            </td>
                                            <td>{appointment.tenNhaSi || 'Chưa phân công'}</td>
                                            <td>
                                                <span title={appointment.trieuChung}>
                                                    {appointment.trieuChung.length > 40
                                                        ? appointment.trieuChung.substring(0, 40) + '...'
                                                        : appointment.trieuChung
                                                    }
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    className={`form-select form-select-sm ${getStatusBadge(appointment.trangThai).replace('badge', '')}`}
                                                    value={appointment.trangThai}
                                                    onChange={(e) => handleStatusChange(appointment.maLichKham, e.target.value)}
                                                    style={{ minWidth: '120px' }}
                                                >
                                                    {statusOptions.map(status => (
                                                        <option key={status.value} value={status.value}>
                                                            {status.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleEdit(appointment)}
                                                        title="Sửa"
                                                    >
                                                        <i className="icofont-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(appointment.maLichKham)}
                                                        title="Xóa"
                                                    >
                                                        <i className="icofont-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredAppointments.length === 0 && (
                                <div className="text-center py-4 text-muted">
                                    <i className="icofont-calendar fs-3"></i>
                                    <p className="mt-2">Không có lịch khám nào</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingAppointment ? 'Sửa lịch khám' : 'Thêm lịch khám mới'}
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal} />
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Bệnh nhân *</label>
                                        <select
                                            className="form-select"
                                            value={formData.maBenhNhan}
                                            onChange={(e) => setFormData({ ...formData, maBenhNhan: parseInt(e.target.value) })}
                                            required
                                        >
                                            <option value={0}>Chọn bệnh nhân</option>
                                            {patients.map(patient => (
                                                <option key={patient.maNguoiDung} value={patient.maNguoiDung}>
                                                    {patient.hoTen} - {patient.soDienThoai}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Ca khám *</label>
                                        <select
                                            className="form-select"
                                            value={formData.maCaKham}
                                            onChange={(e) => setFormData({ ...formData, maCaKham: parseInt(e.target.value) })}
                                            required
                                        >
                                            <option value={0}>Chọn ca khám</option>
                                            {shifts.map(shift => (
                                                <option key={shift.maCaKham} value={shift.maCaKham}>
                                                    {formatTime(shift.gioBatDau)} - {formatTime(shift.gioKetThuc)}
                                                    {shift.tenNhaSi && ` (${shift.tenNhaSi})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Triệu chứng *</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={formData.trieuChung}
                                            onChange={(e) => setFormData({ ...formData, trieuChung: e.target.value })}
                                            placeholder="Mô tả triệu chứng..."
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Trạng thái</label>
                                        <select
                                            className="form-select"
                                            value={formData.trangThai}
                                            onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                                        >
                                            {statusOptions.map(status => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingAppointment ? 'Cập nhật' : 'Tạo mới'}
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

export default ReceptionistAppointments; 