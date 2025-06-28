import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { requestAPI } from '../../../axiosconfig';

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
}

interface Clinic {
    maPhongKham: number;
    tenPhongKham: string;
    diaChi: string;
    soDienThoai: string;
    eMail: string;
    moTa: string;
}

interface Schedule {
    maCaKham: number;
    ngayKham: string;
    gioBatDau: string;
    gioKetThuc: string;
    moTa: string;
}

const DoctorDetailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const doctorId = searchParams.get('id');

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [schedule, setSchedule] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (doctorId) {
            fetchDoctorDetail();
        }
    }, [doctorId]);

    const fetchDoctorDetail = async () => {
        try {
            setLoading(true);

            // Fetch doctor info
            const doctorRes = await requestAPI.get(`/api/nhasi/${doctorId}`);
            setDoctor(doctorRes.data);

            // Clinic info is already included in doctor response
            if (doctorRes.data.phongKhamData) {
                setClinic({
                    maPhongKham: doctorRes.data.maPhongKham,
                    tenPhongKham: doctorRes.data.phongKhamData.tenPhongKham,
                    diaChi: doctorRes.data.phongKhamData.diaChi,
                    soDienThoai: doctorRes.data.phongKhamData.soDienThoai,
                    eMail: doctorRes.data.phongKhamData.eMail,
                    moTa: doctorRes.data.phongKhamData.moTa
                });
            }

            // Fetch doctor's schedule for next 7 days
            const today = new Date();
            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            const scheduleRes = await requestAPI.get(
                `/api/cakham/doctor/${doctorId}?startDate=${today.toISOString().split('T')[0]}&endDate=${nextWeek.toISOString().split('T')[0]}`
            );
            setSchedule(scheduleRes.data);

        } catch (error) {
            console.error('Lỗi khi tải thông tin bác sĩ:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5);
    };

    const getAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh', paddingTop: '120px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div>
                <div className="container py-5">
                    <div className="text-center">
                        <h3>Không tìm thấy thông tin bác sĩ</h3>
                        <Link to="/doctors" className="btn btn-primary mt-3">
                            Quay lại danh sách bác sĩ
                        </Link>
                    </div>
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
                                <span className="text-white font-weight-bold text-lg">Thông tin chi tiết</span>
                                <h1 className="text-capitalize mb-5 text-lg text-white">{doctor.hoTen}</h1>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb justify-content-center">
                                        <li className="breadcrumb-item"><Link to="/" className="text-white-50">Trang chủ</Link></li>
                                        <li className="breadcrumb-item"><Link to="/doctors" className="text-white-50">Bác sĩ</Link></li>
                                        <li className="breadcrumb-item active text-white">{doctor.hoTen}</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctor Detail Section */}
            <section className="section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-6">
                            <div className="card doctor-profile-card shadow-lg border-0 mb-4">
                                <div className="card-body text-center p-4">
                                    <div className="doctor-img mb-4">
                                        <img
                                            src={doctor.userData?.anh ? `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/uploads/${doctor.userData.anh}` : '/images/team/1.jpg'}
                                            alt={doctor.hoTen}
                                            className="img-fluid rounded-circle"
                                            style={{
                                                width: '200px',
                                                height: '200px',
                                                objectFit: 'cover',
                                                border: '6px solid #e8f4f8'
                                            }}
                                        />
                                    </div>

                                    <h3 className="mb-2" style={{ color: '#223a66' }}>{doctor.hoTen}</h3>
                                    <p className="text-primary mb-3 fw-bold">{doctor.chucVu}</p>

                                    <div className="contact-info mb-4">
                                        {doctor.userData?.eMail && (
                                            <div className="mb-2">
                                                <i className="icofont-email text-primary me-2"></i>
                                                <span>{doctor.userData.eMail}</span>
                                            </div>
                                        )}
                                        {doctor.userData?.soDienThoai && (
                                            <div className="mb-2">
                                                <i className="icofont-phone text-primary me-2"></i>
                                                <span>{doctor.userData.soDienThoai}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-grid">
                                        <Link
                                            to={`/booking?doctor=${doctor.maNhaSi}&clinic=${doctor.maPhongKham}`}
                                            className="btn btn-primary btn-lg"
                                        >
                                            <i className="icofont-calendar me-2"></i>
                                            Đặt lịch khám
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8 col-md-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-light">
                                    <ul className="nav nav-tabs card-header-tabs">
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('info')}
                                            >
                                                <i className="icofont-info-circle me-2"></i>
                                                Thông tin
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('schedule')}
                                            >
                                                <i className="icofont-calendar me-2"></i>
                                                Lịch làm việc
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${activeTab === 'clinic' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('clinic')}
                                            >
                                                <i className="icofont-hospital me-2"></i>
                                                Phòng khám
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                <div className="card-body p-4">
                                    {activeTab === 'info' && (
                                        <div>
                                            <h5 className="mb-4" style={{ color: '#223a66' }}>Thông tin cá nhân</h5>

                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <div className="info-item">
                                                        <strong className="text-muted">Mã bác sĩ:</strong>
                                                        <p className="mb-0">{doctor.maNhaSi}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <div className="info-item">
                                                        <strong className="text-muted">Chuyên khoa:</strong>
                                                        <p className="mb-0">{doctor.chucVu}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <div className="info-item">
                                                        <strong className="text-muted">Kinh nghiệm:</strong>
                                                        <p className="mb-0">{doctor.kinhNghiem}</p>
                                                    </div>
                                                </div>
                                                {doctor.userData?.gioiTinh && (
                                                    <div className="col-md-6 mb-3">
                                                        <div className="info-item">
                                                            <strong className="text-muted">Giới tính:</strong>
                                                            <p className="mb-0">{doctor.userData.gioiTinh}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {doctor.userData?.ngaySinh && (
                                                    <div className="col-md-6 mb-3">
                                                        <div className="info-item">
                                                            <strong className="text-muted">Tuổi:</strong>
                                                            <p className="mb-0">{getAge(doctor.userData.ngaySinh)} tuổi</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {doctor.userData?.diaChi && (
                                                    <div className="col-md-6 mb-3">
                                                        <div className="info-item">
                                                            <strong className="text-muted">Địa chỉ:</strong>
                                                            <p className="mb-0">{doctor.userData.diaChi}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {doctor.ghiChu && (
                                                <div className="mt-4">
                                                    <h6 className="text-muted">Ghi chú</h6>
                                                    <p className="text-muted">{doctor.ghiChu}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'schedule' && (
                                        <div>
                                            <h5 className="mb-4" style={{ color: '#223a66' }}>Lịch làm việc (7 ngày tới)</h5>

                                            {schedule.length === 0 ? (
                                                <div className="text-center py-4">
                                                    <i className="icofont-calendar fs-1 text-muted mb-3"></i>
                                                    <p className="text-muted">Chưa có lịch làm việc trong thời gian này</p>
                                                </div>
                                            ) : (
                                                <div className="schedule-list">
                                                    {schedule.map((shift) => (
                                                        <div key={shift.maCaKham} className="schedule-item border rounded p-3 mb-3">
                                                            <div className="row align-items-center">
                                                                <div className="col-md-4">
                                                                    <div className="schedule-date">
                                                                        <h6 className="mb-1 text-primary">{formatDate(shift.ngayKham)}</h6>
                                                                        <small className="text-muted">{shift.ngayKham}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="schedule-time">
                                                                        <h6 className="mb-1">
                                                                            <i className="icofont-clock-time me-2"></i>
                                                                            {formatTime(shift.gioBatDau)} - {formatTime(shift.gioKetThuc)}
                                                                        </h6>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <span className="badge bg-success">Có thể đặt lịch</span>
                                                                </div>
                                                            </div>
                                                            {shift.moTa && (
                                                                <div className="mt-2">
                                                                    <small className="text-muted">{shift.moTa}</small>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'clinic' && clinic && (
                                        <div>
                                            <h5 className="mb-4" style={{ color: '#223a66' }}>Thông tin phòng khám</h5>

                                            <div className="clinic-info">
                                                <h6 className="text-primary mb-3">{clinic.tenPhongKham}</h6>

                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="info-item">
                                                            <strong className="text-muted">Địa chỉ:</strong>
                                                            <p className="mb-0">{clinic.diaChi}</p>
                                                        </div>
                                                    </div>
                                                    {clinic.soDienThoai && (
                                                        <div className="col-md-6 mb-3">
                                                            <div className="info-item">
                                                                <strong className="text-muted">Số điện thoại:</strong>
                                                                <p className="mb-0">{clinic.soDienThoai}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {clinic.eMail && (
                                                        <div className="col-md-6 mb-3">
                                                            <div className="info-item">
                                                                <strong className="text-muted">Email:</strong>
                                                                <p className="mb-0">{clinic.eMail}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {clinic.moTa && (
                                                    <div className="mt-4">
                                                        <h6 className="text-muted">Mô tả</h6>
                                                        <p className="text-muted">{clinic.moTa}</p>
                                                    </div>
                                                )}

                                                <div className="mt-4">
                                                    <Link to="/clinics" className="btn btn-outline-primary">
                                                        <i className="icofont-eye me-2"></i>
                                                        Xem thông tin phòng khám
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        .doctor-profile-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        }
        
        .schedule-item {
          background: #f8f9fa;
          transition: all 0.3s ease;
        }
        
        .schedule-item:hover {
          background: #e9ecef;
          transform: translateX(5px);
        }
        
        .info-item strong {
          display: block;
          margin-bottom: 5px;
        }
        
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
        }
        
        .nav-tabs .nav-link.active {
          background: #fff;
          color: #223a66;
          border-bottom: 2px solid #3490dc;
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
        
        .breadcrumb {
          background: none;
          padding: 0;
        }
      `}</style>
        </div>
    );
};

export default DoctorDetailPage; 