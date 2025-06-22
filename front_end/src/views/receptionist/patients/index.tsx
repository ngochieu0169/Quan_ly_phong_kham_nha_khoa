import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { userService, userServiceExtended } from '../../../services';

interface Patient {
    maNguoiDung: number;
    tenTaiKhoan: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    eMail: string;
    soDienThoai: string;
    diaChi: string;
    anh: string | null;
}

interface PatientForm {
    tenTaiKhoan: string;
    matKhau: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    eMail: string;
    soDienThoai: string;
    diaChi: string;
}

function ReceptionistPatients() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<PatientForm>({
        tenTaiKhoan: '',
        matKhau: '',
        hoTen: '',
        ngaySinh: '',
        gioiTinh: 'Nam',
        eMail: '',
        soDienThoai: '',
        diaChi: ''
    });

    const [errors, setErrors] = useState<Partial<PatientForm>>({});

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await userServiceExtended.getFullList({ maQuyen: 4 }); // Patient role
            setPatients(response.data);
        } catch (error) {
            toast.error('Không thể tải danh sách bệnh nhân');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<PatientForm> = {};

        if (!formData.hoTen.trim()) newErrors.hoTen = 'Họ tên không được để trống';
        if (!formData.tenTaiKhoan.trim()) newErrors.tenTaiKhoan = 'Tên tài khoản không được để trống';
        if (!editingPatient && !formData.matKhau.trim()) newErrors.matKhau = 'Mật khẩu không được để trống';
        if (!formData.eMail.trim()) newErrors.eMail = 'Email không được để trống';
        if (!formData.soDienThoai.trim()) newErrors.soDienThoai = 'Số điện thoại không được để trống';
        if (!formData.ngaySinh) newErrors.ngaySinh = 'Ngày sinh không được để trống';
        if (!formData.diaChi.trim()) newErrors.diaChi = 'Địa chỉ không được để trống';

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.eMail && !emailRegex.test(formData.eMail)) {
            newErrors.eMail = 'Email không đúng định dạng';
        }

        // Phone number validation
        const phoneRegex = /^[0-9]{10,11}$/;
        if (formData.soDienThoai && !phoneRegex.test(formData.soDienThoai)) {
            newErrors.soDienThoai = 'Số điện thoại phải có 10-11 chữ số';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const submitData = {
                ...formData,
                maQuyen: 4 // Patient role
            };

            if (editingPatient) {
                await userService.update(editingPatient.maNguoiDung, submitData);
                toast.success('Cập nhật bệnh nhân thành công');
            } else {
                await userService.create(submitData);
                toast.success('Thêm bệnh nhân thành công');
            }

            setShowModal(false);
            resetForm();
            fetchPatients();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setFormData({
            tenTaiKhoan: patient.tenTaiKhoan,
            matKhau: '', // Don't populate password for security
            hoTen: patient.hoTen,
            ngaySinh: patient.ngaySinh?.split('T')[0] || '',
            gioiTinh: patient.gioiTinh,
            eMail: patient.eMail,
            soDienThoai: patient.soDienThoai,
            diaChi: patient.diaChi
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bệnh nhân này?')) {
            try {
                await userService.delete(id);
                toast.success('Xóa bệnh nhân thành công');
                fetchPatients();
            } catch (error) {
                toast.error('Không thể xóa bệnh nhân');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            tenTaiKhoan: '',
            matKhau: '',
            hoTen: '',
            ngaySinh: '',
            gioiTinh: 'Nam',
            eMail: '',
            soDienThoai: '',
            diaChi: ''
        });
        setEditingPatient(null);
        setErrors({});
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    // Filter patients
    const filteredPatients = patients.filter(patient => {
        if (!searchTerm) return true;

        return patient.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.soDienThoai.includes(searchTerm) ||
            patient.eMail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.diaChi.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Cập nhật bệnh nhân</h4>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    <i className="icofont-plus me-2"></i>Thêm bệnh nhân
                </button>
            </div>

            {/* Statistics */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <i className="icofont-users-alt-4 fs-1 mb-2"></i>
                            <h4>{patients.length}</h4>
                            <small>Tổng bệnh nhân</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <i className="icofont-user-male fs-1 mb-2"></i>
                            <h4>{patients.filter(p => p.gioiTinh === 'Nam').length}</h4>
                            <small>Nam</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body text-center">
                            <i className="icofont-user-female fs-1 mb-2"></i>
                            <h4>{patients.filter(p => p.gioiTinh === 'Nữ').length}</h4>
                            <small>Nữ</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center">
                            <i className="icofont-search-user fs-1 mb-2"></i>
                            <h4>{filteredPatients.length}</h4>
                            <small>Kết quả lọc</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="card mb-3">
                <div className="card-body py-2">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm kiếm theo tên, SĐT, email, địa chỉ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6 text-end">
                            <button className="btn btn-outline-primary me-2" onClick={fetchPatients}>
                                <i className="icofont-refresh"></i> Làm mới
                            </button>
                            <button className="btn btn-outline-success">
                                <i className="icofont-download"></i> Xuất Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Patients List */}
            <div className="card">
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
                                        <th>Mã BN</th>
                                        <th>Họ tên</th>
                                        <th>Tuổi/Giới tính</th>
                                        <th>Liên hệ</th>
                                        <th>Địa chỉ</th>
                                        <th>Tài khoản</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((patient, index) => (
                                        <tr key={patient.maNguoiDung}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span className="badge bg-primary">
                                                    BN{patient.maNguoiDung.toString().padStart(5, '0')}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                        {patient.hoTen.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{patient.hoTen}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <span className="fw-bold">{calculateAge(patient.ngaySinh)} tuổi</span>
                                                    <br />
                                                    <span className={`badge ${patient.gioiTinh === 'Nam' ? 'bg-info' : 'bg-warning'}`}>
                                                        {patient.gioiTinh}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div>
                                                        <i className="icofont-phone me-1"></i>
                                                        {patient.soDienThoai}
                                                    </div>
                                                    <div>
                                                        <i className="icofont-email me-1"></i>
                                                        <small className="text-muted">{patient.eMail}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span title={patient.diaChi}>
                                                    {patient.diaChi.length > 30
                                                        ? patient.diaChi.substring(0, 30) + '...'
                                                        : patient.diaChi
                                                    }
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-muted">{patient.tenTaiKhoan}</span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleEdit(patient)}
                                                        title="Sửa"
                                                    >
                                                        <i className="icofont-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(patient.maNguoiDung)}
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

                            {filteredPatients.length === 0 && (
                                <div className="text-center py-4 text-muted">
                                    <i className="icofont-users-alt-4 fs-3"></i>
                                    <p className="mt-2">Không tìm thấy bệnh nhân nào</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingPatient ? 'Sửa thông tin bệnh nhân' : 'Thêm bệnh nhân mới'}
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal} />
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Họ và tên *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.hoTen ? 'is-invalid' : ''}`}
                                                value={formData.hoTen}
                                                onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                                                placeholder="Nhập họ và tên"
                                            />
                                            {errors.hoTen && <div className="invalid-feedback">{errors.hoTen}</div>}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Tên tài khoản *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.tenTaiKhoan ? 'is-invalid' : ''}`}
                                                value={formData.tenTaiKhoan}
                                                onChange={(e) => setFormData({ ...formData, tenTaiKhoan: e.target.value })}
                                                placeholder="Nhập tên tài khoản"
                                            />
                                            {errors.tenTaiKhoan && <div className="invalid-feedback">{errors.tenTaiKhoan}</div>}
                                        </div>

                                        {!editingPatient && (
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Mật khẩu *</label>
                                                <input
                                                    type="password"
                                                    className={`form-control ${errors.matKhau ? 'is-invalid' : ''}`}
                                                    value={formData.matKhau}
                                                    onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                                                    placeholder="Nhập mật khẩu"
                                                />
                                                {errors.matKhau && <div className="invalid-feedback">{errors.matKhau}</div>}
                                            </div>
                                        )}

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Ngày sinh *</label>
                                            <input
                                                type="date"
                                                className={`form-control ${errors.ngaySinh ? 'is-invalid' : ''}`}
                                                value={formData.ngaySinh}
                                                onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                                            />
                                            {errors.ngaySinh && <div className="invalid-feedback">{errors.ngaySinh}</div>}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Giới tính</label>
                                            <select
                                                className="form-select"
                                                value={formData.gioiTinh}
                                                onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                                            >
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                                <option value="Khác">Khác</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email *</label>
                                            <input
                                                type="email"
                                                className={`form-control ${errors.eMail ? 'is-invalid' : ''}`}
                                                value={formData.eMail}
                                                onChange={(e) => setFormData({ ...formData, eMail: e.target.value })}
                                                placeholder="example@email.com"
                                            />
                                            {errors.eMail && <div className="invalid-feedback">{errors.eMail}</div>}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Số điện thoại *</label>
                                            <input
                                                type="tel"
                                                className={`form-control ${errors.soDienThoai ? 'is-invalid' : ''}`}
                                                value={formData.soDienThoai}
                                                onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                                                placeholder="0123456789"
                                            />
                                            {errors.soDienThoai && <div className="invalid-feedback">{errors.soDienThoai}</div>}
                                        </div>

                                        <div className="col-12 mb-3">
                                            <label className="form-label">Địa chỉ *</label>
                                            <textarea
                                                className={`form-control ${errors.diaChi ? 'is-invalid' : ''}`}
                                                rows={2}
                                                value={formData.diaChi}
                                                onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                                                placeholder="Nhập địa chỉ"
                                            />
                                            {errors.diaChi && <div className="invalid-feedback">{errors.diaChi}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingPatient ? 'Cập nhật' : 'Thêm mới'}
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

export default ReceptionistPatients; 