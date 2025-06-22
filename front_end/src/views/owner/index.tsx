import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clinicService } from '../../services';

interface DashboardStats {
    totalRevenue: number;
    totalAppointments: number;
    totalPatients: number;
    clinicStatus: string;
}

interface Clinic {
    maPhongKham: number;
    tenPhongKham: string;
    diaChi: string;
    soDienThoai: string;
    gioLamViec: string;
    trangthai: string;
    maChuPhongKham: string;
}

function OwnerDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        totalAppointments: 0,
        totalPatients: 0,
        clinicStatus: ''
    });
    const [myClinic, setMyClinic] = useState<Clinic | null>(null);
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchMyClinic();
        fetchDashboardStats();
    }, []);

    const fetchMyClinic = async () => {
        try {
            const response = await clinicService.all();
            const clinic = response.data.find((c: Clinic) =>
                c.maChuPhongKham === currentUser.tenTaiKhoan
            );
            setMyClinic(clinic || null);
        } catch (error) {
            console.error('Lỗi khi tải thông tin phòng khám:', error);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            // Mock data for now - replace with actual API calls
            setStats({
                totalRevenue: 15750000,
                totalAppointments: 128,
                totalPatients: 95,
                clinicStatus: 'duyệt'
            });
        } catch (error) {
            console.error('Lỗi khi tải thống kê:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ color: "#223a66" }}>
                        Xin chào, {currentUser.hoTen}
                    </h2>
                    <p className="text-muted mb-0">Tổng quan quản lý phòng khám của bạn</p>
                </div>
                <div className="text-end">
                    <small className="text-muted">Ngày: {new Date().toLocaleDateString('vi-VN')}</small>
                </div>
            </div>

            {/* Clinic Info Card */}
            {myClinic && (
                <div className="card mb-4 border-primary">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">
                            <i className="icofont-building me-2"></i>
                            Thông tin phòng khám
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-8">
                                <h4 className="text-primary">{myClinic.tenPhongKham}</h4>
                                <p className="mb-2">
                                    <i className="icofont-location-pin me-2"></i>
                                    {myClinic.diaChi}
                                </p>
                                <p className="mb-2">
                                    <i className="icofont-phone me-2"></i>
                                    {myClinic.soDienThoai}
                                </p>
                                <p className="mb-2">
                                    <i className="icofont-clock-time me-2"></i>
                                    Giờ làm việc: {myClinic.gioLamViec}
                                </p>
                            </div>
                            <div className="col-md-4 text-end">
                                <span className={`badge fs-6 ${myClinic.trangthai === 'duyệt' ? 'bg-success' :
                                    myClinic.trangthai === 'VIP' ? 'bg-info' :
                                        myClinic.trangthai === 'uy tín' ? 'bg-secondary' : 'bg-warning'
                                    }`}>
                                    {myClinic.trangthai}
                                </span>
                                <div className="mt-3">
                                    <Link
                                        to="/owner/clinic-info"
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        Chỉnh sửa thông tin
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                <i className="icofont-money text-success fs-4"></i>
                            </div>
                            <h3 className="text-success mb-1">{stats.totalRevenue.toLocaleString('vi-VN')}đ</h3>
                            <p className="text-muted mb-0">Doanh thu tháng này</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                <i className="icofont-calendar text-info fs-4"></i>
                            </div>
                            <h3 className="text-info mb-1">{stats.totalAppointments}</h3>
                            <p className="text-muted mb-0">Lịch khám tháng này</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="rounded-circle bg-warning bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                <i className="icofont-users text-warning fs-4"></i>
                            </div>
                            <h3 className="text-warning mb-1">{stats.totalPatients}</h3>
                            <p className="text-muted mb-0">Bệnh nhân đã khám</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                <i className="icofont-star text-primary fs-4"></i>
                            </div>
                            <h3 className="text-primary mb-1">4.8</h3>
                            <p className="text-muted mb-0">Đánh giá trung bình</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Chức năng quản lý</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <Link to="/owner/clinic-info" className="text-decoration-none">
                                        <div className="d-flex align-items-center p-3 border rounded hover-shadow">
                                            <i className="icofont-building text-primary fs-3 me-3"></i>
                                            <div>
                                                <h6 className="mb-1 text-dark">Thông tin phòng khám</h6>
                                                <small className="text-muted">Cập nhật thông tin</small>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                <div className="col-md-4">
                                    <Link to="/owner/staff" className="text-decoration-none">
                                        <div className="d-flex align-items-center p-3 border rounded hover-shadow">
                                            <i className="icofont-users-alt-5 text-success fs-3 me-3"></i>
                                            <div>
                                                <h6 className="mb-1 text-dark">Quản lý nhân viên</h6>
                                                <small className="text-muted">Bác sĩ, lễ tân</small>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                <div className="col-md-4">
                                    <Link to="/owner/services" className="text-decoration-none">
                                        <div className="d-flex align-items-center p-3 border rounded hover-shadow">
                                            <i className="icofont-heart-beat text-danger fs-3 me-3"></i>
                                            <div>
                                                <h6 className="mb-1 text-dark">Dịch vụ nha khoa</h6>
                                                <small className="text-muted">Thêm, sửa dịch vụ</small>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                <div className="col-md-4">
                                    <Link to="/owner/appointments" className="text-decoration-none">
                                        <div className="d-flex align-items-center p-3 border rounded hover-shadow">
                                            <i className="icofont-calendar text-info fs-3 me-3"></i>
                                            <div>
                                                <h6 className="mb-1 text-dark">Lịch hẹn</h6>
                                                <small className="text-muted">Theo dõi lịch khám</small>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                <div className="col-md-4">
                                    <Link to="/owner/revenue" className="text-decoration-none">
                                        <div className="d-flex align-items-center p-3 border rounded hover-shadow">
                                            <i className="icofont-money-bag text-warning fs-3 me-3"></i>
                                            <div>
                                                <h6 className="mb-1 text-dark">Thống kê doanh thu</h6>
                                                <small className="text-muted">Báo cáo tài chính</small>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                <div className="col-md-4">
                                    <Link to="/owner/notifications" className="text-decoration-none">
                                        <div className="d-flex align-items-center p-3 border rounded hover-shadow">
                                            <i className="icofont-notification text-primary fs-3 me-3"></i>
                                            <div>
                                                <h6 className="mb-1 text-dark">Thông báo</h6>
                                                <small className="text-muted">Gửi thông báo</small>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Hoạt động gần đây</h5>
                        </div>
                        <div className="card-body">
                            <div className="list-group list-group-flush">
                                <div className="list-group-item border-0 px-0">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                                            <i className="icofont-check text-success"></i>
                                        </div>
                                        <div>
                                            <p className="mb-1 small">Lịch khám mới được đặt</p>
                                            <small className="text-muted">2 phút trước</small>
                                        </div>
                                    </div>
                                </div>

                                <div className="list-group-item border-0 px-0">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                                            <i className="icofont-money text-info"></i>
                                        </div>
                                        <div>
                                            <p className="mb-1 small">Thanh toán hoàn tất</p>
                                            <small className="text-muted">15 phút trước</small>
                                        </div>
                                    </div>
                                </div>

                                <div className="list-group-item border-0 px-0">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                                            <i className="icofont-star text-warning"></i>
                                        </div>
                                        <div>
                                            <p className="mb-1 small">Đánh giá mới: 5 sao</p>
                                            <small className="text-muted">1 giờ trước</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
      `}</style>
        </div>
    );
}

export default OwnerDashboard; 