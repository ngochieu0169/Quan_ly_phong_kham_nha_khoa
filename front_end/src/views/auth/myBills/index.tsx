import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { invoiceService, medicalRecordService, appointmentService } from '../../../services';

interface Invoice {
    maHoaDon: number;
    soTien: number;
    phuongThuc: string;
    trangThai: string;
    ngaytao: string;
    ngayThanhToan: string | null;
    maPhieuKham: number;
    // Extended fields
    maLichKham?: number;
    ngayKham?: string;
    trieuChung?: string;
    ketQuaChuanDoan?: string;
}

function MyBills() {
    const user = useSelector((state: any) => state.user.user);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái', color: 'secondary' },
        { value: 'Chưa thu tiền', label: 'Chưa thanh toán', color: 'warning' },
        { value: 'Đã thu tiền', label: 'Đã thanh toán', color: 'success' },
        { value: 'Hủy', label: 'Đã hủy', color: 'danger' }
    ];

    useEffect(() => {
        if (user?.maNguoiDung) {
            fetchMyBills();
        }
    }, [user]);

    const fetchMyBills = async () => {
        try {
            setLoading(true);

            // Lấy tất cả dữ liệu cần thiết
            const [invoiceRes, appointmentRes, recordRes] = await Promise.all([
                invoiceService.all(),
                appointmentService.all(),
                medicalRecordService.all()
            ]);

            const allInvoices = invoiceRes.data;
            const allAppointments = appointmentRes.data;
            const allRecords = recordRes.data;

            // Lấy các lịch khám của user hiện tại
            const userAppointments = allAppointments.filter(
                (apt: any) => apt.maBenhNhan === user.maNguoiDung
            );

            // Lấy các phiếu khám từ lịch khám của user
            const userRecords = allRecords.filter((record: any) =>
                userAppointments.some((apt: any) => apt.maLichKham === record.maLichKham)
            );

            // Lấy các hóa đơn từ phiếu khám của user
            const userInvoices = allInvoices.filter((invoice: any) =>
                userRecords.some((record: any) => record.maPhieuKham === invoice.maPhieuKham)
            );

            // Làm giàu dữ liệu hóa đơn
            const enrichedInvoices = userInvoices.map((invoice: any) => {
                const record = userRecords.find(
                    (r: any) => r.maPhieuKham === invoice.maPhieuKham
                );
                const appointment = userAppointments.find(
                    (a: any) => a.maLichKham === record?.maLichKham
                );

                return {
                    ...invoice,
                    maLichKham: record?.maLichKham,
                    ngayKham: appointment?.ngayDatLich,
                    trieuChung: appointment?.trieuChung,
                    ketQuaChuanDoan: record?.ketQuaChuanDoan
                };
            });

            // Sắp xếp theo ngày tạo mới nhất
            enrichedInvoices.sort((a: any, b: any) =>
                new Date(b.ngaytao).getTime() - new Date(a.ngaytao).getTime()
            );

            setInvoices(enrichedInvoices);
        } catch (error) {
            console.error('Error fetching bills:', error);
            toast.error('Không thể tải danh sách hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setShowDetailModal(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Chưa xác định';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Đã thu tiền': 'badge bg-success',
            'Chưa thu tiền': 'badge bg-warning',
            'Hủy': 'badge bg-danger'
        };
        return statusMap[status] || 'badge bg-secondary';
    };

    const getPaymentMethodIcon = (method: string) => {
        const iconMap: { [key: string]: string } = {
            'Tiền mặt': 'icofont-money',
            'Chuyển khoản': 'icofont-bank-transfer',
            'VNPay': 'icofont-credit-card',
            'Thẻ': 'icofont-credit-card'
        };
        return iconMap[method] || 'icofont-money';
    };

    // Filter invoices
    const filteredInvoices = invoices.filter(invoice => {
        const matchStatus = !filterStatus || invoice.trangThai === filterStatus;
        const matchSearch =
            !searchTerm ||
            invoice.maHoaDon.toString().includes(searchTerm) ||
            invoice.trieuChung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.ketQuaChuanDoan?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchStatus && matchSearch;
    });

    const billStats = {
        total: invoices.length,
        paid: invoices.filter(inv => inv.trangThai === 'Đã thu tiền').length,
        unpaid: invoices.filter(inv => inv.trangThai === 'Chưa thu tiền').length,
        cancelled: invoices.filter(inv => inv.trangThai === 'Hủy').length,
        totalAmount: invoices.reduce((sum, inv) => sum + inv.soTien, 0),
        paidAmount: invoices.filter(inv => inv.trangThai === 'Đã thu tiền')
            .reduce((sum, inv) => sum + inv.soTien, 0),
        unpaidAmount: invoices.filter(inv => inv.trangThai === 'Chưa thu tiền')
            .reduce((sum, inv) => sum + inv.soTien, 0)
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
                                <h2>Hóa đơn của tôi</h2>
                                <p className="text-muted">Quản lý các hóa đơn khám chữa bệnh</p>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="row mb-4">
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-info text-white h-100">
                                    <div className="card-body text-center">
                                        <h4 className="mb-0">{billStats.total}</h4>
                                        <small>Tổng hóa đơn</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-success text-white h-100">
                                    <div className="card-body text-center">
                                        <h4 className="mb-0">{billStats.paid}</h4>
                                        <small>Đã thanh toán</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-warning text-white h-100">
                                    <div className="card-body text-center">
                                        <h4 className="mb-0">{billStats.unpaid}</h4>
                                        <small>Chưa thanh toán</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-primary text-white h-100">
                                    <div className="card-body text-center">
                                        <h6 className="mb-0">{formatCurrency(billStats.totalAmount).replace('₫', '')}</h6>
                                        <small>Tổng tiền</small>
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
                                            placeholder="Tìm theo mã HĐ, triệu chứng hoặc chẩn đoán..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        <button
                                            className="btn btn-outline-primary w-100"
                                            onClick={fetchMyBills}
                                        >
                                            <i className="icofont-refresh me-2"></i>Làm mới
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bills List */}
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                            </div>
                        ) : filteredInvoices.length === 0 ? (
                            <div className="card">
                                <div className="card-body text-center py-5">
                                    <i className="icofont-bill fs-1 text-muted mb-3"></i>
                                    <h5 className="text-muted">Không có hóa đơn nào</h5>
                                    <p className="text-muted">
                                        {invoices.length === 0
                                            ? 'Bạn chưa có hóa đơn nào.'
                                            : 'Không tìm thấy hóa đơn phù hợp với bộ lọc.'
                                        }
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="row">
                                {filteredInvoices.map(invoice => (
                                    <div key={invoice.maHoaDon} className="col-lg-6 mb-4">
                                        <div className="card h-100 shadow-sm">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <h6 className="card-title text-primary mb-0">
                                                        Hóa đơn #{invoice.maHoaDon.toString().padStart(6, '0')}
                                                    </h6>
                                                    <span className={getStatusBadge(invoice.trangThai)}>
                                                        {invoice.trangThai}
                                                    </span>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="row text-sm">
                                                        <div className="col-6">
                                                            <strong><i className="icofont-calendar me-1"></i>Ngày tạo:</strong>
                                                            <br />
                                                            <span className="text-muted">
                                                                {formatDate(invoice.ngaytao)}
                                                            </span>
                                                        </div>
                                                        <div className="col-6">
                                                            <strong><i className="icofont-money me-1"></i>Số tiền:</strong>
                                                            <br />
                                                            <span className="text-primary fw-bold">
                                                                {formatCurrency(invoice.soTien)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <strong><i className="icofont-credit-card me-1"></i>Phương thức:</strong>
                                                    <span className="text-muted ms-1">
                                                        <i className={`${getPaymentMethodIcon(invoice.phuongThuc)} me-1`}></i>
                                                        {invoice.phuongThuc}
                                                    </span>
                                                </div>

                                                {invoice.ngayThanhToan && (
                                                    <div className="mb-3">
                                                        <strong><i className="icofont-check-alt me-1"></i>Ngày thanh toán:</strong>
                                                        <span className="text-muted ms-1">{formatDate(invoice.ngayThanhToan)}</span>
                                                    </div>
                                                )}

                                                <div className="mb-3">
                                                    <strong><i className="icofont-stethoscope me-1"></i>Ngày khám:</strong>
                                                    <span className="text-muted ms-1">{formatDate(invoice.ngayKham || null)}</span>
                                                </div>

                                                {invoice.trieuChung && (
                                                    <div className="mb-3">
                                                        <strong><i className="icofont-pills me-1"></i>Triệu chứng:</strong>
                                                        <p className="text-muted mb-0 mt-1">{invoice.trieuChung}</p>
                                                    </div>
                                                )}

                                                <div className="d-flex gap-2 mt-3">
                                                    <button
                                                        className="btn btn-outline-info btn-sm flex-grow-1"
                                                        onClick={() => handleViewDetail(invoice)}
                                                    >
                                                        <i className="icofont-eye me-1"></i>Chi tiết
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => window.print()}
                                                    >
                                                        <i className="icofont-print me-1"></i>In
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
            {showDetailModal && selectedInvoice && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="icofont-bill me-2"></i>
                                    Chi tiết hóa đơn #{selectedInvoice.maHoaDon.toString().padStart(6, '0')}
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
                                        <label className="form-label"><strong>Mã hóa đơn</strong></label>
                                        <p className="form-control-plaintext">HD{selectedInvoice.maHoaDon.toString().padStart(6, '0')}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Mã phiếu khám</strong></label>
                                        <p className="form-control-plaintext">PK{selectedInvoice.maPhieuKham.toString().padStart(6, '0')}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Ngày tạo</strong></label>
                                        <p className="form-control-plaintext">{formatDate(selectedInvoice.ngaytao)}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Ngày thanh toán</strong></label>
                                        <p className="form-control-plaintext">{formatDate(selectedInvoice.ngayThanhToan)}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Số tiền</strong></label>
                                        <p className="form-control-plaintext text-primary fw-bold">{formatCurrency(selectedInvoice.soTien)}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Phương thức thanh toán</strong></label>
                                        <p className="form-control-plaintext">
                                            <i className={`${getPaymentMethodIcon(selectedInvoice.phuongThuc)} me-1`}></i>
                                            {selectedInvoice.phuongThuc}
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Trạng thái</strong></label>
                                        <p className="form-control-plaintext">
                                            <span className={getStatusBadge(selectedInvoice.trangThai)}>
                                                {selectedInvoice.trangThai}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label"><strong>Ngày khám</strong></label>
                                        <p className="form-control-plaintext">{formatDate(selectedInvoice.ngayKham || null)}</p>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label"><strong>Triệu chứng</strong></label>
                                        <p className="form-control-plaintext">{selectedInvoice.trieuChung || 'Không có'}</p>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label"><strong>Kết quả chẩn đoán</strong></label>
                                        <p className="form-control-plaintext">{selectedInvoice.ketQuaChuanDoan || 'Chưa có kết quả'}</p>
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
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => window.print()}
                                >
                                    <i className="icofont-print me-2"></i>In hóa đơn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyBills; 