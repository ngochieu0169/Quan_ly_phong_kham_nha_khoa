import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const RedirectPage: React.FC = () => {
    const user = useSelector((state: any) => state.user.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.maQuyen) {
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
                    navigate('/phongkham');
                    break;
                default:
                    navigate('/login');
            }
        } else {
            // Chưa đăng nhập, về trang home
            navigate('/home');
        }
    }, [user, navigate]);

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