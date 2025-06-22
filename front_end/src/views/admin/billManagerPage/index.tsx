import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { invoiceService, medicalRecordService } from '../../../services';

interface Invoice {
    maHoaDon: number;
    soTien: number;
    phuongThuc: string;
    trangThai: string;
    ngaytao: string;
    ngayThanhToan: string | null;
    maPhieuKham: number;
    // Extended fields
    tenBenhNhan?: string;
    tenDichVu?: string;
    maLichKham?: number;
}

interface MedicalRecord {
    maPhieuKham: number;
    ketQuaChuanDoan: string;
    ngayTaiKham: string | null;
    maLichKham: number;
}

function BillManagerPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await invoiceService.all();
            setInvoices(res.data);
        } catch (error) {
            toast.error('Không thể tải danh sách hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            const updateData: any = { trangThai: newStatus };

            // If marking as paid, set payment date
            if (newStatus === 'Đã thu tiền') {
                updateData.ngayThanhToan = new Date().toISOString().split('T')[0];
            }

            await invoiceService.update(id, updateData);
            toast.success('Cập nhật trạng thái thành công');
            fetchInvoices();
        } catch (error) {
            toast.error('Cập nhật trạng thái thất bại');
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
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Đã thu tiền': 'success',
            'Chưa thu tiền': 'warning',
            'Hủy': 'danger'
        };
        return `badge bg-${statusMap[status] || 'secondary'}`;
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
        const matchSearch =
            invoice.maHoaDon.toString().includes(searchTerm) ||
            invoice.tenBenhNhan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.phuongThuc.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = !filterStatus || invoice.trangThai === filterStatus;

        let matchDate = true;
        if (startDate && endDate) {
            const invoiceDate = new Date(invoice.ngaytao);
            const start = new Date(startDate);
            const end = new Date(endDate);
            matchDate = invoiceDate >= start && invoiceDate <= end;
        }

        return matchSearch && matchStatus && matchDate;
    });

    // Calculate statistics
    const totalRevenue = filteredInvoices
        .filter(inv => inv.trangThai === 'Đã thu tiền')
        .reduce((sum, inv) => sum + inv.soTien, 0);

    const pendingRevenue = filteredInvoices
        .filter(inv => inv.trangThai === 'Chưa thu tiền')
        .reduce((sum, inv) => sum + inv.soTien, 0);

    return (
        <div className="container-fluid">
            <ToastContainer />
            <h4 className="mb-4">Cập nhật hóa đơn</h4>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Đã thu</h6>
                                    <h4 className="mb-0 mt-2">{formatCurrency(totalRevenue)}</h4>
                                </div>
                                <i className="icofont-money-bag fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Chưa thu</h6>
                                    <h4 className="mb-0 mt-2">{formatCurrency(pendingRevenue)}</h4>
                                </div>
                                <i className="icofont-clock-time fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Tổng hóa đơn</h6>
                                    <h4 className="mb-0 mt-2">{filteredInvoices.length}</h4>
                                </div>
                                <i className="icofont-file-document fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm kiếm theo mã HĐ, tên BN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="Đã thu tiền">Đã thu tiền</option>
                                <option value="Chưa thu tiền">Chưa thu tiền</option>
                                <option value="Hủy">Hủy</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <input
                                type="date"
                                className="form-control"
                                placeholder="Từ ngày"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <input
                                type="date"
                                className="form-control"
                                placeholder="Đến ngày"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3 text-end">
                            <button className="btn btn-primary me-2" onClick={fetchInvoices}>
                                <i className="icofont-refresh"></i> Làm mới
                            </button>
                            <button className="btn btn-success">
                                <i className="icofont-download"></i> Xuất Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice List */}
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
                                <th>Mã HĐ</th>
                                <th>Phiếu khám</th>
                                <th>Bệnh nhân</th>
                                <th>Số tiền</th>
                                <th>Phương thức</th>
                                <th>Ngày tạo</th>
                                <th>Ngày thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((invoice, idx) => (
                                <tr key={invoice.maHoaDon}>
                                    <td>{idx + 1}</td>
                                    <td className="fw-bold">HD{invoice.maHoaDon.toString().padStart(6, '0')}</td>
                                    <td>PK{invoice.maPhieuKham.toString().padStart(6, '0')}</td>
                                    <td>{invoice.tenBenhNhan || '-'}</td>
                                    <td className="text-primary fw-bold">{formatCurrency(invoice.soTien)}</td>
                                    <td>
                                        <i className={`${getPaymentMethodIcon(invoice.phuongThuc)} me-1`}></i>
                                        {invoice.phuongThuc}
                                    </td>
                                    <td>{formatDate(invoice.ngaytao)}</td>
                                    <td>{formatDate(invoice.ngayThanhToan)}</td>
                                    <td>
                                        <span className={getStatusBadge(invoice.trangThai)}>
                                            {invoice.trangThai}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="btn-group" role="group">
                                            <button
                                                className="btn btn-sm btn-info"
                                                onClick={() => handleViewDetail(invoice)}
                                                title="Xem chi tiết"
                                            >
                                                <i className="icofont-eye"></i>
                                            </button>
                                            {invoice.trangThai === 'Chưa thu tiền' && (
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleUpdateStatus(invoice.maHoaDon, 'Đã thu tiền')}
                                                    title="Xác nhận đã thu"
                                                >
                                                    <i className="icofont-check"></i>
                                                </button>
                                            )}
                                            {invoice.trangThai === 'Chưa thu tiền' && (
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleUpdateStatus(invoice.maHoaDon, 'Hủy')}
                                                    title="Hủy hóa đơn"
                                                >
                                                    <i className="icofont-close"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredInvoices.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            <i className="icofont-file-document fs-1"></i>
                            <p className="mt-2">Không tìm thấy hóa đơn nào</p>
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedInvoice && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Chi tiết hóa đơn HD{selectedInvoice.maHoaDon.toString().padStart(6, '0')}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDetailModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Mã phiếu khám:</strong> PK{selectedInvoice.maPhieuKham.toString().padStart(6, '0')}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Bệnh nhân:</strong> {selectedInvoice.tenBenhNhan || '-'}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Số tiền:</strong> <span className="text-primary">{formatCurrency(selectedInvoice.soTien)}</span>
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Phương thức:</strong> {selectedInvoice.phuongThuc}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Ngày tạo:</strong> {formatDate(selectedInvoice.ngaytao)}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Ngày thanh toán:</strong> {formatDate(selectedInvoice.ngayThanhToan)}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                        <strong>Trạng thái:</strong> <span className={getStatusBadge(selectedInvoice.trangThai)}>{selectedInvoice.trangThai}</span>
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
                                <button type="button" className="btn btn-primary">
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

export default BillManagerPage;
