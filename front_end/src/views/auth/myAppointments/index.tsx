import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { appointmentService, shiftService, userService } from '../../../services';

interface Appointment {
    maLichKham: number;
    maBenhNhan: number;
    maCaKham: number;
    trieuChung: string;
    ngayDatLich: string;
    trangThai: string;
    // API trả về thêm các trường này
    tenNhaSi?: string;
    maNhaSi?: string;
    gioBatDau?: string;
    gioKetThuc?: string;
    ngayKham?: string;
    benhNhanHoTen?: string;
    caKhamMoTa?: string;
}

interface Shift {
    maCaKham: number;
    maNhaSi: string;
    ngayKham: string;
    gioBatDau: string;
    gioKetThuc: string;
    tenNhaSi?: string;
    tenPhongKham?: string;
}

function MyAppointments() {
    const user = useSelector((state: any) => state.user.user);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái', color: 'secondary' },
        { value: 'Chờ', label: 'Chờ xác nhận', color: 'warning' },
        { value: 'Đã đặt', label: 'Đã đặt', color: 'info' },
        { value: 'Xác nhận', label: 'Đã xác nhận', color: 'success' },
        { value: 'Đã đến', label: 'Đã đến', color: 'primary' },
        { value: 'Đang khám', label: 'Đang khám', color: 'success' },
        { value: 'Hoàn thành', label: 'Hoàn thành', color: 'secondary' },
        { value: 'Hủy', label: 'Đã hủy', color: 'danger' }
    ];

    useEffect(() => {
        if (user?.maNguoiDung) {
            fetchMyAppointments();
        }
    }, [user]);

    const fetchMyAppointments = async () => {
        try {
            setLoading(true);

            // Lấy tất cả lịch khám của user hiện tại từ API - đã có tenNhaSi và maNhaSi
            const appointmentRes = await appointmentService.all();
            const userAppointments = appointmentRes.data.filter(
                (apt: any) => apt.maBenhNhan === user.maNguoiDung
            );

            // Sắp xếp theo ngày khám mới nhất
            userAppointments.sort((a: any, b: any) =>
                new Date(b.ngayKham || b.ngayDatLich).getTime() - new Date(a.ngayKham || a.ngayDatLich).getTime()
            );

            setAppointments(userAppointments);
        } catch (error) {
            toast.error('Không thể tải danh sách lịch khám');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailModal(true);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Chưa xác định';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Chờ': 'badge bg-warning',
            'Đã đặt': 'badge bg-info',
            'Xác nhận': 'badge bg-success',
            'Đã đến': 'badge bg-primary',
            'Đang khám': 'badge bg-success',
            'Hoàn thành': 'badge bg-secondary',
            'Hủy': 'badge bg-danger'
        };
        return statusMap[status] || 'badge bg-secondary';
    };

    // Filter appointments
    const filteredAppointments = appointments.filter(appointment => {
        const matchStatus = !filterStatus || appointment.trangThai === filterStatus;
        const matchSearch =
            !searchTerm ||
            appointment.trieuChung.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (appointment.tenNhaSi && appointment.tenNhaSi.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchStatus && matchSearch;
    });

    const appointmentStats = {
        total: appointments.length,
        waiting: appointments.filter(a => a.trangThai === 'Chờ').length,
        confirmed: appointments.filter(a => ['Đã đặt', 'Xác nhận'].includes(a.trangThai)).length,
        completed: appointments.filter(a => a.trangThai === 'Hoàn thành').length,
        cancelled: appointments.filter(a => a.trangThai === 'Hủy').length
    };

    return (
        <div className="section">
            <ToastContainer position="top-right" />

            <div className="container">
                <div className="row">
                    <div className="col-12">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h2>Lịch đã đặt</h2>
                                <p className="text-muted">Cập nhật các lịch khám của bạn</p>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="row mb-4">
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-info text-white h-100">
                                    <div className="card-body text-center">
                                        <h4 className="mb-0">{appointmentStats.total}</h4>
                                        <small>Tổng lịch hẹn</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-warning text-white h-100">
                                    <div className="card-body text-center">
                                        <h4 className="mb-0">{appointmentStats.waiting}</h4>
                                        <small>Chờ xác nhận</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-success text-white h-100">
                                    <div className="card-body text-center">
                                        <h4 className="mb-0">{appointmentStats.confirmed}</h4>
                                        <small>Đã xác nhận</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-secondary text-white h-100">
                                    <div className="card-body text-center">
                                        <h4 className="mb-0">{appointmentStats.completed}</h4>
                                        <small>Hoàn thành</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="card mb-4">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4">
                                        <label className="form-label">Lọc theo trạng thái</label>
                                        <select
                                            className="form-select"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Tìm kiếm</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Tìm theo triệu chứng hoặc tên bác sĩ..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        <button
                                            className="btn btn-outline-primary w-100"
                                            onClick={fetchMyAppointments}
                                        >
                                            <i className="icofont-refresh me-2"></i>Làm mới
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Appointments List */}
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                            </div>
                        ) : filteredAppointments.length === 0 ? (
                            <div className="card">
                                <div className="card-body text-center py-5">
                                    <i className="icofont-calendar fs-1 text-muted mb-3"></i>
                                    <h5 className="text-muted">Không có lịch khám nào</h5>
                                    <p className="text-muted">
                                        {appointments.length === 0
                                            ? 'Bạn chưa có lịch khám nào.'
                                            : 'Không tìm thấy lịch khám phù hợp với bộ lọc.'
                                        }
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="row">
                                {filteredAppointments.map(appointment => (
                                    <div key={appointment.maLichKham} className="col-lg-6 mb-4">
                                        <div className="card h-100 shadow-sm">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <h6 className="card-title text-primary mb-0">
                                                        Lịch khám #{appointment.maLichKham.toString().padStart(6, '0')}
                                                    </h6>
                                                    <span className={getStatusBadge(appointment.trangThai)}>
                                                        {appointment.trangThai}
                                                    </span>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="row text-sm">
                                                        <div className="col-6">
                                                            <strong><i className="icofont-calendar me-1"></i>Ngày khám:</strong>
                                                            <br />
                                                            <span className="text-muted">
                                                                {formatDate(appointment.ngayKham || appointment.ngayDatLich)}
                                                            </span>
                                                        </div>
                                                        <div className="col-6">
                                                            <strong><i className="icofont-clock-time me-1"></i>Thời gian:</strong>
                                                            <br />
                                                            <span className="text-muted">
                                                                {appointment.gioBatDau && appointment.gioKetThuc
                                                                    ? `${formatTime(appointment.gioBatDau)} - ${formatTime(appointment.gioKetThuc)}`
                                                                    : 'Chưa xác định'
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <strong><i className="icofont-doctor me-1"></i>Bác sĩ:</strong>
                                                    <span className="text-muted ms-1">{appointment.tenNhaSi}</span>
                                                </div>

                                                <div className="mb-3">
                                                    <strong><i className="icofont-pills me-1"></i>Triệu chứng:</strong>
                                                    <p className="text-muted mb-0 mt-1">{appointment.trieuChung}</p>
                                                </div>

                                                <div className="mb-3">
                                                    <strong><i className="icofont-location-pin me-1"></i>Phòng khám:</strong>
                                                    <span className="text-muted ms-1">{appointment.caKhamMoTa}</span>
                                                </div>

                                                <div className="d-flex gap-2 mt-3">
                                                    <button
                                                        className="btn btn-outline-info btn-sm flex-grow-1"
                                                        onClick={() => handleViewDetail(appointment)}
                                                    >
                                                        <i className="icofont-eye me-1"></i>Chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedAppointment && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="icofont-calendar me-2"></i>
                                    Chi tiết lịch khám #{selectedAppointment.maLichKham.toString().padStart(6, '0')}
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
                                        <label className="form-label"><strong>Mã lịch khám</strong></label>
                                        <p className="form-control-plaintext">LK{selectedAppointment.maLichKham.toString().padStart(6, '0')}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Trạng thái</strong></label>
                                        <p className="form-control-plaintext">
                                            <span className={getStatusBadge(selectedAppointment.trangThai)}>
                                                {selectedAppointment.trangThai}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Ngày khám</strong></label>
                                        <p className="form-control-plaintext">
                                            {formatDate(selectedAppointment.ngayKham || selectedAppointment.ngayDatLich)}
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Thời gian</strong></label>
                                        <p className="form-control-plaintext">
                                            {selectedAppointment.gioBatDau && selectedAppointment.gioKetThuc
                                                ? `${formatTime(selectedAppointment.gioBatDau)} - ${formatTime(selectedAppointment.gioKetThuc)}`
                                                : 'Chưa xác định'
                                            }
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Bác sĩ phụ trách</strong></label>
                                        <p className="form-control-plaintext">{selectedAppointment.tenNhaSi}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Phòng khám</strong></label>
                                        <p className="form-control-plaintext">{selectedAppointment.caKhamMoTa}</p>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label"><strong>Triệu chứng</strong></label>
                                        <p className="form-control-plaintext">{selectedAppointment.trieuChung}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Ngày đặt lịch</strong></label>
                                        <p className="form-control-plaintext">
                                            {formatDate(selectedAppointment.ngayDatLich)}
                                        </p>
                                    </div>
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
        </div>
    );
}

export default MyAppointments; 