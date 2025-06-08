import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { userServiceExtended, authService } from '../../../services';
import { validateForm, userValidationSchema, type ValidationErrors } from '../../../utils/validation';
import FileUpload from '../../../components/shared/FileUpload';

interface UserProfile {
  maNguoiDung: number;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  eMail: string;
  soDienThoai: string;
  diaChi: string;
  anh: string | null;
  tenTaiKhoan: string;
  maQuyen: number;
  tenQuyen: string;
}

interface PersonalFormData {
  hoTen: string;
  eMail: string;
  soDienThoai: string;
  ngaySinh: string;
  gioiTinh: string;
  diaChi: string;
  file?: File;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function PersonalPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [formData, setFormData] = useState<PersonalFormData>({
    hoTen: '',
    eMail: '',
    soDienThoai: '',
    ngaySinh: '',
    gioiTinh: '',
    diaChi: ''
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      if (currentUser.maNguoiDung) {
        const res = await userServiceExtended.getFullList({
          maQuyen: currentUser.maQuyen
        });

        const userProfile = res.data.find((user: any) =>
          user.maNguoiDung === currentUser.maNguoiDung
        );

        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            hoTen: userProfile.hoTen || '',
            eMail: userProfile.eMail || '',
            soDienThoai: userProfile.soDienThoai || '',
            ngaySinh: userProfile.ngaySinh?.split('T')[0] || '',
            gioiTinh: userProfile.gioiTinh || '',
            diaChi: userProfile.diaChi || ''
          });
        }
      }
    } catch (error) {
      toast.error('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PersonalFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordForm({ ...passwordForm, [field]: value });
    if (passwordErrors[field]) {
      setPasswordErrors({ ...passwordErrors, [field]: '' });
    }
  };

  const handleSaveProfile = async () => {
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

      toast.success('Cập nhật thông tin thành công');
      setIsEditingProfile(false);

      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      fetchProfile();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Cập nhật thông tin thất bại';
      toast.error(message);
    }
  };

  const handleChangePassword = async () => {
    if (!profile) return;

    // Validate passwords
    const errors: ValidationErrors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      // First verify current password by attempting login
      await authService.login({
        tenTaiKhoan: profile.tenTaiKhoan,
        matKhau: passwordForm.currentPassword
      });

      // If login successful, update password
      await authService.updateAccount(profile.tenTaiKhoan, {
        matKhau: passwordForm.newPassword,
        maQuyen: profile.maQuyen
      });

      toast.success('Đổi mật khẩu thành công');
      setIsChangePassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        setPasswordErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
      } else {
        toast.error('Đổi mật khẩu thất bại');
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setErrors({});
    if (profile) {
      setFormData({
        hoTen: profile.hoTen || '',
        eMail: profile.eMail || '',
        soDienThoai: profile.soDienThoai || '',
        ngaySinh: profile.ngaySinh?.split('T')[0] || '',
        gioiTinh: profile.gioiTinh || '',
        diaChi: profile.diaChi || ''
      });
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getRoleBadgeColor = (maQuyen: number) => {
    const colors: { [key: number]: string } = {
      1: 'danger',    // Admin
      2: 'primary',   // Nha sĩ
      3: 'info',      // Lễ tân
      4: 'success',   // Bệnh nhân
      5: 'warning'    // Chủ phòng khám
    };
    return colors[maQuyen] || 'secondary';
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
          Không tìm thấy thông tin hồ sơ.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <ToastContainer />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Thông tin cá nhân</h4>
        <div className="d-flex gap-2">
          {!isEditingProfile && !isChangePassword && (
            <>
              <button
                className="btn btn-outline-warning"
                onClick={() => setIsChangePassword(true)}
              >
                <i className="icofont-key me-2"></i>Đổi mật khẩu
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setIsEditingProfile(true)}
              >
                <i className="icofont-edit me-2"></i>Chỉnh sửa
              </button>
            </>
          )}

          {(isEditingProfile || isChangePassword) && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setIsEditingProfile(false);
                setIsChangePassword(false);
                handleCancelEdit();
              }}
            >
              Hủy
            </button>
          )}
        </div>
      </div>

      <div className="row">
        {/* Left Column - Avatar and Basic Info */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              {!isEditingProfile ? (
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
                  <p className="text-muted mb-2">@{profile.tenTaiKhoan}</p>
                  <span className={`badge bg-${getRoleBadgeColor(profile.maQuyen)} mb-3`}>
                    {profile.tenQuyen}
                  </span>

                  <div className="text-start">
                    <div className="border-bottom pb-2 mb-2">
                      <small className="text-muted">Email</small>
                      <p className="mb-0">{profile.eMail}</p>
                    </div>
                    <div className="border-bottom pb-2 mb-2">
                      <small className="text-muted">Số điện thoại</small>
                      <p className="mb-0">{profile.soDienThoai}</p>
                    </div>
                    <div>
                      <small className="text-muted">Tuổi</small>
                      <p className="mb-0">{calculateAge(profile.ngaySinh)} tuổi</p>
                    </div>
                  </div>
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

          {/* Account Info */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="icofont-shield me-2"></i>Thông tin tài khoản
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <small className="text-muted">Tên đăng nhập</small>
                <p className="mb-0 fw-bold">{profile.tenTaiKhoan}</p>
              </div>
              <div className="mb-2">
                <small className="text-muted">Vai trò</small>
                <p className="mb-0">
                  <span className={`badge bg-${getRoleBadgeColor(profile.maQuyen)}`}>
                    {profile.tenQuyen}
                  </span>
                </p>
              </div>
              <div>
                <small className="text-muted">Ngày tham gia</small>
                <p className="mb-0">Thành viên từ 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="col-md-8">
          {/* Profile Information */}
          {!isChangePassword && (
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
                    {isEditingProfile ? (
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
                    {isEditingProfile ? (
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
                    {isEditingProfile ? (
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
                    {isEditingProfile ? (
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
                    {isEditingProfile ? (
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

                  <div className="col-12 mb-3">
                    <label className="form-label">Địa chỉ</label>
                    {isEditingProfile ? (
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
                </div>

                {isEditingProfile && (
                  <div className="d-flex gap-2">
                    <button className="btn btn-success" onClick={handleSaveProfile}>
                      <i className="icofont-save me-2"></i>Lưu thay đổi
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancelEdit}>
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Change Password Form */}
          {isChangePassword && (
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="icofont-key me-2"></i>Đổi mật khẩu
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Mật khẩu hiện tại <span className="text-danger">*</span></label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.currentPassword ? 'is-invalid' : ''}`}
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  />
                  {passwordErrors.currentPassword && (
                    <div className="invalid-feedback">{passwordErrors.currentPassword}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Mật khẩu mới <span className="text-danger">*</span></label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  />
                  {passwordErrors.newPassword && (
                    <div className="invalid-feedback">{passwordErrors.newPassword}</div>
                  )}
                  <div className="form-text">Mật khẩu phải có ít nhất 6 ký tự</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Xác nhận mật khẩu mới <span className="text-danger">*</span></label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  />
                  {passwordErrors.confirmPassword && (
                    <div className="invalid-feedback">{passwordErrors.confirmPassword}</div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button className="btn btn-warning" onClick={handleChangePassword}>
                    <i className="icofont-key me-2"></i>Đổi mật khẩu
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsChangePassword(false)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonalPage;
