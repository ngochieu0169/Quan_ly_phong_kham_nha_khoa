import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { dentistService, userServiceExtended } from '../../../services';
import { validateForm, userValidationSchema, type ValidationErrors } from '../../../utils/validation';
import FileUpload from '../../../components/shared/FileUpload';

interface DentistProfile {
  maNhaSi: string;
  maPhongKham: number;
  hoTen: string;
  kinhNghiem: string;
  chucVu: string;
  ghiChu: string;
  // User info
  maNguoiDung: number;
  ngaySinh: string;
  gioiTinh: string;
  eMail: string;
  soDienThoai: string;
  diaChi: string;
  anh: string | null;
  // Clinic info
  tenPhongKham?: string;
  diaChiPhongKham?: string;
}

interface DentistFormData {
  hoTen: string;
  eMail: string;
  soDienThoai: string;
  ngaySinh: string;
  gioiTinh: string;
  diaChi: string;
  kinhNghiem: string;
  chucVu: string;
  ghiChu: string;
  file?: File;
}

function DoctorProfile() {
  const [profile, setProfile] = useState<DentistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<DentistFormData>({
    hoTen: '',
    eMail: '',
    soDienThoai: '',
    ngaySinh: '',
    gioiTinh: '',
    diaChi: '',
    kinhNghiem: '',
    chucVu: '',
    ghiChu: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Get current user from localStorage (assuming it's stored there after login)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.nhaSi) {
        const res = await dentistService.get(currentUser.nhaSi.maNhaSi);
        setProfile(res.data);

        // Set form data
        setFormData({
          hoTen: res.data.hoTen || '',
          eMail: res.data.eMail || '',
          soDienThoai: res.data.soDienThoai || '',
          ngaySinh: res.data.ngaySinh?.split('T')[0] || '',
          gioiTinh: res.data.gioiTinh || '',
          diaChi: res.data.diaChi || '',
          kinhNghiem: res.data.kinhNghiem || '',
          chucVu: res.data.chucVu || '',
          ghiChu: res.data.ghiChu || ''
        });
      }
    } catch (error) {
      toast.error('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DentistFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validate form
    const validationSchema = {
      hoTen: userValidationSchema.hoTen,
      eMail: userValidationSchema.eMail,
      soDienThoai: userValidationSchema.soDienThoai,
      ngaySinh: userValidationSchema.ngaySinh
    };

    const validationErrors = validateForm(formData, validationSchema);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Update user info
      const userForm = new FormData();
      userForm.append('hoTen', formData.hoTen);
      userForm.append('eMail', formData.eMail);
      userForm.append('soDienThoai', formData.soDienThoai);
      userForm.append('ngaySinh', formData.ngaySinh);
      userForm.append('gioiTinh', formData.gioiTinh);
      userForm.append('diaChi', formData.diaChi);

      if (formData.file) {
        userForm.append('anh', formData.file);
      }

      await userServiceExtended.updateUser(profile.maNguoiDung, userForm);

      // Update dentist specific info
      const dentistData = {
        kinhNghiem: formData.kinhNghiem,
        chucVu: formData.chucVu,
        ghiChu: formData.ghiChu
      };

      await dentistService.update(profile.maNhaSi, dentistData);

      toast.success('Cập nhật hồ sơ thành công');
      setIsEditing(false);
      fetchProfile();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Cập nhật hồ sơ thất bại';
      toast.error(message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reset form data
    if (profile) {
      setFormData({
        hoTen: profile.hoTen || '',
        eMail: profile.eMail || '',
        soDienThoai: profile.soDienThoai || '',
        ngaySinh: profile.ngaySinh?.split('T')[0] || '',
        gioiTinh: profile.gioiTinh || '',
        diaChi: profile.diaChi || '',
        kinhNghiem: profile.kinhNghiem || '',
        chucVu: profile.chucVu || '',
        ghiChu: profile.ghiChu || ''
      });
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning">
          Không tìm thấy thông tin hồ sơ bác sĩ.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <ToastContainer />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Hồ sơ bác sĩ</h4>
        {!isEditing ? (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <i className="icofont-edit me-2"></i>Chỉnh sửa
          </button>
        ) : (
          <div>
            <button className="btn btn-success me-2" onClick={handleSave}>
              <i className="icofont-save me-2"></i>Lưu
            </button>
            <button className="btn btn-secondary" onClick={handleCancel}>
              Hủy
            </button>
          </div>
        )}
      </div>

      <div className="row">
        {/* Left Column - Avatar and Basic Info */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              {!isEditing ? (
                <>
                  {profile.anh ? (
                    <img
                      src={profile.anh}
                      alt={profile.hoTen}
                      className="rounded-circle mb-3"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white mx-auto mb-3"
                      style={{ width: '150px', height: '150px', fontSize: '3rem' }}
                    >
                      {profile.hoTen.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h5 className="mb-1">{profile.hoTen}</h5>
                  <p className="text-muted mb-2">{profile.chucVu}</p>
                  <span className="badge bg-primary">{profile.kinhNghiem} kinh nghiệm</span>
                </>
              ) : (
                <div className="mb-3">
                  <FileUpload
                    label="Ảnh đại diện"
                    onChange={(file) => setFormData({ ...formData, file: file || undefined })}
                    preview={profile.anh}
                    accept="image/*"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Clinic Info */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="icofont-building me-2"></i>Thông tin phòng khám
              </h6>
            </div>
            <div className="card-body">
              <p className="mb-2">
                <strong>Tên:</strong> {profile.tenPhongKham || 'Chưa cập nhật'}
              </p>
              <p className="mb-0">
                <strong>Địa chỉ:</strong> {profile.diaChiPhongKham || 'Chưa cập nhật'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="icofont-user me-2"></i>Thông tin chi tiết
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Họ và tên <span className="text-danger">*</span></label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        className={`form-control ${errors.hoTen ? 'is-invalid' : ''}`}
                        value={formData.hoTen}
                        onChange={(e) => handleInputChange('hoTen', e.target.value)}
                      />
                      {errors.hoTen && (
                        <div className="invalid-feedback">{errors.hoTen}</div>
                      )}
                    </>
                  ) : (
                    <p className="form-control-plaintext">{profile.hoTen}</p>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email <span className="text-danger">*</span></label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        className={`form-control ${errors.eMail ? 'is-invalid' : ''}`}
                        value={formData.eMail}
                        onChange={(e) => handleInputChange('eMail', e.target.value)}
                      />
                      {errors.eMail && (
                        <div className="invalid-feedback">{errors.eMail}</div>
                      )}
                    </>
                  ) : (
                    <p className="form-control-plaintext">{profile.eMail}</p>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Số điện thoại <span className="text-danger">*</span></label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        className={`form-control ${errors.soDienThoai ? 'is-invalid' : ''}`}
                        value={formData.soDienThoai}
                        onChange={(e) => handleInputChange('soDienThoai', e.target.value)}
                      />
                      {errors.soDienThoai && (
                        <div className="invalid-feedback">{errors.soDienThoai}</div>
                      )}
                    </>
                  ) : (
                    <p className="form-control-plaintext">{profile.soDienThoai}</p>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Ngày sinh <span className="text-danger">*</span></label>
                  {isEditing ? (
                    <>
                      <input
                        type="date"
                        className={`form-control ${errors.ngaySinh ? 'is-invalid' : ''}`}
                        value={formData.ngaySinh}
                        onChange={(e) => handleInputChange('ngaySinh', e.target.value)}
                      />
                      {errors.ngaySinh && (
                        <div className="invalid-feedback">{errors.ngaySinh}</div>
                      )}
                    </>
                  ) : (
                    <p className="form-control-plaintext">
                      {new Date(profile.ngaySinh).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Giới tính</label>
                  {isEditing ? (
                    <select
                      className="form-select"
                      value={formData.gioiTinh}
                      onChange={(e) => handleInputChange('gioiTinh', e.target.value)}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    <p className="form-control-plaintext">{profile.gioiTinh || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Chức vụ</label>
                  {isEditing ? (
                    <select
                      className="form-select"
                      value={formData.chucVu}
                      onChange={(e) => handleInputChange('chucVu', e.target.value)}
                    >
                      <option value="">Chọn chức vụ</option>
                      <option value="Bác sĩ">Bác sĩ</option>
                      <option value="Bác sĩ chính">Bác sĩ chính</option>
                      <option value="Phó khoa">Phó khoa</option>
                      <option value="Trưởng khoa">Trưởng khoa</option>
                      <option value="Chuyên gia">Chuyên gia</option>
                    </select>
                  ) : (
                    <p className="form-control-plaintext">{profile.chucVu}</p>
                  )}
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Địa chỉ</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={formData.diaChi}
                      onChange={(e) => handleInputChange('diaChi', e.target.value)}
                    />
                  ) : (
                    <p className="form-control-plaintext">{profile.diaChi || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Kinh nghiệm</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={formData.kinhNghiem}
                      onChange={(e) => handleInputChange('kinhNghiem', e.target.value)}
                      placeholder="VD: 5 năm, 10 năm..."
                    />
                  ) : (
                    <p className="form-control-plaintext">{profile.kinhNghiem}</p>
                  )}
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Ghi chú</label>
                  {isEditing ? (
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.ghiChu}
                      onChange={(e) => handleInputChange('ghiChu', e.target.value)}
                      placeholder="Chuyên môn, kỹ năng đặc biệt..."
                    ></textarea>
                  ) : (
                    <p className="form-control-plaintext">{profile.ghiChu || 'Chưa có ghi chú'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
