import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { userService, userServiceExtended } from '../../../services';

interface Notification {
    id?: number;
    tieuDe: string;
    noiDung: string;
    nguoiNhan: string[];
    loaiThongBao: string;
    trangThai: string;
    ngayTao?: string;
}

interface User {
    maNguoiDung: number;
    hoTen: string;
    eMail: string;
    soDienThoai: string;
    maQuyen: number;
    tenQuyen?: string;
}

function ReceptionistNotifications() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [filterRole, setFilterRole] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [notification, setNotification] = useState<Notification>({
        tieuDe: '',
        noiDung: '',
        nguoiNhan: [],
        loaiThongBao: 'Thông báo chung',
        trangThai: 'Đã gửi'
    });

    const notificationTypes = [
        'Thông báo chung',
        'Nhắc nhở lịch khám',
        'Thông báo khẩn cấp',
        'Thông báo nghỉ lễ',
        'Thông báo thay đổi lịch',
        'Thông báo thanh toán',
        'Thông báo tái khám'
    ];

    const roleMap: { [key: number]: string } = {
        1: 'Admin',
        2: 'Nha sĩ',
        3: 'Lễ tân',
        4: 'Bệnh nhân',
        5: 'Chủ phòng khám'
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userServiceExtended.getFullList();
            const usersWithRole = response.data.map((user: any) => ({
                ...user,
                tenQuyen: roleMap[user.maQuyen]
            }));
            setUsers(usersWithRole);
        } catch (error) {
            toast.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (userId: number) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(user => user.maNguoiDung));
        }
        setSelectAll(!selectAll);
    };

    const handleRoleSelect = (role: number) => {
        const roleUsers = filteredUsers.filter(user => user.maQuyen === role);
        const roleUserIds = roleUsers.map(user => user.maNguoiDung);

        const allSelected = roleUserIds.every(id => selectedUsers.includes(id));

        if (allSelected) {
            setSelectedUsers(selectedUsers.filter(id => !roleUserIds.includes(id)));
        } else {
            const newSelected = [...selectedUsers];
            roleUserIds.forEach(id => {
                if (!newSelected.includes(id)) {
                    newSelected.push(id);
                }
            });
            setSelectedUsers(newSelected);
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedUsers.length === 0) {
            toast.error('Vui lòng chọn ít nhất một người nhận');
            return;
        }

        if (!notification.tieuDe.trim() || !notification.noiDung.trim()) {
            toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
            return;
        }

        try {
            setSending(true);

            // In a real app, this would call a notification service
            // For now, we'll simulate the API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success(`Đã gửi thông báo cho ${selectedUsers.length} người`);

            // Reset form
            setNotification({
                tieuDe: '',
                noiDung: '',
                nguoiNhan: [],
                loaiThongBao: 'Thông báo chung',
                trangThai: 'Đã gửi'
            });
            setSelectedUsers([]);
            setSelectAll(false);

        } catch (error) {
            toast.error('Gửi thông báo thất bại');
        } finally {
            setSending(false);
        }
    };

    const getPresetMessages = () => {
        return {
            'Nhắc nhở lịch khám': {
                tieuDe: 'Nhắc nhở lịch khám',
                noiDung: 'Kính gửi quý khách,\n\nChúng tôi xin nhắc nhở quý khách có lịch khám vào ngày [NGÀY] lúc [GIỜ].\n\nVui lòng đến đúng giờ hoặc liên hệ với chúng tôi nếu có thay đổi.\n\nXin cảm ơn!'
            },
            'Thông báo nghỉ lễ': {
                tieuDe: 'Thông báo lịch nghỉ lễ',
                noiDung: 'Kính gửi quý khách,\n\nPhòng khám sẽ nghỉ lễ từ ngày [TỪ NGÀY] đến ngày [ĐẾN NGÀY].\n\nChúng tôi sẽ hoạt động trở lại vào ngày [NGÀY MỞ CỬA].\n\nXin cảm ơn sự thông cảm của quý khách!'
            },
            'Thông báo thanh toán': {
                tieuDe: 'Thông báo thanh toán',
                noiDung: 'Kính gửi quý khách,\n\nChúng tôi xin thông báo quý khách còn dư nợ [SỐ TIỀN] cho dịch vụ khám ngày [NGÀY].\n\nVui lòng liên hệ để thanh toán.\n\nXin cảm ơn!'
            }
        };
    };

    const applyPresetMessage = (type: string) => {
        const presets = getPresetMessages();
        const preset = presets[type as keyof typeof presets];
        if (preset) {
            setNotification({
                ...notification,
                tieuDe: preset.tieuDe,
                noiDung: preset.noiDung,
                loaiThongBao: type
            });
        }
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchRole = !filterRole || user.maQuyen.toString() === filterRole;
        const matchSearch = !searchTerm ||
            user.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.eMail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.soDienThoai.includes(searchTerm);

        return matchRole && matchSearch;
    });

    // Group users by role
    const usersByRole = filteredUsers.reduce((acc, user) => {
        const role = user.maQuyen;
        if (!acc[role]) {
            acc[role] = [];
        }
        acc[role].push(user);
        return acc;
    }, {} as { [key: number]: User[] });

    const stats = {
        totalUsers: users.length,
        selectedUsers: selectedUsers.length,
        doctors: users.filter(u => u.maQuyen === 2).length,
        patients: users.filter(u => u.maQuyen === 4).length,
        staff: users.filter(u => [1, 3, 5].includes(u.maQuyen)).length
    };

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Gửi thông báo</h4>
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-outline-primary" onClick={fetchUsers}>
                        <i className="icofont-refresh me-2"></i>Làm mới
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="row mb-4">
                <div className="col-md-2">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.totalUsers}</h5>
                            <small>Tổng người dùng</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.selectedUsers}</h5>
                            <small>Đã chọn</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.doctors}</h5>
                            <small>Nha sĩ</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-warning text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.patients}</h5>
                            <small>Bệnh nhân</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-secondary text-white">
                        <div className="card-body text-center py-2">
                            <h5>{stats.staff}</h5>
                            <small>Nhân viên</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-dark text-white">
                        <div className="card-body text-center py-2">
                            <h5>{filteredUsers.length}</h5>
                            <small>Kết quả lọc</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Left: Notification Form */}
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">
                                <i className="icofont-email me-2"></i>Soạn thông báo
                            </h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSendNotification}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Loại thông báo</label>
                                        <select
                                            className="form-select"
                                            value={notification.loaiThongBao}
                                            onChange={(e) => {
                                                setNotification({ ...notification, loaiThongBao: e.target.value });
                                                applyPresetMessage(e.target.value);
                                            }}
                                        >
                                            {notificationTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Số người nhận đã chọn</label>
                                        <div className="form-control bg-light">
                                            <strong>{selectedUsers.length}</strong> người
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Tiêu đề *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={notification.tieuDe}
                                        onChange={(e) => setNotification({ ...notification, tieuDe: e.target.value })}
                                        placeholder="Nhập tiêu đề thông báo"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Nội dung *</label>
                                    <textarea
                                        className="form-control"
                                        rows={8}
                                        value={notification.noiDung}
                                        onChange={(e) => setNotification({ ...notification, noiDung: e.target.value })}
                                        placeholder="Nhập nội dung thông báo"
                                        required
                                    />
                                    <div className="form-text">
                                        Có thể sử dụng các placeholder: [NGÀY], [GIỜ], [TÊN], [SỐ TIỀN]
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-muted">
                                            Đã chọn {selectedUsers.length} người nhận
                                        </small>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={sending || selectedUsers.length === 0}
                                    >
                                        {sending ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <i className="icofont-send-mail me-2"></i>
                                                Gửi thông báo
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right: User Selection */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">
                                <i className="icofont-users me-2"></i>Chọn người nhận
                            </h6>
                        </div>
                        <div className="card-body">
                            {/* Filters */}
                            <div className="mb-3">
                                <div className="row g-2">
                                    <div className="col-12">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Tìm kiếm theo tên, email, SĐT..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <select
                                            className="form-select form-select-sm"
                                            value={filterRole}
                                            onChange={(e) => setFilterRole(e.target.value)}
                                        >
                                            <option value="">Tất cả vai trò</option>
                                            {Object.entries(roleMap).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-3">
                                <div className="d-flex flex-wrap gap-1">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={handleSelectAll}
                                    >
                                        {selectAll ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-info btn-sm"
                                        onClick={() => handleRoleSelect(2)}
                                    >
                                        Chọn nha sĩ
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-warning btn-sm"
                                        onClick={() => handleRoleSelect(4)}
                                    >
                                        Chọn bệnh nhân
                                    </button>
                                </div>
                            </div>

                            {/* User List */}
                            {loading ? (
                                <div className="text-center py-3">
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    {Object.entries(usersByRole).map(([role, roleUsers]) => (
                                        <div key={role} className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="mb-0">
                                                    <span className={`badge bg-${role === '2' ? 'info' : role === '4' ? 'warning' : 'secondary'}`}>
                                                        {roleMap[parseInt(role)]} ({roleUsers.length})
                                                    </span>
                                                </h6>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleRoleSelect(parseInt(role))}
                                                >
                                                    Chọn nhóm
                                                </button>
                                            </div>

                                            {roleUsers.map(user => (
                                                <div key={user.maNguoiDung} className="form-check mb-1">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`user-${user.maNguoiDung}`}
                                                        checked={selectedUsers.includes(user.maNguoiDung)}
                                                        onChange={() => handleUserSelect(user.maNguoiDung)}
                                                    />
                                                    <label className="form-check-label w-100" htmlFor={`user-${user.maNguoiDung}`}>
                                                        <div className="d-flex justify-content-between">
                                                            <div>
                                                                <div className="fw-bold">{user.hoTen}</div>
                                                                <small className="text-muted">{user.eMail}</small>
                                                            </div>
                                                            <small className="text-muted">{user.soDienThoai}</small>
                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    ))}

                                    {filteredUsers.length === 0 && (
                                        <div className="text-center py-3 text-muted">
                                            <i className="icofont-users-alt-4 fs-3"></i>
                                            <p className="mt-2">Không tìm thấy người dùng nào</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Selected Users */}
            {selectedUsers.length > 0 && (
                <div className="card mt-4">
                    <div className="card-header">
                        <h6 className="mb-0">
                            <i className="icofont-check me-2"></i>
                            Danh sách người nhận ({selectedUsers.length})
                        </h6>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {users.filter(user => selectedUsers.includes(user.maNguoiDung)).map(user => (
                                <div key={user.maNguoiDung} className="col-md-4 col-lg-3 mb-2">
                                    <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                                        <div>
                                            <div className="fw-bold">{user.hoTen}</div>
                                            <small className="text-muted">{user.tenQuyen}</small>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleUserSelect(user.maNguoiDung)}
                                            title="Bỏ chọn"
                                        >
                                            <i className="icofont-close"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReceptionistNotifications; 