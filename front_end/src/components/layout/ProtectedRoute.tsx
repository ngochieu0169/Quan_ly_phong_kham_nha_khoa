import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../../store/user';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: number[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const user = useSelector((state: any) => state.user.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            console.log('ProtectedRoute: Initializing auth...');
            // Kiểm tra localStorage
            const saved = localStorage.getItem('user');

            if (saved) {
                try {
                    const userObj = JSON.parse(saved);
                    console.log('ProtectedRoute: Found user data:', userObj);
                    if (userObj.tenTaiKhoan) {
                        dispatch(updateUser(userObj));

                        // Kiểm tra quyền truy cập nếu có specified allowedRoles
                        if (allowedRoles && !allowedRoles.includes(userObj.maQuyen)) {
                            // User không có quyền truy cập route này
                            switch (userObj.maQuyen) {
                                case 1: // Admin
                                    navigate('/admin');
                                    break;
                                case 2: // Doctor
                                    navigate('/doctor/profile');
                                    break;
                                case 3: // Receptionist
                                    navigate('/le-tan');
                                    break;
                                case 4: // Patient
                                    navigate('/home');
                                    break;
                                case 5: // Clinic Owner
                                    navigate('/owner');
                                    break;
                                default:
                                    navigate('/login');
                            }
                            return;
                        }

                        setIsLoading(false);
                        return;
                    }
                } catch {
                    localStorage.removeItem('user');
                }
            }

            // Không có user hợp lệ, redirect to login
            navigate('/login');
        };

        if (!user?.tenTaiKhoan) {
            initializeAuth();
        } else {
            // User đã có trong Redux store
            if (allowedRoles && !allowedRoles.includes(user.maQuyen)) {
                // User không có quyền truy cập route này
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
                    case 4: // Patient
                        navigate('/home');
                        break;
                    case 5: // Clinic Owner
                        navigate('/owner');
                        break;
                    default:
                        navigate('/login');
                }
                return;
            }
            setIsLoading(false);
        }
    }, [user, dispatch, navigate, allowedRoles]);

    if (isLoading || !user?.tenTaiKhoan) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang xác thực...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang xác thực...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute; 