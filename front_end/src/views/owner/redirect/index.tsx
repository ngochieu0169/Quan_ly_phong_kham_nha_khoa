import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OwnerRedirect: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log('OwnerRedirect: Component loaded');

        // Kiểm tra user từ localStorage
        const saved = localStorage.getItem('user');
        if (saved) {
            try {
                const userObj = JSON.parse(saved);
                console.log('OwnerRedirect: Current user:', userObj);

                if (userObj.maQuyen === 5) {
                    console.log('OwnerRedirect: User is clinic owner, redirecting to /owner');
                    navigate('/owner', { replace: true });
                } else {
                    console.log('OwnerRedirect: User is not clinic owner, redirecting to login');
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                console.error('OwnerRedirect: Error parsing user data:', error);
                navigate('/login', { replace: true });
            }
        } else {
            console.log('OwnerRedirect: No user data found, redirecting to login');
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang chuyển hướng...</span>
                </div>
                <p className="mt-3 text-muted">Đang chuyển hướng đến trang quản lý...</p>
            </div>
        </div>
    );
};

export default OwnerRedirect; 