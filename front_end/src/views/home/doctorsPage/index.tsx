import React, { useEffect, useState } from 'react';
import { requestAPI } from '../../../axiosconfig';
import { Link } from 'react-router-dom';

interface Doctor {
    maNhaSi: string;
    hoTen: string;
    kinhNghiem: string;
    chucVu: string;
    ghiChu: string;
    maPhongKham: number;
    userData?: {
        ngaySinh: string;
        gioiTinh: string;
        eMail: string;
        soDienThoai: string;
        diaChi: string;
        anh: string;
    };
    phongKhamData?: {
        tenPhongKham: string;
        diaChi: string;
    };
}

interface Clinic {
    maPhongKham: number;
    tenPhongKham: string;
    diaChi: string;
}

const DoctorsPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClinic, setSelectedClinic] = useState<number>(0);
    const [selectedSpecialty, setSelectedSpecialty] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [doctorsRes, clinicsRes] = await Promise.all([
                requestAPI.get('/api/nhasi'),
                requestAPI.get('/api/phongkham')
            ]);

            setClinics(clinicsRes.data);

            // Enrich doctors with clinic data
            const doctorsWithClinicData = doctorsRes.data.map((doctor: Doctor) => {
                const clinic = clinicsRes.data.find((c: Clinic) => c.maPhongKham === doctor.maPhongKham);
                return {
                    ...doctor,
                    phongKhamData: clinic
                };
            });

            setDoctors(doctorsWithClinicData);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.chucVu.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClinic = selectedClinic === 0 || doctor.maPhongKham === selectedClinic;
        const matchesSpecialty = selectedSpecialty === '' || doctor.chucVu.includes(selectedSpecialty);

        return matchesSearch && matchesClinic && matchesSpecialty;
    });

    const specialties = [...new Set(doctors.map(d => d.chucVu))];

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <section
                className="page-title bg-1"
                style={{
                    background: "linear-gradient(rgba(35, 58, 102, 0.9), rgba(35, 58, 102, 0.9)), url('/images/bg/bg-2.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '100px 0'
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="block text-center">
                                <span className="text-white font-weight-bold text-lg">Đội ngũ chuyên gia</span>
                                <h1 className="text-capitalize mb-5 text-lg text-white">Danh sách bác sĩ</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="section">
                <div className="container">
                    <div className="row mb-5">
                        <div className="col-lg-12">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label">Tìm kiếm bác sĩ</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Nhập tên bác sĩ hoặc chuyên khoa..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Phòng khám</label>
                                            <select
                                                className="form-select"
                                                value={selectedClinic}
                                                onChange={(e) => setSelectedClinic(Number(e.target.value))}
                                            >
                                                <option value={0}>Tất cả phòng khám</option>
                                                {clinics.map(clinic => (
                                                    <option key={clinic.maPhongKham} value={clinic.maPhongKham}>
                                                        {clinic.tenPhongKham}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Chuyên khoa</label>
                                            <select
                                                className="form-select"
                                                value={selectedSpecialty}
                                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                            >
                                                <option value="">Tất cả chuyên khoa</option>
                                                {specialties.map(specialty => (
                                                    <option key={specialty} value={specialty}>
                                                        {specialty}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Doctors Grid */}
                    <div className="row">
                        {filteredDoctors.length === 0 ? (
                            <div className="col-12">
                                <div className="text-center py-5">
                                    <i className="icofont-doctor fs-1 text-muted mb-3"></i>
                                    <h5 className="text-muted">Không tìm thấy bác sĩ nào</h5>
                                    <p className="text-muted">Thử thay đổi bộ lọc để tìm kiếm</p>
                                </div>
                            </div>
                        ) : (
                            filteredDoctors.map((doctor) => (
                                <div key={doctor.maNhaSi} className="col-lg-4 col-md-6 col-sm-6 mb-4">
                                    <div className="card doctor-card h-100 shadow-sm border-0" style={{ transition: 'all 0.3s ease' }}>
                                        <div className="card-body text-center p-4">
                                            <div className="doctor-img mb-4">
                                                <img
                                                    src={doctor.userData?.anh ? `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/uploads/${doctor.userData.anh}` : '/images/team/1.jpg'}
                                                    alt={doctor.hoTen}
                                                    className="img-fluid rounded-circle"
                                                    style={{
                                                        width: '120px',
                                                        height: '120px',
                                                        objectFit: 'cover',
                                                        border: '4px solid #e8f4f8'
                                                    }}
                                                />
                                            </div>

                                            <h4 className="mb-2" style={{ color: '#223a66' }}>{doctor.hoTen}</h4>
                                            <p className="text-muted mb-3">{doctor.chucVu}</p>

                                            <div className="doctor-info mb-3">
                                                <div className="mb-2">
                                                    <small className="text-muted">
                                                        <i className="icofont-hospital me-2"></i>
                                                        {doctor.phongKhamData?.tenPhongKham}
                                                    </small>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">
                                                        <i className="icofont-briefcase me-2"></i>
                                                        Kinh nghiệm: {doctor.kinhNghiem}
                                                    </small>
                                                </div>
                                                {doctor.userData?.eMail && (
                                                    <div className="mb-2">
                                                        <small className="text-muted">
                                                            <i className="icofont-email me-2"></i>
                                                            {doctor.userData.eMail}
                                                        </small>
                                                    </div>
                                                )}
                                                {doctor.userData?.soDienThoai && (
                                                    <div className="mb-2">
                                                        <small className="text-muted">
                                                            <i className="icofont-phone me-2"></i>
                                                            {doctor.userData.soDienThoai}
                                                        </small>
                                                    </div>
                                                )}
                                            </div>

                                            {doctor.ghiChu && (
                                                <p className="text-muted small mb-3">{doctor.ghiChu}</p>
                                            )}

                                            <div className="d-grid gap-2">
                                                <Link
                                                    to={`/doctor-detail?id=${doctor.maNhaSi}`}
                                                    className="btn btn-outline-primary btn-sm"
                                                >
                                                    <i className="icofont-eye me-2"></i>
                                                    Xem chi tiết
                                                </Link>
                                                <Link
                                                    to={`/booking?doctor=${doctor.maNhaSi}&clinic=${doctor.maPhongKham}`}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    <i className="icofont-calendar me-2"></i>
                                                    Đặt lịch khám
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Statistics */}
                    <div className="row mt-5">
                        <div className="col-lg-12">
                            <div className="card bg-light">
                                <div className="card-body text-center py-4">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <h3 className="text-primary mb-1">{doctors.length}</h3>
                                            <p className="text-muted mb-0">Tổng số bác sĩ</p>
                                        </div>
                                        <div className="col-md-3">
                                            <h3 className="text-primary mb-1">{clinics.length}</h3>
                                            <p className="text-muted mb-0">Phòng khám</p>
                                        </div>
                                        <div className="col-md-3">
                                            <h3 className="text-primary mb-1">{specialties.length}</h3>
                                            <p className="text-muted mb-0">Chuyên khoa</p>
                                        </div>
                                        <div className="col-md-3">
                                            <h3 className="text-primary mb-1">24/7</h3>
                                            <p className="text-muted mb-0">Hỗ trợ</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        .doctor-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        
        .page-title {
          position: relative;
        }
        
        .page-title::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(35, 58, 102, 0.9), rgba(52, 144, 220, 0.8));
        }
        
        .page-title .container {
          position: relative;
          z-index: 2;
        }
        
        .doctor-info i {
          color: #3490dc;
        }
      `}</style>
        </div>
    );
};

export default DoctorsPage; 