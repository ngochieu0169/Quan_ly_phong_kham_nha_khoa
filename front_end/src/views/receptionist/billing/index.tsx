import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { invoiceService, medicalRecordService, serviceService, appointmentService } from '../../../services';

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

function ReceptionistBilling() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [showServiceModal, setShowServiceModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [serviceUsages, setServiceUsages] = useState<ServiceUsage[]>([]);

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [invoiceRes, recordRes, serviceRes, appointmentRes] = await Promise.all([
                invoiceService.all(),
                medicalRecordService.all(),
                serviceService.all(),
                appointmentService.all()
            ]);

            const invoices = invoiceRes.data;
            const records = recordRes.data;
            const appointments = appointmentRes.data;

            // Filter by date
            const filteredInvoices = invoices.filter((inv: any) => {
                const invDate = new Date(inv.ngaytao).toISOString().split('T')[0];
                return invDate === selectedDate;
            });

            // Enrich invoices with patient info
            const enrichedInvoices = filteredInvoices.map((inv: any) => {
                const record = records.find((r: any) => r.maPhieuKham === inv.maPhieuKham);
                const appointment = appointments.find((a: any) => a.maLichKham === record?.maLichKham);

                return {
                    ...inv,
                    tenBenhNhan: appointment?.tenBenhNhan,
                    soDienThoai: appointment?.soDienThoai,
                    maLichKham: record?.maLichKham
                };
            });

            // Enrich medical records
            const enrichedRecords = records.map((record: any) => {
                const appointment = appointments.find((a: any) => a.maLichKham === record.maLichKham);
                return {
                    ...record,
                    tenBenhNhan: appointment?.tenBenhNhan,
                    ngayKham: appointment?.ngayDatLich,
                    trieuChung: appointment?.trieuChung
                };
            });

            setInvoices(enrichedInvoices);
            setMedicalRecords(enrichedRecords);
            setServices(serviceRes.data);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (invoiceId: number, paymentMethod: string) => {
        try {
            await invoiceService.update(invoiceId, {
                trangThai: 'Đã thu tiền',
                phuongThuc: paymentMethod,
                ngayThanhToan: new Date().toISOString().split('T')[0]
            });
            toast.success('Thanh toán thành công');
            fetchData();
        } catch (error) {
            toast.error('Thanh toán thất bại');
        }
    };

    const handleUpdateServices = (record: MedicalRecord) => {
        setSelectedRecord(record);
        setServiceUsages(record.services || []);
        setShowServiceModal(true);
    };

    const addServiceUsage = () => {
        setServiceUsages([...serviceUsages, {
            maDichVu: 0,
            tenDichVu: '',
            soLuong: 1,
            donGia: 0,
            thanhTien: 0
        }]);
    };

    const removeServiceUsage = (index: number) => {
        setServiceUsages(serviceUsages.filter((_, i) => i !== index));
    };

    const updateServiceUsage = (index: number, field: keyof ServiceUsage, value: any) => {
        const updated = [...serviceUsages];
        updated[index] = { ...updated[index], [field]: value };

        // Auto calculate total when service or quantity changes
        if (field === 'maDichVu') {
            const service = services.find(s => s.maDichVu === value);
            if (service) {
                updated[index].tenDichVu = service.tenDichVu;
                updated[index].donGia = service.donGia;
                updated[index].thanhTien = service.donGia * updated[index].soLuong;
            }
        } else if (field === 'soLuong') {
            updated[index].thanhTien = updated[index].donGia * value;
        }

        setServiceUsages(updated);
    };

    const handleSaveServices = async () => {
        if (!selectedRecord) return;

        const totalAmount = serviceUsages.reduce((sum, usage) => sum + usage.thanhTien, 0);

        try {
            // Create or update invoice
            const invoiceData = {
                soTien: totalAmount,
                phuongThuc: 'Tiền mặt',
                trangThai: 'Chưa thu tiền',
                ngaytao: new Date().toISOString().split('T')[0],
                maPhieuKham: selectedRecord.maPhieuKham
            };

            // Check if invoice exists
            const existingInvoice = invoices.find(inv => inv.maPhieuKham === selectedRecord.maPhieuKham);

            if (existingInvoice) {
                await invoiceService.update(existingInvoice.maHoaDon, invoiceData);
            } else {
                await invoiceService.create(invoiceData);
            }

            toast.success('Cập nhật dịch vụ thành công');
            setShowServiceModal(false);
            setSelectedRecord(null);
            fetchData();
        } catch (error) {
            toast.error('Cập nhật thất bại');
        }
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

    // Filter data
    const filteredInvoices = invoices.filter(invoice => {
        const matchStatus = !filterStatus || invoice.trangThai === filterStatus;
        const matchSearch = !searchTerm ||
            invoice.tenBenhNhan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.soDienThoai?.includes(searchTerm) ||
            invoice.maHoaDon.toString().includes(searchTerm);

        return matchStatus && matchSearch;
    });

    const recordsWithoutInvoice = medicalRecords.filter(record =>
        !invoices.some(inv => inv.maPhieuKham === record.maPhieuKham)
    );

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
                <h4 className="mb-0">Quản lý thanh toán</h4>
                <div className="d-flex align-items-center gap-3">
                    <input
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '180px' }}
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
                                Ngày: {new Date(selectedDate).toLocaleDateString('vi-VN')}
                            </span>
                            <button className="btn btn-outline-success">
                                <i className="icofont-download"></i> Xuất báo cáo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Medical Records without Invoice */}
            {recordsWithoutInvoice.length > 0 && (
                <div className="card mb-4">
                    <div className="card-header bg-warning text-dark">
                        <h6 className="mb-0">
                            <i className="icofont-prescription me-2"></i>
                            Phiếu khám chưa tạo hóa đơn ({recordsWithoutInvoice.length})
                        </h6>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {recordsWithoutInvoice.slice(0, 6).map(record => (
                                <div key={record.maPhieuKham} className="col-md-4 mb-3">
                                    <div className="card border-warning">
                                        <div className="card-body">
                                            <h6 className="card-title">PK{record.maPhieuKham.toString().padStart(6, '0')}</h6>
                                            <p className="card-text">
                                                <strong>{record.tenBenhNhan}</strong><br />
                                                <small className="text-muted">{formatDate(record.ngayKham)}</small>
                                            </p>
                                            <button
                                                className="btn btn-sm btn-warning"
                                                onClick={() => handleUpdateServices(record)}
                                            >
                                                <i className="icofont-plus me-1"></i>Tạo hóa đơn
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
                                    {filteredInvoices.map((invoice, index) => (
                                        <tr key={invoice.maHoaDon}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span className="fw-bold">HD{invoice.maHoaDon.toString().padStart(6, '0')}</span>
                                            </td>
                                            <td>PK{invoice.maPhieuKham.toString().padStart(6, '0')}</td>
                                            <td>
                                                <div>
                                                    <div className="fw-bold">{invoice.tenBenhNhan}</div>
                                                    <small className="text-muted">{invoice.soDienThoai}</small>
                                                </div>
                                            </td>
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
                                                <div className="d-flex gap-1">
                                                    {invoice.trangThai === 'Chưa thu tiền' && (
                                                        <div className="dropdown">
                                                            <button
                                                                className="btn btn-sm btn-success dropdown-toggle"
                                                                type="button"
                                                                data-bs-toggle="dropdown"
                                                            >
                                                                <i className="icofont-money me-1"></i>Thu tiền
                                                            </button>
                                                            <ul className="dropdown-menu">
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => handlePayment(invoice.maHoaDon, 'Tiền mặt')}
                                                                    >
                                                                        <i className="icofont-money me-2"></i>Tiền mặt
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => handlePayment(invoice.maHoaDon, 'Chuyển khoản')}
                                                                    >
                                                                        <i className="icofont-bank-transfer me-2"></i>Chuyển khoản
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => handlePayment(invoice.maHoaDon, 'Thẻ')}
                                                                    >
                                                                        <i className="icofont-credit-card me-2"></i>Thẻ
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Xem chi tiết"
                                                    >
                                                        <i className="icofont-eye"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredInvoices.length === 0 && (
                                <div className="text-center py-4 text-muted">
                                    <i className="icofont-bill fs-3"></i>
                                    <p className="mt-2">Không có hóa đơn nào</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Service Modal */}
            {showServiceModal && selectedRecord && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Cập nhật dịch vụ - PK{selectedRecord.maPhieuKham.toString().padStart(6, '0')}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowServiceModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <strong>Bệnh nhân:</strong> {selectedRecord.tenBenhNhan} <br />
                                    <strong>Triệu chứng:</strong> {selectedRecord.trieuChung}
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6>Dịch vụ sử dụng</h6>
                                    <button className="btn btn-outline-primary btn-sm" onClick={addServiceUsage}>
                                        <i className="icofont-plus me-1"></i>Thêm dịch vụ
                                    </button>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Dịch vụ</th>
                                                <th width="100">Số lượng</th>
                                                <th width="150">Đơn giá</th>
                                                <th width="150">Thành tiền</th>
                                                <th width="50">Xóa</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {serviceUsages.map((usage, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <select
                                                            className="form-select"
                                                            value={usage.maDichVu}
                                                            onChange={(e) => updateServiceUsage(index, 'maDichVu', parseInt(e.target.value))}
                                                        >
                                                            <option value={0}>Chọn dịch vụ</option>
                                                            {services.map(service => (
                                                                <option key={service.maDichVu} value={service.maDichVu}>
                                                                    {service.tenDichVu}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            min="1"
                                                            value={usage.soLuong}
                                                            onChange={(e) => updateServiceUsage(index, 'soLuong', parseInt(e.target.value))}
                                                        />
                                                    </td>
                                                    <td className="text-end">
                                                        {formatCurrency(usage.donGia)}
                                                    </td>
                                                    <td className="text-end fw-bold">
                                                        {formatCurrency(usage.thanhTien)}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => removeServiceUsage(index)}
                                                        >
                                                            <i className="icofont-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <th colSpan={3} className="text-end">Tổng cộng:</th>
                                                <th className="text-end text-primary">
                                                    {formatCurrency(serviceUsages.reduce((sum, usage) => sum + usage.thanhTien, 0))}
                                                </th>
                                                <th></th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowServiceModal(false)}>
                                    Hủy
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveServices}>
                                    Lưu & Tạo hóa đơn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReceptionistBilling; 