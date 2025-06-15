import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { requestAPI } from '../../../axiosconfig';

interface PendingAssignment {
    maCaKham: number;
    ngayKham: string;
    gioBatDau: string;
    gioKetThuc: string;
    moTa: string;
    maLichKham: number;
    maBenhNhan: number;
    trieuChung: string;
    tenBenhNhan: string;
    soDienThoai: string;
    eMail: string;
    trangThaiLich: string;
}

interface Doctor {
    maNguoiDung: number;
    hoTen: string;
    bacsiData?: {
        maNhaSi: string;
        maPhongKham: number;
        kinhNghiem: string;
        chucVu: string;
    };
}

function PendingAssignments() {
    const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedShift, setSelectedShift] = useState<PendingAssignment | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [showAssignModal, setShowAssignModal] = useState(false);

    useEffect(() => {
        fetchPendingAssignments();
        fetchDoctors();
    }, []);

    const fetchPendingAssignments = async () => {
        try {
            const response = await requestAPI.get('/api/cakham/pending-assignments');
            setPendingAssignments(response.data);
        } catch (error) {
            toast.error('Không thể tải danh sách ca khám chưa phân công');
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await requestAPI.get('/api/nhasi');
            setDoctors(response.data);
        } catch (error) {
            toast.error('Không thể tải danh sách bác sĩ');
        }
    };

    const handleAssignDoctor = async () => {
        if (!selectedShift || !selectedDoctor) {
            toast.error('Vui lòng chọn bác sĩ');
            return;
        }

        try {
            setLoading(true);
            await requestAPI.put(`/api/cakham/${selectedShift.maCaKham}`, {
                maNhaSi: selectedDoctor
            });

            toast.success('Phân công bác sĩ thành công!');
            setShowAssignModal(false);
            setSelectedShift(null);
            setSelectedDoctor('');
            fetchPendingAssignments(); // Refresh list
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi phân công bác sĩ');
        } finally {
            setLoading(false);
        }
    };

    const openAssignModal = (shift: PendingAssignment) => {
        setSelectedShift(shift);
        setShowAssignModal(true);
        setSelectedDoctor('');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5);
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="icofont-clock-time me-2"></i>
                                Ca khám chưa phân công bác sĩ
                            </h3>
                            <div className="card-tools">
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={fetchPendingAssignments}
                                >
                                    <i className="icofont-refresh me-1"></i>
                                    Làm mới
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            {pendingAssignments.length === 0 ? (
                                <div className="text-center py-4">
                                    <i className="icofont-check-circled text-success" style={{ fontSize: '3rem' }}></i>
                                    <h5 className="mt-3">Không có ca khám nào cần phân công</h5>
                                    <p className="text-muted">Tất cả ca khám đã được phân công bác sĩ</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Ngày khám</th>
                                                <th>Giờ khám</th>
                                                <th>Bệnh nhân</th>
                                                <th>Liên hệ</th>
                                                <th>Triệu chứng</th>
                                                <th>Mô tả</th>
                                                <th>Trạng thái</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingAssignments.map((assignment) => (
                                                <tr key={assignment.maCaKham}>
                                                    <td>
                                                        <strong>{formatDate(assignment.ngayKham)}</strong>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-info">
                                                            {formatTime(assignment.gioBatDau)} - {formatTime(assignment.gioKetThuc)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong>{assignment.tenBenhNhan}</strong>
                                                            <br />
                                                            <small className="text-muted">ID: {assignment.maBenhNhan}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <i className="icofont-phone me-1"></i>
                                                            {assignment.soDienThoai}
                                                            <br />
                                                            <small className="text-muted">
                                                                <i className="icofont-email me-1"></i>
                                                                {assignment.eMail}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-wrap" style={{ maxWidth: '200px' }}>
                                                            {assignment.trieuChung}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="text-wrap" style={{ maxWidth: '200px' }}>
                                                            {assignment.moTa}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-warning">
                                                            {assignment.trangThaiLich}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => openAssignModal(assignment)}
                                                        >
                                                            <i className="icofont-doctor me-1"></i>
                                                            Phân công
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Doctor Modal */}
            {showAssignModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="icofont-doctor me-2"></i>
                                    Phân công bác sĩ
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAssignModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {selectedShift && (
                                    <div>
                                        <div className="mb-3">
                                            <h6>Thông tin ca khám:</h6>
                                            <div className="card bg-light">
                                                <div className="card-body">
                                                    <p><strong>Ngày:</strong> {formatDate(selectedShift.ngayKham)}</p>
                                                    <p><strong>Giờ:</strong> {formatTime(selectedShift.gioBatDau)} - {formatTime(selectedShift.gioKetThuc)}</p>
                                                    <p><strong>Bệnh nhân:</strong> {selectedShift.tenBenhNhan}</p>
                                                    <p><strong>Triệu chứng:</strong> {selectedShift.trieuChung}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Chọn bác sĩ:</label>
                                            <select
                                                className="form-select"
                                                value={selectedDoctor}
                                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                            >
                                                <option value="">-- Chọn bác sĩ --</option>
                                                {doctors.map((doctor) => (
                                                    <option
                                                        key={doctor.maNguoiDung}
                                                        value={doctor.bacsiData?.maNhaSi}
                                                    >
                                                        {doctor.hoTen} - {doctor.bacsiData?.chucVu}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAssignModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAssignDoctor}
                                    disabled={loading || !selectedDoctor}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Đang phân công...
                                        </>
                                    ) : (
                                        <>
                                            <i className="icofont-check me-1"></i>
                                            Phân công
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showAssignModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
}

export default PendingAssignments; 