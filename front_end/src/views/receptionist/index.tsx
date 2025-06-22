import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { appointmentService, userServiceExtended, medicalRecordService, invoiceService } from '../../services';

interface DashboardStats {
    todayAppointments: number;
    waitingAppointments: number;
    confirmedAppointments: number;
    totalPatients: number;
    pendingBills: number;
    todayRevenue: number;
}

function ReceptionistDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        todayAppointments: 0,
        waitingAppointments: 0,
        confirmedAppointments: 0,
        totalPatients: 0,
        pendingBills: 0,
        todayRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];

            // Fetch all data
            const [appointmentsRes, patientsRes, invoicesRes] = await Promise.all([
                appointmentService.all(),
                userServiceExtended.getFullList({ maQuyen: 4 }), // Patients
                invoiceService.all()
            ]);

            const appointments = appointmentsRes.data;
            const patients = patientsRes.data;
            const invoices = invoicesRes.data;

            // Calculate statistics
            const todayAppointments = appointments.filter((apt: any) =>
                new Date(apt.ngayDatLich).toISOString().split('T')[0] === today
            );

            const todayInvoices = invoices.filter((inv: any) =>
                new Date(inv.ngaytao).toISOString().split('T')[0] === today && inv.trangThai === 'Đã thu tiền'
            );

            setStats({
                todayAppointments: todayAppointments.length,
                waitingAppointments: todayAppointments.filter((apt: any) => apt.trangThai === 'Chờ').length,
                confirmedAppointments: todayAppointments.filter((apt: any) => apt.trangThai === 'Xác nhận').length,
                totalPatients: patients.length,
                pendingBills: invoices.filter((inv: any) => inv.trangThai === 'Chưa thu tiền').length,
                todayRevenue: todayInvoices.reduce((sum: number, inv: any) => sum + inv.soTien, 0)
            });
        } catch (error) {
            toast.error('Không thể tải dữ liệu dashboard');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const menuItems = [
        {
            title: 'Cập nhật lịch khám',
            icon: 'icofont-calendar',
            color: 'primary',
            path: '/le-tan/appointments',
            description: 'Xem, thêm, sửa, xóa lịch khám'
        },
        {
            title: 'Tạo lịch khám mới',
            icon: 'icofont-plus',
            color: 'success',
            path: '/le-tan/appointments/create',
            description: 'Đặt lịch khám cho bệnh nhân'
        },
        {
            title: 'Cập nhật bệnh nhân',
            icon: 'icofont-users-alt-4',
            color: 'success',
            path: '/le-tan/patients',
            description: 'Thông tin bệnh nhân'
        },
        {
            title: 'Xác nhận đến khám',
            icon: 'icofont-check-alt',
            color: 'info',
            path: '/le-tan/checkin',
            description: 'Xác nhận bệnh nhân đã đến'
        },
        {
            title: 'Phiếu khám bệnh',
            icon: 'icofont-prescription',
            color: 'warning',
            path: '/le-tan/medical-records',
            description: 'Cập nhật phiếu khám'
        },
        {
            title: 'Thanh toán',
            icon: 'icofont-money',
            color: 'danger',
            path: '/le-tan/billing',
            description: 'Cập nhật hóa đơn'
        },
        {
            title: 'Sắp xếp ca khám',
            icon: 'icofont-clock-time',
            color: 'secondary',
            path: '/le-tan/shifts',
            description: 'Phân công ca khám'
        },
        {
            title: 'Thông báo',
            icon: 'icofont-notification',
            color: 'dark',
            path: '/le-tan/notifications',
            description: 'Gửi thông báo'
        },
        {
            title: 'Phân công bác sĩ',
            icon: 'icofont-doctor',
            color: 'purple',
            path: '/le-tan/assignments',
            description: 'Phân công bác sĩ cho ca khám'
        }
    ];

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Trang Lễ Tân</h3>
                    <p className="text-muted mb-0">Chào mừng bạn đến với hệ thống quản lý phòng khám</p>
                </div>
                <button className="btn btn-primary" onClick={fetchDashboardData}>
                    <i className="icofont-refresh me-2"></i>Làm mới
                </button>
            </div>

            {/* Statistics Cards */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="row mb-4">
                        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                            <div className="card bg-primary text-white h-100">
                                <div className="card-body text-center">
                                    <i className="icofont-calendar fs-1 mb-2"></i>
                                    <h4 className="mb-1">{stats.todayAppointments}</h4>
                                    <small>Lịch hẹn hôm nay</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                            <div className="card bg-warning text-white h-100">
                                <div className="card-body text-center">
                                    <i className="icofont-clock-time fs-1 mb-2"></i>
                                    <h4 className="mb-1">{stats.waitingAppointments}</h4>
                                    <small>Chờ xác nhận</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                            <div className="card bg-success text-white h-100">
                                <div className="card-body text-center">
                                    <i className="icofont-check-alt fs-1 mb-2"></i>
                                    <h4 className="mb-1">{stats.confirmedAppointments}</h4>
                                    <small>Đã xác nhận</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                            <div className="card bg-info text-white h-100">
                                <div className="card-body text-center">
                                    <i className="icofont-users-alt-4 fs-1 mb-2"></i>
                                    <h4 className="mb-1">{stats.totalPatients}</h4>
                                    <small>Tổng bệnh nhân</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                            <div className="card bg-danger text-white h-100">
                                <div className="card-body text-center">
                                    <i className="icofont-money fs-1 mb-2"></i>
                                    <h4 className="mb-1">{stats.pendingBills}</h4>
                                    <small>HĐ chưa thu</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                            <div className="card bg-secondary text-white h-100">
                                <div className="card-body text-center">
                                    <i className="icofont-dollar fs-1 mb-2"></i>
                                    <h4 className="mb-1">{formatCurrency(stats.todayRevenue).replace('₫', '')}</h4>
                                    <small>Doanh thu hôm nay</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Menu */}
                    <div className="row">
                        {menuItems.map((item, index) => (
                            <div key={index} className="col-lg-4 col-md-6 mb-4">
                                <Link to={item.path} className="text-decoration-none">
                                    <div className={`card border-${item.color} h-100 hover-shadow`}>
                                        <div className="card-body text-center">
                                            <div className={`text-${item.color} mb-3`}>
                                                <i className={`${item.icon} fs-1`}></i>
                                            </div>
                                            <h5 className={`card-title text-${item.color}`}>{item.title}</h5>
                                            <p className="card-text text-muted">{item.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Custom Styles */}
            <style>{`
        .hover-shadow:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        .card {
          transition: all 0.3s ease;
        }
      `}</style>
        </div>
    );
}

export default ReceptionistDashboard; 