import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { updateUser } from '../../../store/user';

const RedirectPage: React.FC = () => {
    const user = useSelector((state: any) => state.user.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        // Kiểm tra localStorage trước để đồng bộ user state
        const saved = localStorage.getItem('user');
        if (saved && !user?.tenTaiKhoan) {
            try {
                const userObj = JSON.parse(saved);
                if (userObj.tenTaiKhoan) {
                    dispatch(updateUser(userObj));
                    return; // Đợi user state được cập nhật
                }
            } catch {
                localStorage.removeItem('user');
            }
        }

        // Chỉ redirect khi đang ở trang root "/"
        if (location.pathname === '/' && user?.maQuyen) {
            // Điều hướng theo quyền user
            switch (user.maQuyen) {
                case 1: // Admin
                    navigate('/admin');
                    break;
                case 2: // Doctor
                    navigate('/doctor/profile');
                    break;
                case 3: // Receptionist
                    navigate('/le-tan');
                    break;
                case 4: // Patient - cho phép xem trang home
                    navigate('/home');
                    break;
                case 5: // Clinic Owner
                    navigate('/owner');
                    break;
                default:
                    navigate('/login');
            }
        } else if (location.pathname === '/' && !user?.maQuyen) {
            // Chưa đăng nhập, về trang home
            navigate('/home');
        }
    }, [user, navigate, dispatch, location]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang chuyển hướng...</span>
                </div>
                <p className="mt-3 text-muted">Đang chuyển hướng...</p>
            </div>
        </div>
    );
};

export default RedirectPage; 