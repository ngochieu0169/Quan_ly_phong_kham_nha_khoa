import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QRCode from 'qrcode';
import { invoiceService, medicalRecordService, serviceService, appointmentService, invoiceServiceExtended } from '../../../services';

interface Invoice {
    maHoaDon: number;
    soTien: number;
    phuongThuc: string;
    trangThai: string;
    ngaytao: string;
    ngayThanhToan: string | null;
    maPhieuKham: number;
    tenBenhNhan?: string;
    soDienThoai?: string;
    maLichKham?: number;
    ketQuaChuanDoan?: string;
    trieuChung?: string;
    ngayKham?: string;
}

interface MedicalRecord {
    maPhieuKham: number;
    ketQuaChuanDoan: string;
    ngayTaiKham: string | null;
    maLichKham: number;
    tenBenhNhan?: string;
    ngayKham?: string;
    trieuChung?: string;
    services?: ServiceUsage[];
}

interface ServiceUsage {
    maDichVu: number;
    tenDichVu: string;
    soLuong: number;
    donGia: number;
    thanhTien: number;
}

interface Service {
    maDichVu: number;
    tenDichVu: string;
    donGia: number;
    moTa: string;
}

interface InvoiceDetail {
    maDichVu: number;
    tenDichVu: string;
    soLuong: number;
    donGia: number;
    thanhTien: number;
}

function ReceptionistBilling() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(''); // Mặc định hiển thị tất cả
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);



    // Payment modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrCodeDataURL, setQRCodeDataURL] = useState('');

    // Detail modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetail[]>([]);

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [invoiceRes, recordRes, serviceRes] = await Promise.all([
                invoiceService.all(),
                medicalRecordService.all(),
                serviceService.all()
            ]);

            const invoices = invoiceRes.data; // Đã có đầy đủ thông tin bệnh nhân từ backend
            const records = recordRes.data;

            console.log('=== BILLING DEBUG ===');
            console.log('Selected date:', selectedDate);
            console.log('All invoices with patient info:', invoices);

            // Filter by date
            let filteredInvoices = invoices;
            if (selectedDate && selectedDate !== '') {
                filteredInvoices = invoices.filter((inv: any) => {
                    const invDate = new Date(inv.ngaytao).toISOString().split('T')[0];
                    return invDate === selectedDate;
                });
                console.log(`Filtered by date ${selectedDate}:`, filteredInvoices.length);
            } else {
                console.log('Showing all invoices (no date filter)');
            }

            console.log('Final filtered invoices:', filteredInvoices);

            // Filter ra những hóa đơn có dữ liệu không hợp lệ (soTien null hoặc maPhieuKham null)
            const validInvoices = filteredInvoices.filter((inv: any) =>
                inv.soTien !== null && inv.maPhieuKham !== null
            );

            console.log('Valid invoices only:', validInvoices);

            // Không cần map thêm vì backend đã trả về đầy đủ thông tin
            setInvoices(validInvoices);

            // Enrich medical records cho các chức năng khác
            const enrichedRecords = records.map((record: any) => {
                return {
                    ...record,
                    tenBenhNhan: record?.benhNhanHoTen,
                    ngayKham: record?.ngayKham,
                    trieuChung: record?.trieuChung
                };
            });

            setMedicalRecords(enrichedRecords);

            // Kiểm tra cấu trúc dữ liệu services
            const servicesData = serviceRes.data?.data || serviceRes.data;
            console.log('Services data:', servicesData);
            setServices(servicesData);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (invoiceId: number, paymentMethod: string) => {
        try {
            // Hiển thị loading toast
            const loadingToast = toast.loading('Đang xử lý thanh toán...');

            const currentDate = new Date().toISOString();

            // Lấy thông tin hóa đơn hiện tại để giữ lại các trường quan trọng
            const currentInvoice = selectedInvoice;

            await invoiceService.update(invoiceId, {
                soTien: currentInvoice?.soTien || 0,
                phuongThuc: paymentMethod,
                trangThai: 'Đã thu tiền',
                ngaytao: currentInvoice?.ngaytao || currentDate,
                ngayThanhToan: currentDate,
                maPhieuKham: currentInvoice?.maPhieuKham || null
            });

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            // Hiển thị thông báo thành công tùy theo phương thức
            if (paymentMethod === 'Tiền mặt') {
                toast.success('Cập nhật thanh toán thành công!', {
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            } else {
                toast.success(`Thanh toán ${paymentMethod.toLowerCase()} thành công`);
            }

            setShowPaymentModal(false);
            setShowQRCode(false);
            setSelectedInvoice(null);
            fetchData();
        } catch (error) {
            toast.error('Thanh toán thất bại. Vui lòng thử lại');
            console.error('Payment error:', error);
        }
    };

    const handleOpenPaymentModal = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setShowQRCode(false);
        setShowPaymentModal(true);
    };

    const handleDirectPayment = (method: string) => {
        if (selectedInvoice) {
            handlePayment(selectedInvoice.maHoaDon, method);
        }
    };

    const handleOnlinePayment = async () => {
        try {
            const qrData = generateQRData();
            const qrCodeURL = await QRCode.toDataURL(qrData, {
                errorCorrectionLevel: 'M',
                width: 250,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQRCodeDataURL(qrCodeURL);
            setShowQRCode(true);
        } catch (error) {
            toast.error('Không thể tạo mã QR');
            console.error('QR Code generation error:', error);
        }
    };

    const generateQRData = () => {
        if (!selectedInvoice) return '';

        // Thông tin ngân hàng (có thể config từ env hoặc settings)
        const bankInfo = {
            bankId: 'MB', // Ngân hàng MB Bank
            accountNumber: '0123456789', // Số tài khoản
            accountName: 'PHONG KHAM NHA KHOA ABC',
            amount: selectedInvoice.soTien,
            description: `Thanh toan HD${selectedInvoice.maHoaDon?.toString().padStart(6, '0') || 'N/A'}`
        };

        // Tạo chuỗi QR theo chuẩn VietQR
        return `${bankInfo.bankId}|${bankInfo.accountNumber}|${bankInfo.accountName}|${bankInfo.amount}|${bankInfo.description}`;
    };

    const confirmOnlinePayment = () => {
        if (selectedInvoice) {
            handlePayment(selectedInvoice.maHoaDon, 'Chuyển khoản');
        }
    };

    const handleViewInvoiceDetail = async (invoice: Invoice) => {
        try {
            // Lấy chi tiết hóa đơn thật từ API
            const detailRes = await invoiceServiceExtended.getDetailWithServices(invoice.maHoaDon);
            const invoiceDetail = detailRes.data;

            setInvoiceDetails(invoiceDetail.chiTiet || []);
            setSelectedInvoice({
                ...invoice,
                tenBenhNhan: invoiceDetail.tenBenhNhan,
                soDienThoai: invoiceDetail.soDienThoai,
                ngayKham: invoiceDetail.ngayKham,
                trieuChung: invoiceDetail.trieuChung
            });
            setShowDetailModal(true);
        } catch (error) {
            toast.error('Không thể tải chi tiết hóa đơn');
            console.error('Error loading invoice details:', error);
        }
    };



    const exportReport = () => {
        // Implement export functionality
        toast.info('Chức năng xuất báo cáo đang được phát triển');
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

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusBadge = (status: string | null | undefined) => {
        if (!status) return 'badge bg-secondary';
        switch (status) {
            case 'Đã thu tiền': return 'badge bg-success';
            case 'Chưa thu tiền': return 'badge bg-warning text-dark';
            case 'Hủy': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    };

    const getPaymentMethodIcon = (method: string | null | undefined) => {
        if (!method) return 'icofont-question-circle text-muted';
        switch (method) {
            case 'Tiền mặt': return 'icofont-money text-success';
            case 'Thẻ': return 'icofont-credit-card text-primary';
            case 'Chuyển khoản': return 'icofont-bank text-info';
            default: return 'icofont-question-circle text-muted';
        }
    };

    // Filter and pagination
    const filteredInvoices = invoices.filter(invoice => {
        const matchStatus = !filterStatus || invoice.trangThai === filterStatus;
        const matchSearch = !searchTerm ||
            invoice.tenBenhNhan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.soDienThoai?.includes(searchTerm) ||
            invoice.maHoaDon.toString().includes(searchTerm);

        return matchStatus && matchSearch;
    });

    const totalPages = Math.ceil(filteredInvoices.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + pageSize);

    // Ẩn phần tạo hóa đơn vì bác sĩ đã tạo trực tiếp
    const recordsWithoutInvoice: MedicalRecord[] = [];

    // Statistics
    const stats = {
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(inv => inv.trangThai === 'Đã thu tiền').length,
        unpaidInvoices: invoices.filter(inv => inv.trangThai === 'Chưa thu tiền').length,
        totalRevenue: invoices.filter(inv => inv.trangThai === 'Đã thu tiền')
            .reduce((sum, inv) => sum + inv.soTien, 0),
        pendingAmount: invoices.filter(inv => inv.trangThai === 'Chưa thu tiền')
            .reduce((sum, inv) => sum + inv.soTien, 0)
    };

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Quản lý thanh toán hóa đơn</h4>
                <div className="d-flex align-items-center gap-3">
                    <select
                        className="form-select"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="">Tất cả ngày</option>
                        <option value={new Date().toISOString().split('T')[0]}>Hôm nay</option>
                        <option value={new Date(Date.now() - 86400000).toISOString().split('T')[0]}>Hôm qua</option>
                    </select>
                    <input
                        type="date"
                        className="form-control"
                        value={selectedDate === '' ? '' : selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '180px' }}
                        placeholder="Chọn ngày cụ thể"
                    />
                    <button className="btn btn-primary" onClick={fetchData}>
                        <i className="icofont-refresh me-2"></i>Làm mới
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="row mb-4">
                <div className="col-md-2">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.totalInvoices}</h5>
                            <small>Tổng HĐ</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.paidInvoices}</h5>
                            <small>Đã thu</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-warning text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.unpaidInvoices}</h5>
                            <small>Chưa thu</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center py-2">
                            <h6>{formatCurrency(stats.totalRevenue).replace('₫', '')}</h6>
                            <small>Đã thu</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-danger text-white">
                        <div className="card-body text-center py-2">
                            <h6>{formatCurrency(stats.pendingAmount).replace('₫', '')}</h6>
                            <small>Chờ thu</small>
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
                                placeholder="Tìm kiếm theo mã HĐ, tên BN, SĐT..."
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
                                <option value="Đã thu tiền">Đã thu tiền</option>
                                <option value="Chưa thu tiền">Chưa thu tiền</option>
                                <option value="Hủy">Hủy</option>
                            </select>
                        </div>
                        <div className="col-md-5 text-end">
                            <span className="text-muted me-3">
                                Ngày: {selectedDate && selectedDate !== '' ? new Date(selectedDate).toLocaleDateString('vi-VN') : 'Tất cả'}
                            </span>
                            <button className="btn btn-outline-success" onClick={exportReport}>
                                <i className="icofont-download"></i> Xuất báo cáo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thông báo về việc tạo hóa đơn */}
            <div className="alert alert-info mb-4">
                <i className="icofont-info-circle me-2"></i>
                <strong>Lưu ý:</strong> Hóa đơn được tạo trực tiếp bởi bác sĩ sau khi khám bệnh.
                Lễ tân chỉ thực hiện thu tiền và quản lý thanh toán.
            </div>

            {/* Invoices List */}
            <div className="card">
                <div className="card-header">
                    <h6 className="mb-0">
                        <i className="icofont-bill me-2"></i>Danh sách hóa đơn
                    </h6>
                </div>
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
                                        <th>STT</th>
                                        <th>Mã HĐ</th>
                                        <th>Phiếu khám</th>
                                        <th>Bệnh nhân</th>
                                        <th>Số tiền</th>
                                        <th>Phương thức</th>
                                        <th>Ngày tạo</th>
                                        <th>Ngày TT</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedInvoices.map((invoice, index) => (
                                        <tr key={invoice.maHoaDon}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>
                                                <span className="fw-bold">HD{invoice.maHoaDon?.toString().padStart(6, '0') || 'N/A'}</span>
                                            </td>
                                            <td>PK{invoice.maPhieuKham?.toString().padStart(6, '0') || 'N/A'}</td>
                                            <td>
                                                <div>
                                                    <div className="fw-bold">{invoice.tenBenhNhan || 'N/A'}</div>
                                                    <small className="text-muted">{invoice.soDienThoai || 'N/A'}</small>
                                                </div>
                                            </td>
                                            <td className="text-primary fw-bold">{formatCurrency(invoice.soTien)}</td>
                                            <td>
                                                <i className={`${getPaymentMethodIcon(invoice.phuongThuc)} me-1`}></i>
                                                <span className="text-muted">{invoice.phuongThuc}</span>
                                            </td>
                                            <td>
                                                <small>{formatDate(invoice.ngaytao)}</small>
                                            </td>
                                            <td>
                                                {invoice.ngayThanhToan ? (
                                                    <small className="text-success fw-bold">
                                                        {formatDate(invoice.ngayThanhToan)}
                                                    </small>
                                                ) : (
                                                    <small className="text-muted">-</small>
                                                )}
                                            </td>
                                            <td>
                                                <span className={getStatusBadge(invoice.trangThai)}>
                                                    {invoice.trangThai}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    {invoice.trangThai === 'Chưa thu tiền' && (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleOpenPaymentModal(invoice)}
                                                        >
                                                            <i className="icofont-money me-1"></i>Thu tiền
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Xem chi tiết"
                                                        onClick={() => handleViewInvoiceDetail(invoice)}
                                                    >
                                                        <i className="icofont-eye"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {paginatedInvoices.length === 0 && (
                                <div className="text-center py-4 text-muted">
                                    <i className="icofont-bill fs-3"></i>
                                    <p className="mt-2">Không có hóa đơn nào</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                        <span className="text-muted">
                                            Hiển thị {startIndex + 1}-{Math.min(startIndex + pageSize, filteredInvoices.length)}
                                            của {filteredInvoices.length} hóa đơn
                                        </span>
                                    </div>
                                    <nav>
                                        <ul className="pagination pagination-sm mb-0">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Trước
                                                </button>
                                            </li>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Sau
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>



            {/* Payment Modal */}
            {showPaymentModal && selectedInvoice && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Thanh toán - HD{selectedInvoice.maHoaDon?.toString().padStart(6, '0') || 'N/A'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-4 p-3 bg-light rounded">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div><strong>Bệnh nhân:</strong> {selectedInvoice.tenBenhNhan || 'N/A'}</div>
                                            <div><strong>SĐT:</strong> {selectedInvoice.soDienThoai || 'N/A'}</div>
                                            <div><strong>Phiếu khám:</strong> PK{selectedInvoice.maPhieuKham?.toString().padStart(6, '0') || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6 text-end">
                                            <div><strong>Ngày tạo:</strong> {formatDate(selectedInvoice.ngaytao)}</div>
                                            <div><strong>Trạng thái:</strong> <span className={getStatusBadge(selectedInvoice.trangThai)}>{selectedInvoice.trangThai}</span></div>
                                            <div className="mt-2">
                                                <strong>Tổng tiền:</strong>
                                                <div className="fs-5 text-primary fw-bold">
                                                    {formatCurrency(selectedInvoice.soTien)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!showQRCode ? (
                                    <div>
                                        <h6 className="mb-3">Chọn phương thức thanh toán:</h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="card border-2">
                                                    <div className="card-body text-center">
                                                        <i className="icofont-money fs-2 text-success mb-3"></i>
                                                        <h6>Thu tiền trực tiếp</h6>
                                                        <p className="text-muted small">Thu tiền mặt tại quầy</p>
                                                        <div className="d-grid gap-2">
                                                            <button
                                                                className="btn btn-success"
                                                                onClick={() => handleDirectPayment('Tiền mặt')}
                                                            >
                                                                <i className="icofont-money me-2"></i>Tiền mặt
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-success"
                                                                onClick={() => handleDirectPayment('Thẻ')}
                                                            >
                                                                <i className="icofont-credit-card me-2"></i>Thẻ
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="card border-2">
                                                    <div className="card-body text-center">
                                                        <i className="icofont-qr-code fs-2 text-primary mb-3"></i>
                                                        <h6>Thanh toán online</h6>
                                                        <p className="text-muted small">Quét mã QR để thanh toán</p>
                                                        <button
                                                            className="btn btn-primary w-100"
                                                            onClick={handleOnlinePayment}
                                                        >
                                                            <i className="icofont-qr-code me-2"></i>Tạo mã QR
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <h6 className="mb-3">Quét mã QR để thanh toán</h6>
                                        <div className="d-flex justify-content-center mb-4">
                                            <div className="p-4 bg-white border rounded shadow-sm">
                                                {qrCodeDataURL && (
                                                    <img
                                                        src={qrCodeDataURL}
                                                        alt="QR Code thanh toán"
                                                        className="img-fluid"
                                                        style={{ width: '250px', height: '250px' }}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="alert alert-info">
                                            <div className="row text-start">
                                                <div className="col-sm-6">
                                                    <strong>Ngân hàng:</strong> MB Bank<br />
                                                    <strong>Số TK:</strong> 0123456789
                                                </div>
                                                <div className="col-sm-6">
                                                    <strong>Chủ TK:</strong> PHONG KHAM NHA KHOA ABC<br />
                                                    <strong>Số tiền:</strong> {formatCurrency(selectedInvoice.soTien)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="alert alert-warning">
                                            <i className="icofont-warning me-2"></i>
                                            Sau khi chuyển khoản thành công, vui lòng nhấn "Xác nhận thanh toán" để hoàn tất.
                                        </div>

                                        <div className="d-flex gap-2 justify-content-center">
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => setShowQRCode(false)}
                                            >
                                                <i className="icofont-arrow-left me-2"></i>Quay lại
                                            </button>
                                            <button
                                                className="btn btn-success"
                                                onClick={confirmOnlinePayment}
                                            >
                                                <i className="icofont-check me-2"></i>Xác nhận thanh toán
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedInvoice && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Chi tiết hóa đơn - HD{selectedInvoice.maHoaDon?.toString().padStart(6, '0') || 'N/A'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-4 p-3 bg-light rounded">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div><strong>Bệnh nhân:</strong> {selectedInvoice.tenBenhNhan || 'N/A'}</div>
                                            <div><strong>SĐT:</strong> {selectedInvoice.soDienThoai || 'N/A'}</div>
                                            <div><strong>Ngày khám:</strong> {formatDate(selectedInvoice.ngayKham || null)}</div>
                                            {selectedInvoice.trieuChung && (
                                                <div><strong>Triệu chứng:</strong> {selectedInvoice.trieuChung}</div>
                                            )}
                                        </div>
                                        <div className="col-md-6 text-end">
                                            <div><strong>Mã HĐ:</strong> HD{selectedInvoice.maHoaDon?.toString().padStart(6, '0') || 'N/A'}</div>
                                            <div><strong>Phiếu khám:</strong> PK{selectedInvoice.maPhieuKham?.toString().padStart(6, '0') || 'N/A'}</div>
                                            <div><strong>Ngày tạo:</strong> {formatDate(selectedInvoice.ngaytao)}</div>
                                            <div><strong>Trạng thái:</strong> <span className={getStatusBadge(selectedInvoice.trangThai)}>{selectedInvoice.trangThai}</span></div>
                                            <div className="mt-2">
                                                <strong>Tổng tiền:</strong>
                                                <div className="fs-5 text-primary fw-bold">
                                                    {formatCurrency(selectedInvoice.soTien)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="mb-3">Chi tiết dịch vụ</h6>
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Dịch vụ</th>
                                                <th style={{ width: '100px' }}>Số lượng</th>
                                                <th style={{ width: '150px' }}>Đơn giá</th>
                                                <th style={{ width: '150px' }}>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceDetails.map((detail, index) => (
                                                <tr key={index}>
                                                    <td>{detail.tenDichVu}</td>
                                                    <td>{detail.soLuong}</td>
                                                    <td>{formatCurrency(detail.donGia)}</td>
                                                    <td>{formatCurrency(detail.thanhTien)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="table-success">
                                                <th colSpan={3} className="text-end">Tổng cộng:</th>
                                                <th className="text-end text-primary">
                                                    {formatCurrency(invoiceDetails.reduce((sum, detail) => sum + detail.thanhTien, 0))}
                                                </th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                                    Đóng
                                </button>
                                {selectedInvoice.trangThai === 'Chưa thu tiền' && (
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleOpenPaymentModal(selectedInvoice);
                                        }}
                                    >
                                        <i className="icofont-money me-2"></i>Thu tiền
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReceptionistBilling; 