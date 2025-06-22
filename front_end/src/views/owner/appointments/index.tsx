import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface Appointment {
    maLichKham: number;
    ngayDatLich: string;
    trieuChung: string;
    trangThai: string;
    maBenhNhan: number;
    maNguoiDat: string;
    quanHeBenhNhanVaNguoiDat: string;
    caKham: {
        maCaKham: number;
        ngayKham: string;
        gioBatDau: string;
        gioKetThuc: string;
        moTa: string;
        nhaSi: {
            hoTen: string;
            chucVu: string;
        };
    };
    benhNhan: {
        hoTen: string;
        soDienThoai: string;
        eMail: string;
    };
}

function AppointmentManagement() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');
    const [myClinic, setMyClinic] = useState<any>(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchMyClinic();
    }, []);

    const fetchMyClinic = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/phongkham');
            const clinic = response.data.find((c: any) =>
                c.maChuPhongKham === currentUser.tenTaiKhoan
            );
            setMyClinic(clinic);
            if (clinic) {
                fetchAppointments(clinic.maPhongKham);
            }
        } catch (error) {
            toast.error('Không thể tải thông tin phòng khám');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async (clinicId: number) => {
        try {
            // Mock data for demonstration
            const mockAppointments: Appointment[] = [
                {
                    maLichKham: 1,
                    ngayDatLich: '2024-06-01',
                    trieuChung: 'Đau răng hàm dưới',
                    trangThai: 'Chờ',
                    maBenhNhan: 1,
                    maNguoiDat: 'benhnhan1',
                    quanHeBenhNhanVaNguoiDat: 'Tôi',
                    caKham: {
                        maCaKham: 1,
                        ngayKham: '2024-06-05',
                        gioBatDau: '08:00',
                        gioKetThuc: '09:00',
                        moTa: 'Ca sáng khám tổng quát',
                        nhaSi: {
                            hoTen: 'BS. Nguyễn Bác Sĩ',
                            chucVu: 'Trưởng khoa'
                        }
                    },
                    benhNhan: {
                        hoTen: 'Nguyễn Văn A',
                        soDienThoai: '0900000001',
                        eMail: 'a@example.com'
                    }
                },
                {
                    maLichKham: 2,
                    ngayDatLich: '2024-06-02',
                    trieuChung: 'Sâu răng, ê buốt',
                    trangThai: 'Xác nhận',
                    maBenhNhan: 2,
                    maNguoiDat: 'benhnhan1',
                    quanHeBenhNhanVaNguoiDat: 'Con',
                    caKham: {
                        maCaKham: 2,
                        ngayKham: '2024-06-06',
                        gioBatDau: '09:00',
                        gioKetThuc: '10:00',
                        moTa: 'Ca sáng trám răng',
                        nhaSi: {
                            hoTen: 'BS. Lê Nha Sĩ',
                            chucVu: 'Nha sĩ chính'
                        }
                    },
                    benhNhan: {
                        hoTen: 'Lê Thị B',
                        soDienThoai: '0900000002',
                        eMail: 'b@example.com'
                    }
                }
            ];

            setAppointments(mockAppointments);
        } catch (error) {
            console.error('Lỗi khi tải danh sách lịch khám:', error);
        }
    };

    const handleStatusChange = async (appointmentId: number, newStatus: string) => {
        try {
            // Update appointment status
            await axios.put(`http://localhost:3000/api/lichkham/${appointmentId}`, {
                trangThai: newStatus
            });

            // Update local state
            setAppointments(prev =>
                prev.map(apt =>
                    apt.maLichKham === appointmentId
                        ? { ...apt, trangThai: newStatus }
                        : apt
                )
            );

            toast.success('Cập nhật trạng thái thành công!');
        } catch (error) {
            toast.error('Cập nhật trạng thái thất bại');
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Chờ': return 'bg-warning text-dark';
            case 'Xác nhận': return 'bg-success';
            case 'Hoàn thành': return 'bg-primary';
            case 'Hủy': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const statusMatch = selectedStatus === 'all' || apt.trangThai === selectedStatus;
        const dateMatch = !selectedDate || apt.caKham.ngayKham === selectedDate;
        return statusMatch && dateMatch;
    });

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (!myClinic) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning text-center">
                    <h5>Chưa có phòng khám</h5>
                    <p>Bạn cần có phòng khám để quản lý lịch hẹn.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ color: "#223a66" }}>
                        Quản lý lịch hẹn
                    </h2>
                    <p className="text-muted mb-0">Theo dõi các lịch khám tại {myClinic.tenPhongKham}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Trạng thái</label>
                            <select
                                className="form-select"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="Chờ">Chờ xác nhận</option>
                                <option value="Xác nhận">Đã xác nhận</option>
                                <option value="Hoàn thành">Hoàn thành</option>
                                <option value="Hủy">Đã hủy</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Ngày khám</label>
                            <input
                                type="date"
                                className="form-select"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                            <button
                                className="btn btn-outline-secondary me-2"
                                onClick={() => {
                                    setSelectedStatus('all');
                                    setSelectedDate('');
                                }}
                            >
                                <i className="icofont-refresh me-2"></i>
                                Đặt lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointments List */}
            <div className="card shadow-sm">
                <div className="card-header bg-light">
                    <h5 className="mb-0">
                        Danh sách lịch hẹn ({filteredAppointments.length})
                    </h5>
                </div>
                <div className="card-body">
                    {filteredAppointments.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <i className="icofont-calendar fs-1 mb-3"></i>
                            <p>Không có lịch hẹn nào phù hợp với bộ lọc</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Ngày khám</th>
                                        <th>Giờ</th>
                                        <th>Bệnh nhân</th>
                                        <th>Bác sĩ</th>
                                        <th>Triệu chứng</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAppointments.map((appointment) => (
                                        <tr key={appointment.maLichKham}>
                                            <td>
                                                <div className="fw-bold">
                                                    {new Date(appointment.caKham.ngayKham).toLocaleDateString('vi-VN')}
                                                </div>
                                                <small className="text-muted">
                                                    Đặt: {new Date(appointment.ngayDatLich).toLocaleDateString('vi-VN')}
                                                </small>
                                            </td>
                                            <td>
                                                <span className="badge bg-info">
                                                    {appointment.caKham.gioBatDau} - {appointment.caKham.gioKetThuc}
                                                </span>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-bold">{appointment.benhNhan.hoTen}</div>
                                                    <small className="text-muted">{appointment.benhNhan.soDienThoai}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-bold">{appointment.caKham.nhaSi.hoTen}</div>
                                                    <small className="text-muted">{appointment.caKham.nhaSi.chucVu}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                                    {appointment.trieuChung}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeClass(appointment.trangThai)}`}>
                                                    {appointment.trangThai}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary dropdown-toggle"
                                                        data-bs-toggle="dropdown"
                                                    >
                                                        Thao tác
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        {appointment.trangThai === 'Chờ' && (
                                                            <>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item text-success"
                                                                        onClick={() => handleStatusChange(appointment.maLichKham, 'Xác nhận')}
                                                                    >
                                                                        <i className="icofont-check me-2"></i>
                                                                        Xác nhận
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item text-danger"
                                                                        onClick={() => handleStatusChange(appointment.maLichKham, 'Hủy')}
                                                                    >
                                                                        <i className="icofont-close me-2"></i>
                                                                        Hủy lịch
                                                                    </button>
                                                                </li>
                                                            </>
                                                        )}
                                                        {appointment.trangThai === 'Xác nhận' && (
                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-primary"
                                                                    onClick={() => handleStatusChange(appointment.maLichKham, 'Hoàn thành')}
                                                                >
                                                                    <i className="icofont-check-circled me-2"></i>
                                                                    Hoàn thành
                                                                </button>
                                                            </li>
                                                        )}
                                                        <li>
                                                            <button className="dropdown-item">
                                                                <i className="icofont-eye me-2"></i>
                                                                Xem chi tiết
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mt-4">
                <div className="col-md-3">
                    <div className="card border-warning">
                        <div className="card-body text-center">
                            <h3 className="text-warning">{appointments.filter(a => a.trangThai === 'Chờ').length}</h3>
                            <p className="mb-0 small">Chờ xác nhận</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-success">
                        <div className="card-body text-center">
                            <h3 className="text-success">{appointments.filter(a => a.trangThai === 'Xác nhận').length}</h3>
                            <p className="mb-0 small">Đã xác nhận</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-primary">
                        <div className="card-body text-center">
                            <h3 className="text-primary">{appointments.filter(a => a.trangThai === 'Hoàn thành').length}</h3>
                            <p className="mb-0 small">Hoàn thành</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-danger">
                        <div className="card-body text-center">
                            <h3 className="text-danger">{appointments.filter(a => a.trangThai === 'Hủy').length}</h3>
                            <p className="mb-0 small">Đã hủy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppointmentManagement; 