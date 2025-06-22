import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clinicService } from '../../../services';

interface Clinic {
    maPhongKham: number;
    tenPhongKham: string;
    diaChi: string;
    soDienThoai: string;
    gioLamViec: string;
    maChuPhongKham: string;
    trangthai: string;
}

function ClinicInfo() {
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        tenPhongKham: '',
        diaChi: '',
        soDienThoai: '',
        gioMo: '',
        gioDong: ''
    });

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchClinicInfo();
    }, []);

    const fetchClinicInfo = async () => {
        try {
            const response = await clinicService.all();
            const myClinic = response.data.find((c: Clinic) =>
                c.maChuPhongKham === currentUser.tenTaiKhoan
            );

            if (myClinic) {
                setClinic(myClinic);
                const [gioMo, gioDong] = myClinic.gioLamViec.split(' - ');
                setFormData({
                    tenPhongKham: myClinic.tenPhongKham,
                    diaChi: myClinic.diaChi,
                    soDienThoai: myClinic.soDienThoai,
                    gioMo: gioMo || '',
                    gioDong: gioDong || ''
                });
            }
        } catch (error) {
            toast.error('Không thể tải thông tin phòng khám');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clinic) return;

        try {
            const updateData = {
                tenPhongKham: formData.tenPhongKham,
                diaChi: formData.diaChi,
                soDienThoai: formData.soDienThoai,
                gioLamViec: `${formData.gioMo} - ${formData.gioDong}`
            };

            await clinicService.update(clinic.maPhongKham, updateData);
            toast.success('Cập nhật thông tin phòng khám thành công!');
            setIsEditing(false);
            fetchClinicInfo();
        } catch (error) {
            toast.error('Cập nhật thất bại. Vui lòng thử lại!');
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

    if (!clinic) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning text-center">
                    <h5>Chưa có thông tin phòng khám</h5>
                    <p>Bạn chưa có phòng khám nào được liên kết với tài khoản này.</p>
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
                        Thông tin phòng khám
                    </h2>
                    <p className="text-muted mb-0">Quản lý thông tin cơ bản của phòng khám</p>
                </div>
                <div>
                    {!isEditing ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsEditing(true)}
                        >
                            <i className="icofont-edit me-2"></i>
                            Chỉnh sửa
                        </button>
                    ) : (
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setIsEditing(false);
                                // Reset form data
                                const [gioMo, gioDong] = clinic.gioLamViec.split(' - ');
                                setFormData({
                                    tenPhongKham: clinic.tenPhongKham,
                                    diaChi: clinic.diaChi,
                                    soDienThoai: clinic.soDienThoai,
                                    gioMo: gioMo || '',
                                    gioDong: gioDong || ''
                                });
                            }}
                        >
                            <i className="icofont-close me-2"></i>
                            Hủy
                        </button>
                    )}
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="icofont-building me-2"></i>
                                Thông tin cơ bản
                            </h5>
                        </div>
                        <div className="card-body">
                            {!isEditing ? (
                                // View Mode
                                <div className="row g-4">
                                    <div className="col-md-12">
                                        <div className="info-item">
                                            <label className="fw-bold text-muted mb-2">Tên phòng khám</label>
                                            <h5 className="text-primary">{clinic.tenPhongKham}</h5>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="info-item">
                                            <label className="fw-bold text-muted mb-2">Địa chỉ</label>
                                            <p className="mb-0">
                                                <i className="icofont-location-pin text-danger me-2"></i>
                                                {clinic.diaChi}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="info-item">
                                            <label className="fw-bold text-muted mb-2">Số điện thoại</label>
                                            <p className="mb-0">
                                                <i className="icofont-phone text-success me-2"></i>
                                                {clinic.soDienThoai}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="info-item">
                                            <label className="fw-bold text-muted mb-2">Giờ làm việc</label>
                                            <p className="mb-0">
                                                <i className="icofont-clock-time text-info me-2"></i>
                                                {clinic.gioLamViec}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="info-item">
                                            <label className="fw-bold text-muted mb-2">Trạng thái</label>
                                            <div>
                                                <span className={`badge fs-6 ${clinic.trangthai === 'duyệt' ? 'bg-success' :
                                                        clinic.trangthai === 'VIP' ? 'bg-info' :
                                                            clinic.trangthai === 'uy tín' ? 'bg-secondary' : 'bg-warning'
                                                    }`}>
                                                    {clinic.trangthai}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Edit Mode
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label fw-bold">Tên phòng khám *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tenPhongKham"
                                                value={formData.tenPhongKham}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-12">
                                            <label className="form-label fw-bold">Địa chỉ *</label>
                                            <textarea
                                                className="form-control"
                                                name="diaChi"
                                                rows={3}
                                                value={formData.diaChi}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Số điện thoại *</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="soDienThoai"
                                                value={formData.soDienThoai}
                                                onChange={handleInputChange}
                                                pattern="[0-9]{10}"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Giờ mở cửa *</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                name="gioMo"
                                                value={formData.gioMo}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Giờ đóng cửa *</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                name="gioDong"
                                                value={formData.gioDong}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <hr />
                                            <div className="d-flex gap-2">
                                                <button type="submit" className="btn btn-primary">
                                                    <i className="icofont-save me-2"></i>
                                                    Lưu thay đổi
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Hướng dẫn</h5>
                        </div>
                        <div className="card-body">
                            <div className="list-group list-group-flush">
                                <div className="list-group-item border-0 px-0">
                                    <i className="icofont-info-circle text-primary me-2"></i>
                                    <small>Thông tin chính xác giúp bệnh nhân dễ dàng tìm và liên hệ với phòng khám</small>
                                </div>
                                <div className="list-group-item border-0 px-0">
                                    <i className="icofont-warning text-warning me-2"></i>
                                    <small>Trạng thái phòng khám được quản trị viên duyệt và cập nhật</small>
                                </div>
                                <div className="list-group-item border-0 px-0">
                                    <i className="icofont-phone text-success me-2"></i>
                                    <small>Số điện thoại sẽ hiển thị công khai cho bệnh nhân</small>
                                </div>
                                <div className="list-group-item border-0 px-0">
                                    <i className="icofont-clock-time text-info me-2"></i>
                                    <small>Giờ làm việc giúp bệnh nhân biết thời gian có thể đặt lịch</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {clinic.trangthai === 'chưa duyệt' && (
                        <div className="card shadow-sm mt-3">
                            <div className="card-body text-center">
                                <i className="icofont-exclamation-triangle text-warning fs-2 mb-3"></i>
                                <h6 className="text-warning">Phòng khám chưa được duyệt</h6>
                                <p className="small text-muted mb-0">
                                    Phòng khám của bạn đang chờ quản trị viên duyệt.
                                    Vui lòng chờ hoặc liên hệ hỗ trợ nếu cần thiết.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ClinicInfo; 