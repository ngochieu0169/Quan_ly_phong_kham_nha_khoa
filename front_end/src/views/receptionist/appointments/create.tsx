import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { appointmentService, shiftService, userServiceExtended, clinicService } from '../../../services';

interface AppointmentForm {
    maBenhNhan: number;
    maCaKham: number;
    trieuChung: string;
    trangThai: string;
    ngayDatLich: string;
}

interface Patient {
    maNguoiDung: number;
    hoTen: string;
    soDienThoai: string;
    eMail: string;
    ngaySinh: string;
    gioiTinh: string;
    diaChi: string;
}

interface Shift {
    maCaKham: number;
    ngayKham: string;
    gioBatDau: string;
    gioKetThuc: string;
    maNhaSi?: string;
    tenNhaSi?: string;
    moTa?: string;
}

interface Clinic {
    maPhongKham: number;
    tenPhongKham: string;
    diaChi: string;
    soDienThoai: string;
    gioLamViec: string;
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

function CreateAppointment() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedClinic, setSelectedClinic] = useState<number>(0);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableShifts, setAvailableShifts] = useState<Shift[]>([]);

    const [formData, setFormData] = useState<AppointmentForm>({
        maBenhNhan: 0,
        maCaKham: 0,
        trieuChung: '',
        trangThai: 'Chờ',
        ngayDatLich: new Date().toISOString().split('T')[0]
    });

    const [errors, setErrors] = useState<any>({});

    const statusOptions = [
        { value: 'Chờ', label: 'Chờ xác nhận', color: 'warning' },
        { value: 'Đã đặt', label: 'Đã đặt', color: 'info' },
        { value: 'Đã đến', label: 'Đã đến', color: 'primary' },
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchAvailableShifts();
        }
    }, [selectedDate, selectedClinic, selectedDoctor]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [patientsRes, clinicsRes, doctorsRes] = await Promise.all([
                userServiceExtended.getFullList({ maQuyen: 4 }), // Patients
                clinicService.all(),
                userServiceExtended.getFullList({ maQuyen: 2 }) // Doctors
            ]);

            setPatients(patientsRes.data);
            setClinics(clinicsRes.data);
            setDoctors(doctorsRes.data);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableShifts = async () => {
        try {
            const shiftsRes = await shiftService.all();
            let filteredShifts = shiftsRes.data.filter((shift: any) => {
                const shiftDate = new Date(shift.ngayKham).toISOString().split('T')[0];
                return shiftDate === selectedDate;
            });

            // Filter by clinic if selected
            if (selectedClinic) {
                const clinicDoctors = doctors.filter(doc =>
                    doc.bacsiData?.maPhongKham === selectedClinic
                );
                const clinicDoctorIds = clinicDoctors.map(doc => doc.bacsiData?.maNhaSi);
                filteredShifts = filteredShifts.filter((shift: any) =>
                    clinicDoctorIds.includes(shift.maNhaSi)
                );
            }

            // Filter by doctor if selected
            if (selectedDoctor) {
                filteredShifts = filteredShifts.filter((shift: any) =>
                    shift.maNhaSi === selectedDoctor
                );
            }

            // Enrich with doctor info
            const enrichedShifts = filteredShifts.map((shift: any) => {
                const doctor = doctors.find(doc => doc.bacsiData?.maNhaSi === shift.maNhaSi);
                return {
                    ...shift,
                    tenNhaSi: doctor?.hoTen || 'Chưa phân công'
                };
            });

            setAvailableShifts(enrichedShifts);
        } catch (error) {
            toast.error('Không thể tải ca khám');
        }
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.maBenhNhan) newErrors.maBenhNhan = 'Vui lòng chọn bệnh nhân';
        if (!formData.maCaKham) newErrors.maCaKham = 'Vui lòng chọn ca khám';
        if (!formData.trieuChung.trim()) newErrors.trieuChung = 'Vui lòng nhập triệu chứng';
        if (!formData.ngayDatLich) newErrors.ngayDatLich = 'Vui lòng chọn ngày khám';

        // Check if selected date is not in the past
        const selectedDateObj = new Date(formData.ngayDatLich);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDateObj < today) {
            newErrors.ngayDatLich = 'Không thể đặt lịch cho ngày đã qua';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setLoading(true);
            await appointmentService.create(formData);
            toast.success('Tạo lịch khám thành công!');
            navigate('/le-tan/appointments');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo lịch khám';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof AppointmentForm, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        handleInputChange('ngayDatLich', date);
        // Reset shift selection when date changes
        handleInputChange('maCaKham', 0);
    };

    const formatTime = (time: string) => {
        return time ? time.substring(0, 5) : '';
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

    const getSelectedPatient = () => {
        return patients.find(p => p.maNguoiDung === formData.maBenhNhan);
    };

    const getSelectedShift = () => {
        return availableShifts.find(s => s.maCaKham === formData.maCaKham);
    };

    if (loading && patients.length === 0) {
        return (
            <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Tạo lịch khám mới</h4>
                    <p className="text-muted mb-0">Đặt lịch khám cho bệnh nhân</p>
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/le-tan/appointments')}
                >
                    <i className="icofont-arrow-left me-2"></i>Quay lại
                </button>
            </div>

            <div className="row">
                {/* Form */}
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {/* Patient Selection */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h6 className="text-primary mb-3">
                                            <i className="icofont-user me-2"></i>Thông tin bệnh nhân
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-8">
                                                <label className="form-label">Chọn bệnh nhân *</label>
                                                <select
                                                    className={`form-select ${errors.maBenhNhan ? 'is-invalid' : ''}`}
                                                    value={formData.maBenhNhan}
                                                    onChange={(e) => handleInputChange('maBenhNhan', parseInt(e.target.value))}
                                                >
                                                    <option value={0}>-- Chọn bệnh nhân --</option>
                                                    {patients.map(patient => (
                                                        <option key={patient.maNguoiDung} value={patient.maNguoiDung}>
                                                            {patient.hoTen} - {patient.soDienThoai}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.maBenhNhan && <div className="invalid-feedback">{errors.maBenhNhan}</div>}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Thao tác</label>
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm me-2"
                                                        onClick={() => navigate('/le-tan/patients')}
                                                    >
                                                        <i className="icofont-plus me-1"></i>Thêm BN mới
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Patient Info Display */}
                                        {getSelectedPatient() && (
                                            <div className="alert alert-info mt-3">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <strong>Họ tên:</strong> {getSelectedPatient()?.hoTen}<br />
                                                        <strong>SĐT:</strong> {getSelectedPatient()?.soDienThoai}<br />
                                                        <strong>Email:</strong> {getSelectedPatient()?.eMail}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <strong>Tuổi:</strong> {calculateAge(getSelectedPatient()?.ngaySinh || '')} tuổi<br />
                                                        <strong>Giới tính:</strong> {getSelectedPatient()?.gioiTinh}<br />
                                                        <strong>Địa chỉ:</strong> {getSelectedPatient()?.diaChi}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Appointment Details */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h6 className="text-primary mb-3">
                                            <i className="icofont-calendar me-2"></i>Thông tin lịch khám
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <label className="form-label">Ngày khám *</label>
                                                <input
                                                    type="date"
                                                    className={`form-control ${errors.ngayDatLich ? 'is-invalid' : ''}`}
                                                    value={selectedDate}
                                                    onChange={(e) => handleDateChange(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                                {errors.ngayDatLich && <div className="invalid-feedback">{errors.ngayDatLich}</div>}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Phòng khám</label>
                                                <select
                                                    className="form-select"
                                                    value={selectedClinic}
                                                    onChange={(e) => setSelectedClinic(parseInt(e.target.value))}
                                                >
                                                    <option value={0}>-- Tất cả phòng khám --</option>
                                                    {clinics.map(clinic => (
                                                        <option key={clinic.maPhongKham} value={clinic.maPhongKham}>
                                                            {clinic.tenPhongKham}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Bác sĩ</label>
                                                <select
                                                    className="form-select"
                                                    value={selectedDoctor}
                                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                                >
                                                    <option value="">-- Tất cả bác sĩ --</option>
                                                    {doctors
                                                        .filter(doc => !selectedClinic || doc.bacsiData?.maPhongKham === selectedClinic)
                                                        .map(doctor => (
                                                            <option key={doctor.maNguoiDung} value={doctor.bacsiData?.maNhaSi}>
                                                                {doctor.hoTen}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Available Shifts */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <label className="form-label">Ca khám có sẵn *</label>
                                        {availableShifts.length > 0 ? (
                                            <div className="row g-3">
                                                {availableShifts.map(shift => (
                                                    <div key={shift.maCaKham} className="col-md-6 col-lg-4">
                                                        <div className={`card h-100 cursor-pointer ${formData.maCaKham === shift.maCaKham ? 'border-primary bg-light' : 'border-light'}`}>
                                                            <div className="card-body p-3">
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name="shift"
                                                                        id={`shift-${shift.maCaKham}`}
                                                                        value={shift.maCaKham}
                                                                        checked={formData.maCaKham === shift.maCaKham}
                                                                        onChange={(e) => handleInputChange('maCaKham', parseInt(e.target.value))}
                                                                    />
                                                                    <label className="form-check-label w-100" htmlFor={`shift-${shift.maCaKham}`}>
                                                                        <div className="fw-bold text-primary">
                                                                            {formatTime(shift.gioBatDau)} - {formatTime(shift.gioKetThuc)}
                                                                        </div>
                                                                        <div className="small text-muted">
                                                                            <i className="icofont-doctor me-1"></i>
                                                                            {shift.tenNhaSi}
                                                                        </div>
                                                                        {shift.moTa && (
                                                                            <div className="small text-muted mt-1">
                                                                                {shift.moTa}
                                                                            </div>
                                                                        )}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="alert alert-warning">
                                                <i className="icofont-info-circle me-2"></i>
                                                Không có ca khám nào khả dụng cho ngày đã chọn. Vui lòng chọn ngày khác.
                                            </div>
                                        )}
                                        {errors.maCaKham && <div className="text-danger mt-2">{errors.maCaKham}</div>}
                                    </div>
                                </div>

                                {/* Symptoms */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h6 className="text-primary mb-3">
                                            <i className="icofont-prescription me-2"></i>Triệu chứng
                                        </h6>
                                        <textarea
                                            className={`form-control ${errors.trieuChung ? 'is-invalid' : ''}`}
                                            rows={4}
                                            value={formData.trieuChung}
                                            onChange={(e) => handleInputChange('trieuChung', e.target.value)}
                                            placeholder="Mô tả chi tiết triệu chứng của bệnh nhân..."
                                        />
                                        {errors.trieuChung && <div className="invalid-feedback">{errors.trieuChung}</div>}
                                        <div className="form-text">
                                            Vui lòng mô tả chi tiết các triệu chứng để bác sĩ có thể chuẩn bị tốt nhất.
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label">Trạng thái ban đầu</label>
                                        <select
                                            className="form-select"
                                            value={formData.trangThai}
                                            onChange={(e) => handleInputChange('trangThai', e.target.value)}
                                        >
                                            {statusOptions.map(status => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="d-flex gap-3">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <i className="icofont-calendar me-2"></i>Tạo lịch khám
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/le-tan/appointments')}
                                        disabled={loading}
                                    >
                                        Hủy bỏ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="col-lg-4">
                    <div className="card position-sticky" style={{ top: '20px' }}>
                        <div className="card-header">
                            <h6 className="mb-0">Tóm tắt lịch khám</h6>
                        </div>
                        <div className="card-body">
                            {getSelectedPatient() ? (
                                <div className="mb-3">
                                    <small className="text-muted">Bệnh nhân</small>
                                    <div className="fw-bold">{getSelectedPatient()?.hoTen}</div>
                                    <div className="small text-muted">{getSelectedPatient()?.soDienThoai}</div>
                                </div>
                            ) : (
                                <div className="text-muted mb-3">
                                    <i className="icofont-user me-2"></i>Chưa chọn bệnh nhân
                                </div>
                            )}

                            {formData.ngayDatLich ? (
                                <div className="mb-3">
                                    <small className="text-muted">Ngày khám</small>
                                    <div className="fw-bold">
                                        {new Date(formData.ngayDatLich).toLocaleDateString('vi-VN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted mb-3">
                                    <i className="icofont-calendar me-2"></i>Chưa chọn ngày
                                </div>
                            )}

                            {getSelectedShift() ? (
                                <div className="mb-3">
                                    <small className="text-muted">Thời gian</small>
                                    <div className="fw-bold">
                                        {formatTime(getSelectedShift()?.gioBatDau || '')} - {formatTime(getSelectedShift()?.gioKetThuc || '')}
                                    </div>
                                    <div className="small text-muted">
                                        <i className="icofont-doctor me-1"></i>{getSelectedShift()?.tenNhaSi}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted mb-3">
                                    <i className="icofont-clock-time me-2"></i>Chưa chọn ca khám
                                </div>
                            )}

                            {formData.trieuChung ? (
                                <div className="mb-3">
                                    <small className="text-muted">Triệu chứng</small>
                                    <div className="small">
                                        {formData.trieuChung.length > 100
                                            ? formData.trieuChung.substring(0, 100) + '...'
                                            : formData.trieuChung
                                        }
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted mb-3">
                                    <i className="icofont-prescription me-2"></i>Chưa nhập triệu chứng
                                </div>
                            )}

                            <div className="mb-3">
                                <small className="text-muted">Trạng thái</small>
                                <div>
                                    <span className={`badge bg-${statusOptions.find(s => s.value === formData.trangThai)?.color}`}>
                                        {statusOptions.find(s => s.value === formData.trangThai)?.label}
                                    </span>
                                </div>
                            </div>

                            <hr />

                            <div className="alert alert-info small">
                                <i className="icofont-info-circle me-2"></i>
                                Lịch khám sẽ được tạo và có thể chỉnh sửa sau khi tạo thành công.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .cursor-pointer {
                    cursor: pointer;
                }
                .cursor-pointer:hover {
                    background-color: #f8f9fa !important;
                }
                .position-sticky {
                    position: sticky !important;
                }
            `}</style>
        </div>
    );
}

export default CreateAppointment; 