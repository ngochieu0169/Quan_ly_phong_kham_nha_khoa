import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clinicService } from '../../../services';
import './styles.css';

interface Clinic {
    maPhongKham: number;
    tenPhongKham: string;
    diaChi: string;
    soDienThoai: string;
    gioLamViec: string;
    maChuPhongKham: string;
    trangthai: "duyệt" | "chưa duyệt" | "VIP" | "uy tín";
}

function ClinicsPage() {
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            setLoading(true);
            const res = await clinicService.all();
            console.log('API Response:', res.data); // Debug log
            // Chỉ hiển thị phòng khám đã được duyệt
            const approvedClinics = res.data.filter((clinic: Clinic) =>
                clinic.trangthai === 'duyệt' || clinic.trangthai === 'VIP' || clinic.trangthai === 'uy tín'
            );
            console.log('Filtered clinics:', approvedClinics); // Debug log
            setClinics(approvedClinics);
        } catch (error) {
            console.error('Không thể tải danh sách phòng khám:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter clinics based on search term
    const filteredClinics = clinics.filter(clinic =>
        clinic.tenPhongKham.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.diaChi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className="section clinic-list">
            <div className="container">
                {/* Page Header */}
                <div className="row justify-content-center">
                    <div className="col-lg-8 text-center">
                        <div className="section-title">
                            <h2>Danh Sách Phòng Khám</h2>
                            <div className="divider mx-auto my-4"></div>
                            <p className="mb-5">
                                Khám phá các phòng khám nha khoa chất lượng cao với đội ngũ bác sĩ giàu kinh nghiệm
                                và trang thiết bị hiện đại nhất.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-6">
                        <div className="search-bar">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder="Tìm kiếm phòng khám theo tên hoặc địa chỉ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="input-group-append">
                                    <span className="input-group-text">
                                        <i className="icofont-search"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clinics Grid */}
                {loading ? (
                    <div className="row justify-content-center">
                        <div className="col-lg-6 text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p className="mt-3">Đang tải danh sách phòng khám...</p>
                        </div>
                    </div>
                ) : (
                    <div className="row">
                        {filteredClinics.length > 0 ? (
                            filteredClinics.map((clinic) => (
                                <div key={clinic.maPhongKham} className="col-lg-4 col-md-6 mb-5">
                                    <div className="clinic-card h-100">
                                        <div className="clinic-img">
                                            <div className="clinic-placeholder">
                                                <i className="icofont-building-alt"></i>
                                            </div>
                                        </div>

                                        <div className="clinic-content">
                                            <h4 className="clinic-name">
                                                <Link to={`/clinic-detail/${clinic.maPhongKham}`}>
                                                    {clinic.tenPhongKham}
                                                </Link>
                                            </h4>

                                            <div className="clinic-info">
                                                <div className="info-item">
                                                    <i className="icofont-location-pin"></i>
                                                    <span>{clinic.diaChi}</span>
                                                </div>

                                                <div className="info-item">
                                                    <i className="icofont-phone"></i>
                                                    <span>{clinic.soDienThoai}</span>
                                                </div>

                                                <div className="info-item">
                                                    <i className="icofont-clock-time"></i>
                                                    <span>{clinic.gioLamViec}</span>
                                                </div>

                                                <div className="info-item">
                                                    <span className={`badge ${clinic.trangthai === "duyệt" ? "bg-success" :
                                                        clinic.trangthai === "VIP" ? "bg-info" :
                                                            clinic.trangthai === "uy tín" ? "bg-secondary" : "bg-warning"
                                                        }`}>
                                                        {clinic.trangthai}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="clinic-actions">
                                                <Link
                                                    to={`/clinic-detail/${clinic.maPhongKham}`}
                                                    className="btn btn-main"
                                                >
                                                    Xem chi tiết
                                                </Link>

                                                <Link
                                                    to="/booking"
                                                    className="btn btn-main-2"
                                                >
                                                    Đặt lịch khám
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center">
                                <div className="no-results">
                                    <i className="icofont-building-alt"></i>
                                    <h4>Không tìm thấy phòng khám nào</h4>
                                    <p>
                                        {searchTerm
                                            ? `Không có phòng khám nào phù hợp với từ khóa "${searchTerm}"`
                                            : 'Hiện tại chưa có phòng khám nào được duyệt hoạt động'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Call to Action */}
                <div className="row justify-content-center mt-5">
                    <div className="col-lg-8 text-center">
                        <div className="cta-section">
                            <h3>Cần tư vấn thêm?</h3>
                            <p>Liên hệ với chúng tôi để được tư vấn miễn phí về dịch vụ nha khoa phù hợp nhất.</p>
                            <a href="tel:+823456513456" className="btn btn-main">
                                <i className="icofont-phone mr-2"></i>
                                Gọi ngay: 823-4565-13456
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ClinicsPage; 