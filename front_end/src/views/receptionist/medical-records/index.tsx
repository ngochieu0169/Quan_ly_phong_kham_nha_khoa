import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { medicalRecordService, appointmentService, userService, userServiceExtended } from '../../../services';

interface MedicalRecord {
    maPhieuKham: number;
    ketQuaChuanDoan: string;
    ngayTaiKham: string | null;
    maLichKham: number;
    tenBenhNhan?: string;
    ngayKham?: string;
    trieuChung?: string;
    tenNhaSi?: string;
    soDienThoai?: string;
}

interface Appointment {
    maLichKham: number;
    maBenhNhan: number;
    ngayDatLich: string;
    trieuChung: string;
    trangThai: string;
    tenBenhNhan?: string;
    tenNhaSi?: string;
    soDienThoai?: string;
}

function ReceptionistMedicalRecords() {
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<{
        ketQuaChuanDoan: string;
        ngayTaiKham: string;
    }>({
        ketQuaChuanDoan: '',
        ngayTaiKham: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [recordRes, appointmentRes, patientRes] = await Promise.all([
                medicalRecordService.all(),
                appointmentService.all(),
                userServiceExtended.getFullList({ maQuyen: 4 })
            ]);

            const records = recordRes.data;
            const appointments = appointmentRes.data;
            const patients = patientRes.data;

            // Filter appointments by date
            const dayAppointments = appointments.filter((apt: any) => {
                const aptDate = new Date(apt.ngayDatLich).toISOString().split('T')[0];
                return aptDate === selectedDate;
            });

            // Enrich appointments with patient info
            const enrichedAppointments = dayAppointments.map((apt: any) => {
                const patient = patients.find((p: any) => p.maNguoiDung === apt.maBenhNhan);
                return {
                    ...apt,
                    tenBenhNhan: patient?.hoTen,
                    soDienThoai: patient?.soDienThoai
                };
            });

            // Enrich medical records with appointment and patient info
            const enrichedRecords = records.map((record: any) => {
                const appointment = appointments.find((a: any) => a.maLichKham === record.maLichKham);
                const patient = patients.find((p: any) => p.maNguoiDung === appointment?.maBenhNhan);

                return {
                    ...record,
                    tenBenhNhan: patient?.hoTen,
                    soDienThoai: patient?.soDienThoai,
                    ngayKham: appointment?.ngayDatLich,
                    trieuChung: appointment?.trieuChung,
                    tenNhaSi: appointment?.tenNhaSi
                };
            });

            // Filter records by date
            const dayRecords = enrichedRecords.filter((record: any) => {
                if (!record.ngayKham) return false;
                const recordDate = new Date(record.ngayKham).toISOString().split('T')[0];
                return recordDate === selectedDate;
            });

            setMedicalRecords(dayRecords);
            setAppointments(enrichedAppointments);
        } catch (error) {
            toast.error('Không thể tải dữ liệu phiếu khám');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (record: MedicalRecord) => {
        setSelectedRecord(record);
        setIsEditing(false);
        setShowDetailModal(true);
    };

    const handleEdit = (record: MedicalRecord) => {
        setSelectedRecord(record);
        setEditFormData({
            ketQuaChuanDoan: record.ketQuaChuanDoan,
            ngayTaiKham: record.ngayTaiKham || ''
        });
        setIsEditing(true);
        setShowDetailModal(true);
    };

    const handleSave = async () => {
        if (!selectedRecord) return;

        setSaving(true);
        const updateData = {
            ketQuaChuanDoan: editFormData.ketQuaChuanDoan,
            ngayTaiKham: editFormData.ngayTaiKham || null,
            maLichKham: selectedRecord.maLichKham
        };

        const response = await medicalRecordService.update(selectedRecord.maPhieuKham, updateData);
        if (response.status === 200) {
            toast.success('Cập nhật phiếu khám thành công!');
            setIsEditing(false);
            setShowDetailModal(false);
            fetchData();
        } else {
            toast.error('Có lỗi xảy ra khi cập nhật phiếu khám!');
        }
        setSaving(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditFormData({
            ketQuaChuanDoan: '',
            ngayTaiKham: ''
        });
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatDateTime = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Filter records
    const filteredRecords = medicalRecords.filter(record => {
        if (!searchTerm) return true;

        return record.tenBenhNhan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.soDienThoai?.includes(searchTerm) ||
            record.ketQuaChuanDoan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.maPhieuKham.toString().includes(searchTerm);
    });

    // Get appointments that completed examination but don't have medical records yet
    const completedAppointmentsWithoutRecords = appointments.filter(apt =>
        apt.trangThai === 'Hoàn thành' &&
        !medicalRecords.some(record => record.maLichKham === apt.maLichKham)
    );

    // Statistics
    const stats = {
        totalRecords: medicalRecords.length,
        todayAppointments: appointments.length,
        completedExams: appointments.filter(a => a.trangThai === 'Hoàn thành').length,
        pendingRecords: completedAppointmentsWithoutRecords.length,
        withFollowUp: medicalRecords.filter(r => r.ngayTaiKham).length
    };

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Cập nhật phiếu khám bệnh</h4>
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
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.totalRecords}</h5>
                            <small>Phiếu khám</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.todayAppointments}</h5>
                            <small>Lịch hẹn hôm nay</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.completedExams}</h5>
                            <small>Đã khám xong</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-warning text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.pendingRecords}</h5>
                            <small>Chờ tạo phiếu</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-secondary text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.withFollowUp}</h5>
                            <small>Có tái khám</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-dark text-white">
                        <div className="card-body text-center py-2">
                            <h5>{filteredRecords.length}</h5>
                            <small>Kết quả lọc</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Records Alert */}
            {completedAppointmentsWithoutRecords.length > 0 && (
                <div className="alert alert-warning mb-4">
                    <div className="d-flex align-items-center">
                        <i className="icofont-warning me-2 fs-4"></i>
                        <div>
                            <strong>Có {completedAppointmentsWithoutRecords.length} ca khám đã hoàn thành nhưng chưa có phiếu khám</strong>
                            <br />
                            <small>Vui lòng nhắc nhở bác sĩ tạo phiếu khám cho các ca này.</small>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="card mb-3">
                <div className="card-body py-2">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm kiếm theo mã phiếu, tên BN, SĐT, chuẩn đoán..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6 text-end">
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

            {/* Medical Records List */}
            <div className="card">
                <div className="card-header">
                    <h6 className="mb-0">
                        <i className="icofont-prescription me-2"></i>Danh sách phiếu khám
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
                                        <th>Mã phiếu</th>
                                        <th>Bệnh nhân</th>
                                        <th>Ngày khám</th>
                                        <th>Nha sĩ</th>
                                        <th>Triệu chứng</th>
                                        <th>Kết quả chẩn đoán</th>
                                        <th>Tái khám</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record, index) => (
                                        <tr key={record.maPhieuKham}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span className="fw-bold text-primary">
                                                    PK{record.maPhieuKham.toString().padStart(6, '0')}
                                                </span>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-bold">{record.tenBenhNhan}</div>
                                                    <small className="text-muted">{record.soDienThoai}</small>
                                                </div>
                                            </td>
                                            <td>{formatDate(record.ngayKham)}</td>
                                            <td>{record.tenNhaSi || '-'}</td>
                                            <td>
                                                <span title={record.trieuChung}>
                                                    {record.trieuChung && record.trieuChung.length > 30
                                                        ? record.trieuChung.substring(0, 30) + '...'
                                                        : record.trieuChung
                                                    }
                                                </span>
                                            </td>
                                            <td>
                                                <span title={record.ketQuaChuanDoan}>
                                                    {record.ketQuaChuanDoan.length > 40
                                                        ? record.ketQuaChuanDoan.substring(0, 40) + '...'
                                                        : record.ketQuaChuanDoan
                                                    }
                                                </span>
                                            </td>
                                            <td>
                                                {record.ngayTaiKham ? (
                                                    <span className="badge bg-warning">
                                                        {formatDate(record.ngayTaiKham)}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">Không</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleViewDetail(record)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <i className="icofont-eye"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-warning"
                                                        onClick={() => handleEdit(record)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <i className="icofont-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        title="In phiếu khám"
                                                    >
                                                        <i className="icofont-print"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredRecords.length === 0 && (
                                <div className="text-center py-4 text-muted">
                                    <i className="icofont-prescription fs-3"></i>
                                    <p className="mt-2">Không có phiếu khám nào</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Completed Appointments without Medical Records */}
            {completedAppointmentsWithoutRecords.length > 0 && (
                <div className="card mt-4">
                    <div className="card-header bg-warning text-dark">
                        <h6 className="mb-0">
                            <i className="icofont-medical-sign me-2"></i>
                            Ca khám đã hoàn thành - Chờ tạo phiếu khám
                        </h6>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã lịch khám</th>
                                        <th>Bệnh nhân</th>
                                        <th>Ngày khám</th>
                                        <th>Nha sĩ</th>
                                        <th>Triệu chứng</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completedAppointmentsWithoutRecords.map((appointment, index) => (
                                        <tr key={appointment.maLichKham}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span className="fw-bold">
                                                    LK{appointment.maLichKham.toString().padStart(6, '0')}
                                                </span>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-bold">{appointment.tenBenhNhan}</div>
                                                    <small className="text-muted">{appointment.soDienThoai}</small>
                                                </div>
                                            </td>
                                            <td>{formatDate(appointment.ngayDatLich)}</td>
                                            <td>{appointment.tenNhaSi || '-'}</td>
                                            <td>{appointment.trieuChung}</td>
                                            <td>
                                                <span className="badge bg-success">{appointment.trangThai}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedRecord && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="icofont-prescription me-2"></i>
                                    {isEditing ? 'Chỉnh sửa' : 'Chi tiết'} phiếu khám PK{selectedRecord.maPhieuKham.toString().padStart(6, '0')}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        setIsEditing(false);
                                    }}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Mã phiếu khám</label>
                                        <p className="form-control-plaintext">
                                            PK{selectedRecord.maPhieuKham.toString().padStart(6, '0')}
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Ngày khám</label>
                                        <p className="form-control-plaintext">
                                            {formatDateTime(selectedRecord.ngayKham)}
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Bệnh nhân</label>
                                        <p className="form-control-plaintext">{selectedRecord.tenBenhNhan}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Số điện thoại</label>
                                        <p className="form-control-plaintext">{selectedRecord.soDienThoai}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Nha sĩ khám</label>
                                        <p className="form-control-plaintext">{selectedRecord.tenNhaSi || '-'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Ngày tái khám</label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={editFormData.ngayTaiKham}
                                                onChange={(e) => setEditFormData({
                                                    ...editFormData,
                                                    ngayTaiKham: e.target.value
                                                })}
                                            />
                                        ) : (
                                            <p className="form-control-plaintext">
                                                {selectedRecord.ngayTaiKham ? (
                                                    <span className="badge bg-warning fs-6">
                                                        {formatDate(selectedRecord.ngayTaiKham)}
                                                    </span>
                                                ) : (
                                                    'Không có'
                                                )}
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-bold">Triệu chứng ban đầu</label>
                                        <p className="form-control-plaintext border rounded p-2 bg-light">
                                            {selectedRecord.trieuChung}
                                        </p>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-bold">Kết quả chẩn đoán</label>
                                        {isEditing ? (
                                            <textarea
                                                className="form-control"
                                                rows={4}
                                                value={editFormData.ketQuaChuanDoan}
                                                onChange={(e) => setEditFormData({
                                                    ...editFormData,
                                                    ketQuaChuanDoan: e.target.value
                                                })}
                                                placeholder="Nhập kết quả chẩn đoán..."
                                            />
                                        ) : (
                                            <p className="form-control-plaintext border rounded p-2 bg-light">
                                                {selectedRecord.ketQuaChuanDoan}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                {isEditing ? (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleSave}
                                            disabled={saving || !editFormData.ketQuaChuanDoan.trim()}
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="icofont-save me-2"></i>Lưu thay đổi
                                                </>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowDetailModal(false);
                                                setIsEditing(false);
                                            }}
                                        >
                                            Đóng
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-warning"
                                            onClick={() => {
                                                setEditFormData({
                                                    ketQuaChuanDoan: selectedRecord.ketQuaChuanDoan,
                                                    ngayTaiKham: selectedRecord.ngayTaiKham || ''
                                                });
                                                setIsEditing(true);
                                            }}
                                        >
                                            <i className="icofont-edit me-2"></i>Chỉnh sửa
                                        </button>
                                        <button type="button" className="btn btn-primary">
                                            <i className="icofont-print me-2"></i>In phiếu khám
                                        </button>
                                        <button type="button" className="btn btn-success">
                                            <i className="icofont-download me-2"></i>Xuất PDF
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReceptionistMedicalRecords; 