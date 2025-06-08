import React, { useState, useEffect } from 'react';
import { serviceService, serviceTypeService } from '../../../services';
import './styles.css';

interface Service {
    maDichVu: number;
    tenDichVu: string;
    moTa: string;
    donGia: number | string;
    anh: string | null;
    maLoaiDichVu: number;
    tenLoaiDichVu?: string;
}

interface ServiceType {
    maLoaiDichVu: number;
    tenLoaiDichVu: string;
}

function ServicesPage() {
    console.log('ServicesPage rendering with API calls...');

    // Mock data as fallback
    const mockServices: Service[] = [
        {
            maDichVu: 1,
            tenDichVu: "Khám răng tổng quát",
            moTa: "Kiểm tra toàn bộ răng miệng",
            donGia: "150000",
            anh: "",
            maLoaiDichVu: 1,
            tenLoaiDichVu: "Khám tổng quát"
        },
        {
            maDichVu: 2,
            tenDichVu: "Trám răng sâu",
            moTa: "Trám các lỗ sâu",
            donGia: "300000",
            anh: "",
            maLoaiDichVu: 2,
            tenLoaiDichVu: "Trám răng"
        }
    ];

    const mockServiceTypes: ServiceType[] = [
        { maLoaiDichVu: 1, tenLoaiDichVu: "Khám tổng quát" },
        { maLoaiDichVu: 2, tenLoaiDichVu: "Trám răng" }
    ];

    const [services, setServices] = useState<Service[]>(mockServices);
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(mockServiceTypes);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [apiStatus, setApiStatus] = useState<string>('Using mock data');

    useEffect(() => {
        fetchDataSafely();
    }, []);

    const fetchDataSafely = async () => {
        try {
            setLoading(true);
            setApiStatus('Fetching from API...');
            console.log('Attempting to fetch from API...');

            // Try to fetch services
            const servicesRes = await serviceService.all();
            console.log('Services API response:', servicesRes);

            if (servicesRes?.data && Array.isArray(servicesRes.data)) {
                setServices(servicesRes.data);
                setApiStatus('Services loaded from API');
            }

            // Try to fetch service types
            const typesRes = await serviceTypeService.all();
            console.log('Service types API response:', typesRes);

            if (typesRes?.data && Array.isArray(typesRes.data)) {
                setServiceTypes(typesRes.data);
                setApiStatus('All data loaded from API');
            }

        } catch (error) {
            console.error('API Error, using mock data:', error);
            setApiStatus(`API Error: ${error} - Using mock data`);
            // Keep mock data as fallback
        } finally {
            setLoading(false);
        }
    };

    // Format currency safely
    const formatCurrency = (amount: number | string) => {
        try {
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(numAmount);
        } catch (err) {
            return amount + ' VND';
        }
    };

    // Filter services
    const filteredServices = services.filter(service => {
        try {
            const matchSearch = service.tenDichVu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.moTa?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchType = !selectedType || service.maLoaiDichVu.toString() === selectedType;
            return matchSearch && matchType;
        } catch (err) {
            console.error('Filter error:', err);
            return false;
        }
    });

    return (
        <section className="section service-list">
            <div className="container">
                {/* Page Header */}
                <div className="row justify-content-center">
                    <div className="col-lg-8 text-center">
                        <div className="section-title">
                            <h2>Dịch Vụ Nha Khoa</h2>
                            <div className="divider mx-auto my-4"></div>
                            <p className="mb-5">
                                Khám phá các dịch vụ nha khoa chuyên nghiệp với công nghệ hiện đại
                                và đội ngũ bác sĩ giàu kinh nghiệm.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Debug info */}
                <div className="row justify-content-center mb-3">
                    <div className="col-lg-8 text-center">
                        <div style={{
                            backgroundColor: loading ? '#fff3cd' : '#d4edda',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '20px',
                            border: `1px solid ${loading ? '#ffeaa7' : '#c3e6cb'}`
                        }}>
                            <small>
                                <strong>Status:</strong> {apiStatus} |
                                <strong>Loading:</strong> {loading ? 'Yes' : 'No'} |
                                <strong>Services:</strong> {services.length} |
                                <strong>Types:</strong> {serviceTypes.length} |
                                <strong>Filtered:</strong> {filteredServices.length}
                            </small>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-5">
                        <div className="search-bar">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder="Tìm kiếm dịch vụ..."
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
                    <div className="col-lg-3">
                        <select
                            className="form-select form-control-lg"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="">Tất cả loại dịch vụ</option>
                            {serviceTypes.map(type => (
                                <option key={type.maLoaiDichVu} value={type.maLoaiDichVu}>
                                    {type.tenLoaiDichVu}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="row justify-content-center">
                        <div className="col-lg-6 text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p className="mt-3">Đang tải dữ liệu từ API...</p>
                        </div>
                    </div>
                ) : (
                    <div className="row">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service) => (
                                <div key={service.maDichVu} className="col-lg-4 col-md-6 mb-5">
                                    <div className="service-card h-100">
                                        <div className="service-img">
                                            {service.anh && service.anh !== "" ? (
                                                <img
                                                    src={service.anh}
                                                    alt={service.tenDichVu}
                                                    className="img-fluid"
                                                />
                                            ) : (
                                                <div className="service-placeholder">
                                                    <i className="icofont-tooth"></i>
                                                </div>
                                            )}
                                        </div>

                                        <div className="service-content">
                                            <h4 className="service-name">
                                                {service.tenDichVu}
                                            </h4>

                                            <div className="service-price">
                                                <span className="price">
                                                    {formatCurrency(service.donGia)}
                                                </span>
                                            </div>

                                            {service.moTa && (
                                                <p className="service-description">
                                                    {service.moTa.length > 120
                                                        ? service.moTa.substring(0, 120) + '...'
                                                        : service.moTa
                                                    }
                                                </p>
                                            )}

                                            <div className="service-type">
                                                <span className="badge badge-primary">
                                                    {service.tenLoaiDichVu || 'N/A'}
                                                </span>
                                            </div>

                                            <div className="service-actions">
                                                <a
                                                    href="/booking"
                                                    className="btn btn-main"
                                                >
                                                    <i className="icofont-calendar mr-2"></i>
                                                    Đặt lịch khám
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center">
                                <div className="no-results">
                                    <i className="icofont-tooth"></i>
                                    <h4>Không tìm thấy dịch vụ nào</h4>
                                    <p>
                                        {searchTerm || selectedType
                                            ? `Không có dịch vụ nào phù hợp với tiêu chí tìm kiếm`
                                            : 'Hiện tại chưa có dịch vụ nào được cung cấp'
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
                            <h3>Cần tư vấn về dịch vụ?</h3>
                            <p>Liên hệ với chúng tôi để được tư vấn chi tiết về từng dịch vụ và ưu đãi đặc biệt.</p>
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

export default ServicesPage; 