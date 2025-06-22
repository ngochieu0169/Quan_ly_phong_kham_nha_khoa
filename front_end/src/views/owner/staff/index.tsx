import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface Doctor {
    maNhaSi: string;
    hoTen: string;
    kinhNghiem: string;
    chucVu: string;
    ghiChu: string;
    userData?: {
        ngaySinh: string;
        gioiTinh: string;
        eMail: string;
        soDienThoai: string;
        diaChi: string;
    };
}

interface Staff {
    tenTaiKhoan: string;
    hoTen: string;
    maQuyen: number;
    tenQuyen: string;
    eMail: string;
    soDienThoai: string;
}

function StaffManagement() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [receptionists, setReceptionists] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('doctors');
    const [showAddModal, setShowAddModal] = useState(false);
    const [myClinic, setMyClinic] = useState<any>(null);

    const [newStaff, setNewStaff] = useState({
        tenTaiKhoan: '',
        matKhau: '',
        hoTen: '',
        ngaySinh: '',
        gioiTinh: 'Nam',
        eMail: '',
        soDienThoai: '',
        diaChi: '',
        maQuyen: 2, // Default to doctor
        // Doctor specific fields
        kinhNghiem: '',
        chucVu: '',
        ghiChu: ''
    });

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
                fetchStaff(clinic.maPhongKham);
            }
        } catch (error) {
            toast.error('Không thể tải thông tin phòng khám');
        }
    };

    const fetchStaff = async (clinicId: number) => {
        try {
            // Fetch doctors
            const doctorsResponse = await axios.get(`http://localhost:3000/api/nhasi/phongkham/${clinicId}`);
            setDoctors(doctorsResponse.data);

            // Fetch receptionists - assuming there's an API for this
            // For now, we'll use a placeholder
            setReceptionists([]);

        } catch (error) {
            console.error('Lỗi khi tải danh sách nhân viên:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setNewStaff({
            ...newStaff,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!myClinic) {
            toast.error('Không tìm thấy thông tin phòng khám');
            return;
        }

        try {
            // First create user account
            const formData = new FormData();
            formData.append('tenTaiKhoan', newStaff.tenTaiKhoan);
            formData.append('matKhau', newStaff.matKhau);
            formData.append('maQuyen', newStaff.maQuyen.toString());
            formData.append('hoTen', newStaff.hoTen);
            formData.append('ngaySinh', newStaff.ngaySinh);
            formData.append('gioiTinh', newStaff.gioiTinh);
            formData.append('eMail', newStaff.eMail);
            formData.append('soDienThoai', newStaff.soDienThoai);
            formData.append('diaChi', newStaff.diaChi);

            await axios.post('http://localhost:3000/api/users/register', formData);

            // If it's a doctor, create doctor record
            if (newStaff.maQuyen === 2) {
                const doctorData = {
                    maNhaSi: newStaff.tenTaiKhoan,
                    maPhongKham: myClinic.maPhongKham,
                    hoTen: newStaff.hoTen,
                    kinhNghiem: newStaff.kinhNghiem,
                    chucVu: newStaff.chucVu,
                    ghiChu: newStaff.ghiChu
                };

                await axios.post('http://localhost:3000/api/nhasi', doctorData);
            }

            toast.success('Thêm nhân viên thành công!');
            setShowAddModal(false);
            resetForm();
            fetchStaff(myClinic.maPhongKham);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Thêm nhân viên thất bại');
        }
    };

    const resetForm = () => {
        setNewStaff({
            tenTaiKhoan: '',
            matKhau: '',
            hoTen: '',
            ngaySinh: '',
            gioiTinh: 'Nam',
            eMail: '',
            soDienThoai: '',
            diaChi: '',
            maQuyen: 2,
            kinhNghiem: '',
            chucVu: '',
            ghiChu: ''
        });
    };

    const deleteDoctor = async (maNhaSi: string) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa bác sĩ này?')) return;

        try {
            await axios.delete(`http://localhost:3000/api/nhasi/${maNhaSi}`);
            toast.success('Xóa bác sĩ thành công!');
            fetchStaff(myClinic.maPhongKham);
        } catch (error) {
            toast.error('Xóa bác sĩ thất bại');
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

    if (!myClinic) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning text-center">
                    <h5>Chưa có phòng khám</h5>
                    <p>Bạn cần có phòng khám để quản lý nhân viên.</p>
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
                        Quản lý nhân viên
                    </h2>
                    <p className="text-muted mb-0">Quản lý bác sĩ và lễ tân tại {myClinic.tenPhongKham}</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                >
                    <i className="icofont-plus me-2"></i>
                    Thêm nhân viên
                </button>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'doctors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('doctors')}
                    >
                        <i className="icofont-doctor me-2"></i>
                        Bác sĩ ({doctors.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'receptionists' ? 'active' : ''}`}
                        onClick={() => setActiveTab('receptionists')}
                    >
                        <i className="icofont-user-female me-2"></i>
                        Lễ tân ({receptionists.length})
                    </button>
                </li>
            </ul>

            {/* Content */}
            {activeTab === 'doctors' && (
                <div className="card shadow-sm">
                    <div className="card-header bg-light">
                        <h5 className="mb-0">Danh sách bác sĩ</h5>
                    </div>
                    <div className="card-body">
                        {doctors.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <i className="icofont-doctor fs-1 mb-3"></i>
                                <p>Chưa có bác sĩ nào trong phòng khám</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Mã bác sĩ</th>
                                            <th>Họ tên</th>
                                            <th>Chức vụ</th>
                                            <th>Kinh nghiệm</th>
                                            <th>Ghi chú</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {doctors.map((doctor) => (
                                            <tr key={doctor.maNhaSi}>
                                                <td>{doctor.maNhaSi}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar me-3">
                                                            <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                                <i className="icofont-doctor text-primary"></i>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{doctor.hoTen}</h6>
                                                            {doctor.userData && (
                                                                <small className="text-muted">{doctor.userData.eMail}</small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-info">{doctor.chucVu}</span>
                                                </td>
                                                <td>{doctor.kinhNghiem}</td>
                                                <td>{doctor.ghiChu}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Xem chi tiết"
                                                        >
                                                            <i className="icofont-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => deleteDoctor(doctor.maNhaSi)}
                                                            title="Xóa"
                                                        >
                                                            <i className="icofont-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'receptionists' && (
                <div className="card shadow-sm">
                    <div className="card-header bg-light">
                        <h5 className="mb-0">Danh sách lễ tân</h5>
                    </div>
                    <div className="card-body">
                        <div className="text-center py-4 text-muted">
                            <i className="icofont-user-female fs-1 mb-3"></i>
                            <p>Chức năng quản lý lễ tân đang được phát triển</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Thêm nhân viên mới</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowAddModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        {/* Basic Info */}
                                        <div className="col-md-6">
                                            <label className="form-label">Loại nhân viên *</label>
                                            <select
                                                name="maQuyen"
                                                value={newStaff.maQuyen}
                                                onChange={handleInputChange}
                                                className="form-select"
                                                required
                                            >
                                                <option value={2}>Bác sĩ</option>
                                                <option value={3}>Lễ tân</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Tên đăng nhập *</label>
                                            <input
                                                type="text"
                                                name="tenTaiKhoan"
                                                value={newStaff.tenTaiKhoan}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Mật khẩu *</label>
                                            <input
                                                type="password"
                                                name="matKhau"
                                                value={newStaff.matKhau}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Họ tên *</label>
                                            <input
                                                type="text"
                                                name="hoTen"
                                                value={newStaff.hoTen}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Ngày sinh *</label>
                                            <input
                                                type="date"
                                                name="ngaySinh"
                                                value={newStaff.ngaySinh}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Giới tính *</label>
                                            <select
                                                name="gioiTinh"
                                                value={newStaff.gioiTinh}
                                                onChange={handleInputChange}
                                                className="form-select"
                                                required
                                            >
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Email *</label>
                                            <input
                                                type="email"
                                                name="eMail"
                                                value={newStaff.eMail}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Số điện thoại *</label>
                                            <input
                                                type="tel"
                                                name="soDienThoai"
                                                value={newStaff.soDienThoai}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label">Địa chỉ *</label>
                                            <textarea
                                                name="diaChi"
                                                value={newStaff.diaChi}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                rows={2}
                                                required
                                            />
                                        </div>

                                        {/* Doctor specific fields */}
                                        {newStaff.maQuyen === 2 && (
                                            <>
                                                <div className="col-12">
                                                    <hr />
                                                    <h6 className="text-primary">Thông tin bác sĩ</h6>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Kinh nghiệm</label>
                                                    <input
                                                        type="text"
                                                        name="kinhNghiem"
                                                        value={newStaff.kinhNghiem}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                        placeholder="VD: 5 năm"
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Chức vụ</label>
                                                    <input
                                                        type="text"
                                                        name="chucVu"
                                                        value={newStaff.chucVu}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                        placeholder="VD: Bác sĩ chính"
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label">Ghi chú</label>
                                                    <textarea
                                                        name="ghiChu"
                                                        value={newStaff.ghiChu}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                        rows={2}
                                                        placeholder="Chuyên môn, đặc điểm..."
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary">
                                        <i className="icofont-plus me-2"></i>
                                        Thêm nhân viên
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StaffManagement; 