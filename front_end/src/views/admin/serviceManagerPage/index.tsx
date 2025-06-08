import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { serviceService, serviceTypeService } from '../../../services';
import { validateForm, serviceValidationSchema, type ValidationErrors } from '../../../utils/validation';
import FileUpload from '../../../components/shared/FileUpload';

interface ServiceType {
    maLoaiDichVu: number;
    tenLoaiDichVu: string;
}

interface Service {
    maDichVu: number;
    tenDichVu: string;
    moTa: string;
    donGia: number;
    anh: string | null;
    maLoaiDichVu: number;
    tenLoaiDichVu?: string;
}

interface ServiceFormData {
    tenDichVu: string;
    moTa: string;
    donGia: string;
    maLoaiDichVu: string;
    file?: File;
}

function ServiceManagerPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [modalService, setModalService] = useState<ServiceFormData>({
        tenDichVu: '',
        moTa: '',
        donGia: '',
        maLoaiDichVu: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [errors, setErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        fetchServices();
        fetchServiceTypes();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await serviceService.all();
            setServices(res.data);
        } catch (error) {
            toast.error('Không thể tải danh sách dịch vụ');
        }
    };

    const fetchServiceTypes = async () => {
        try {
            const res = await serviceTypeService.all();
            setServiceTypes(res.data);
        } catch (error) {
            toast.error('Không thể tải danh sách loại dịch vụ');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;

        try {
            await serviceService.delete(id);
            toast.success('Xóa dịch vụ thành công');
            fetchServices();
        } catch (error) {
            toast.error('Xóa dịch vụ thất bại');
        }
    };

    const handleEdit = (service: Service) => {
        setModalService({
            tenDichVu: service.tenDichVu,
            moTa: service.moTa,
            donGia: service.donGia.toString(),
            maLoaiDichVu: service.maLoaiDichVu.toString()
        });
        setEditingId(service.maDichVu);
        setIsEditing(true);
        setIsModalOpen(true);
        setErrors({});
    };

    const handleCreate = () => {
        setModalService({
            tenDichVu: '',
            moTa: '',
            donGia: '',
            maLoaiDichVu: ''
        });
        setIsEditing(false);
        setEditingId(null);
        setIsModalOpen(true);
        setErrors({});
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const handleInputChange = (field: keyof ServiceFormData, value: string) => {
        setModalService({ ...modalService, [field]: value });
        // Clear error when user types
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleSave = async () => {
        // Validate form
        const validationErrors = validateForm(modalService, serviceValidationSchema);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const formData = new FormData();
        formData.append('tenDichVu', modalService.tenDichVu);
        formData.append('moTa', modalService.moTa || '');
        formData.append('donGia', modalService.donGia);
        formData.append('maLoaiDichVu', modalService.maLoaiDichVu);

        if (modalService.file) {
            formData.append('anh', modalService.file);
        }

        try {
            if (isEditing && editingId) {
                await serviceService.update(editingId, formData);
                toast.success('Cập nhật dịch vụ thành công');
            } else {
                await serviceService.create(formData);
                toast.success('Thêm dịch vụ thành công');
            }
            fetchServices();
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Lưu dịch vụ thất bại');
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Filter services
    const filteredServices = services.filter(service => {
        const matchSearch = service.tenDichVu.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.moTa?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = !selectedType || service.maLoaiDichVu.toString() === selectedType;
        return matchSearch && matchType;
    });

    return (
        <div className="container-fluid">
            <ToastContainer />
            <h4 className="mb-4">Quản lý dịch vụ nha khoa</h4>

            {/* Search and Filter */}
            <div className="row mb-3">
                <div className="col-md-5">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm dịch vụ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
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
                <div className="col-md-4 text-end">
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <i className="icofont-plus me-2"></i>Thêm dịch vụ
                    </button>
                </div>
            </div>

            {/* Service List */}
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-primary">
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th style={{ width: '100px' }}>Ảnh</th>
                            <th>Tên dịch vụ</th>
                            <th>Loại dịch vụ</th>
                            <th>Mô tả</th>
                            <th style={{ width: '150px' }}>Đơn giá</th>
                            <th style={{ width: '150px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServices.map((service, idx) => (
                            <tr key={service.maDichVu}>
                                <td>{idx + 1}</td>
                                <td>
                                    {service.anh && (
                                        <img
                                            src={service.anh}
                                            alt={service.tenDichVu}
                                            className="img-thumbnail"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                    )}
                                </td>
                                <td className="fw-bold">{service.tenDichVu}</td>
                                <td>
                                    {serviceTypes.find(t => t.maLoaiDichVu === service.maLoaiDichVu)?.tenLoaiDichVu}
                                </td>
                                <td>{service.moTa}</td>
                                <td className="text-end text-primary fw-bold">
                                    {formatCurrency(service.donGia)}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() => handleEdit(service)}
                                    >
                                        <i className="icofont-edit"></i>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(service.maDichVu)}
                                    >
                                        <i className="icofont-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredServices.length === 0 && (
                    <div className="text-center py-5 text-muted">
                        <i className="icofont-medical-sign-alt fs-1"></i>
                        <p className="mt-2">Không tìm thấy dịch vụ nào</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {isEditing ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal} />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Tên dịch vụ <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.tenDichVu ? 'is-invalid' : ''}`}
                                            value={modalService.tenDichVu}
                                            onChange={(e) => handleInputChange('tenDichVu', e.target.value)}
                                        />
                                        {errors.tenDichVu && (
                                            <div className="invalid-feedback">{errors.tenDichVu}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Loại dịch vụ <span className="text-danger">*</span></label>
                                        <select
                                            className={`form-select ${errors.maLoaiDichVu ? 'is-invalid' : ''}`}
                                            value={modalService.maLoaiDichVu}
                                            onChange={(e) => handleInputChange('maLoaiDichVu', e.target.value)}
                                        >
                                            <option value="">Chọn loại dịch vụ</option>
                                            {serviceTypes.map(type => (
                                                <option key={type.maLoaiDichVu} value={type.maLoaiDichVu}>
                                                    {type.tenLoaiDichVu}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.maLoaiDichVu && (
                                            <div className="invalid-feedback">{errors.maLoaiDichVu}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Mô tả</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={modalService.moTa}
                                        onChange={(e) => handleInputChange('moTa', e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Đơn giá <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                className={`form-control ${errors.donGia ? 'is-invalid' : ''}`}
                                                value={modalService.donGia}
                                                onChange={(e) => handleInputChange('donGia', e.target.value)}
                                            />
                                            <span className="input-group-text">VNĐ</span>
                                            {errors.donGia && (
                                                <div className="invalid-feedback">{errors.donGia}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <FileUpload
                                            label="Ảnh dịch vụ"
                                            onChange={(file) => setModalService({ ...modalService, file: file || undefined })}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Hủy
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>
                                    <i className="icofont-save me-2"></i>
                                    {isEditing ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ServiceManagerPage;
