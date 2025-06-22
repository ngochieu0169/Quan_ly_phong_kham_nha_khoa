import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface RevenueData {
    month: string;
    revenue: number;
    appointments: number;
}

interface RevenueStats {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    totalAppointments: number;
    averagePerAppointment: number;
}

function RevenueManagement() {
    const [stats, setStats] = useState<RevenueStats>({
        thisMonth: 0,
        lastMonth: 0,
        thisYear: 0,
        totalAppointments: 0,
        averagePerAppointment: 0
    });
    const [chartData, setChartData] = useState<RevenueData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('6months');
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
                fetchRevenueData(clinic.maPhongKham);
            }
        } catch (error) {
            toast.error('Không thể tải thông tin phòng khám');
        } finally {
            setLoading(false);
        }
    };

    const fetchRevenueData = async (clinicId: number) => {
        try {
            // Mock data for demonstration
            const mockStats: RevenueStats = {
                thisMonth: 25750000,
                lastMonth: 23500000,
                thisYear: 145600000,
                totalAppointments: 156,
                averagePerAppointment: 165064
            };

            const mockChartData: RevenueData[] = [
                { month: '2024-01', revenue: 18500000, appointments: 95 },
                { month: '2024-02', revenue: 22300000, appointments: 112 },
                { month: '2024-03', revenue: 26100000, appointments: 134 },
                { month: '2024-04', revenue: 19800000, appointments: 108 },
                { month: '2024-05', revenue: 23500000, appointments: 125 },
                { month: '2024-06', revenue: 25750000, appointments: 156 },
            ];

            setStats(mockStats);
            setChartData(mockChartData);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu doanh thu:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getGrowthRate = () => {
        if (stats.lastMonth === 0) return 0;
        return ((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100);
    };

    const getMonthName = (monthStr: string) => {
        const months = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
            'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
            'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        const monthIndex = parseInt(monthStr.split('-')[1]) - 1;
        return months[monthIndex];
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

    if (!myClinic) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning text-center">
                    <h5>Chưa có phòng khám</h5>
                    <p>Bạn cần có phòng khám để xem thống kê doanh thu.</p>
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
                        Thống kê doanh thu
                    </h2>
                    <p className="text-muted mb-0">Báo cáo tài chính của {myClinic.tenPhongKham}</p>
                </div>
                <div className="d-flex gap-2">
                    <select
                        className="form-select"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="3months">3 tháng qua</option>
                        <option value="6months">6 tháng qua</option>
                        <option value="12months">12 tháng qua</option>
                    </select>
                    <button className="btn btn-outline-primary">
                        <i className="icofont-download me-2"></i>
                        Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                    <i className="icofont-money text-success fs-4"></i>
                                </div>
                                <div>
                                    <h3 className="text-success mb-1">{formatCurrency(stats.thisMonth)}</h3>
                                    <p className="text-muted mb-0 small">Doanh thu tháng này</p>
                                    <small className={`${getGrowthRate() >= 0 ? 'text-success' : 'text-danger'}`}>
                                        <i className={`icofont-${getGrowthRate() >= 0 ? 'arrow-up' : 'arrow-down'} me-1`}></i>
                                        {Math.abs(getGrowthRate()).toFixed(1)}% so với tháng trước
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                    <i className="icofont-calendar text-info fs-4"></i>
                                </div>
                                <div>
                                    <h3 className="text-info mb-1">{stats.totalAppointments}</h3>
                                    <p className="text-muted mb-0 small">Lượt khám tháng này</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                                    <i className="icofont-chart-bar-graph text-warning fs-4"></i>
                                </div>
                                <div>
                                    <h3 className="text-warning mb-1">{formatCurrency(stats.averagePerAppointment)}</h3>
                                    <p className="text-muted mb-0 small">Trung bình/lượt khám</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                    <i className="icofont-chart-growth text-primary fs-4"></i>
                                </div>
                                <div>
                                    <h3 className="text-primary mb-1">{formatCurrency(stats.thisYear)}</h3>
                                    <p className="text-muted mb-0 small">Tổng doanh thu năm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Revenue Chart */}
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Biểu đồ doanh thu theo tháng</h5>
                        </div>
                        <div className="card-body">
                            <div className="chart-container" style={{ height: '400px' }}>
                                {/* Simple bar chart representation */}
                                <div className="d-flex align-items-end justify-content-between h-100 py-3">
                                    {chartData.map((data, index) => {
                                        const height = (data.revenue / Math.max(...chartData.map(d => d.revenue))) * 100;
                                        return (
                                            <div key={index} className="d-flex flex-column align-items-center" style={{ width: '15%' }}>
                                                <div className="text-center mb-2">
                                                    <small className="fw-bold text-primary">{formatCurrency(data.revenue)}</small>
                                                    <br />
                                                    <small className="text-muted">{data.appointments} lượt</small>
                                                </div>
                                                <div
                                                    className="bg-primary rounded-top"
                                                    style={{
                                                        width: '100%',
                                                        height: `${height}%`,
                                                        minHeight: '20px',
                                                        opacity: 0.8
                                                    }}
                                                ></div>
                                                <small className="text-muted mt-2">{getMonthName(data.month)}</small>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Details */}
                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Chi tiết doanh thu</h5>
                        </div>
                        <div className="card-body">
                            <div className="list-group list-group-flush">
                                {chartData.slice(-3).reverse().map((data, index) => (
                                    <div key={index} className="list-group-item border-0 px-0">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1">{getMonthName(data.month)}</h6>
                                                <small className="text-muted">{data.appointments} lượt khám</small>
                                            </div>
                                            <div className="text-end">
                                                <span className="fw-bold text-success">{formatCurrency(data.revenue)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm mt-3">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Thông tin thêm</h5>
                        </div>
                        <div className="card-body">
                            <div className="list-group list-group-flush">
                                <div className="list-group-item border-0 px-0">
                                    <i className="icofont-info-circle text-primary me-2"></i>
                                    <small>Doanh thu được tính từ các hóa đơn đã thanh toán</small>
                                </div>
                                <div className="list-group-item border-0 px-0">
                                    <i className="icofont-calendar text-info me-2"></i>
                                    <small>Số liệu được cập nhật hàng ngày</small>
                                </div>
                                <div className="list-group-item border-0 px-0">
                                    <i className="icofont-chart-bar-graph text-warning me-2"></i>
                                    <small>Báo cáo chi tiết có thể xuất dưới dạng Excel</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RevenueManagement; 