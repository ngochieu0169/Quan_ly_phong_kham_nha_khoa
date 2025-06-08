import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { appointmentService, userService, userServiceExtended, shiftService } from '../../../services';

interface Appointment {
    maLichKham: number;
    maBenhNhan: number;
    maCaKham: number;
    trieuChung: string;
    ngayDatLich: string;
    trangThai: string;
    tenBenhNhan?: string;
    soDienThoai?: string;
    gioBatDau?: string;
    gioKetThuc?: string;
    tenNhaSi?: string;
}

function ReceptionistCheckin() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, [selectedDate]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);

            const [appointmentRes, patientRes, shiftRes] = await Promise.all([
                appointmentService.all(),
                userServiceExtended.getFullList({ maQuyen: 4 }),
                shiftService.all()
            ]);

            const appointments = appointmentRes.data;
            const patients = patientRes.data;
            const shifts = shiftRes.data;

            // Filter appointments for today and relevant statuses
            const todayAppointments = appointments.filter((apt: any) => {
                const aptDate = new Date(apt.ngayDatLich).toISOString().split('T')[0];
                return aptDate === selectedDate && ['Chờ', 'Đã đặt', 'Đã đến', 'Đang khám'].includes(apt.trangThai);
            });

            // Enrich with patient and shift information
            const enrichedAppointments = todayAppointments.map((apt: any) => {
                const patient = patients.find((p: any) => p.maNguoiDung === apt.maBenhNhan);
                const shift = shifts.find((s: any) => s.maCaKham === apt.maCaKham);

                return {
                    ...apt,
                    tenBenhNhan: patient?.hoTen,
                    soDienThoai: patient?.soDienThoai,
                    gioBatDau: shift?.gioBatDau,
                    gioKetThuc: shift?.gioKetThuc,
                    tenNhaSi: shift?.tenNhaSi
                };
            });

            // Sort by time
            enrichedAppointments.sort((a: Appointment, b: Appointment) => {
                if (a.gioBatDau && b.gioBatDau) {
                    return a.gioBatDau.localeCompare(b.gioBatDau);
                }
                return 0;
            });

            setAppointments(enrichedAppointments);
        } catch (error) {
            toast.error('Không thể tải danh sách lịch khám');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckin = async (appointmentId: number) => {
        try {
            await appointmentService.update(appointmentId, { trangThai: 'Đã đến' });
            toast.success('Xác nhận bệnh nhân đã đến thành công');
            fetchAppointments();
        } catch (error) {
            toast.error('Xác nhận thất bại');
        }
    };

    const handleStartExam = async (appointmentId: number) => {
        try {
            await appointmentService.update(appointmentId, { trangThai: 'Đang khám' });
            toast.success('Chuyển trạng thái đang khám thành công');
            fetchAppointments();
        } catch (error) {
            toast.error('Cập nhật trạng thái thất bại');
        }
    };

    const formatTime = (time: string | undefined) => {
        if (!time) return '';
        return time.substring(0, 5);
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Chờ': 'warning',
            'Đã đặt': 'info',
            'Đã đến': 'primary',
            'Đang khám': 'success'
        };
        return `badge bg-${statusMap[status] || 'secondary'}`;
    };

    const getStatusIcon = (status: string) => {
        const iconMap: { [key: string]: string } = {
            'Chờ': 'icofont-clock-time',
            'Đã đặt': 'icofont-calendar',
            'Đã đến': 'icofont-check-alt',
            'Đang khám': 'icofont-medical-sign'
        };
        return iconMap[status] || 'icofont-clock-time';
    };

    const getActionButtons = (appointment: Appointment) => {
        const buttons = [];

        if (appointment.trangThai === 'Chờ' || appointment.trangThai === 'Đã đặt') {
            buttons.push(
                <button
                    key="checkin"
                    className="btn btn-sm btn-primary me-1"
                    onClick={() => handleCheckin(appointment.maLichKham)}
                >
                    <i className="icofont-check me-1"></i>Xác nhận đến
                </button>
            );
        }

        if (appointment.trangThai === 'Đã đến') {
            buttons.push(
                <button
                    key="start-exam"
                    className="btn btn-sm btn-success me-1"
                    onClick={() => handleStartExam(appointment.maLichKham)}
                >
                    <i className="icofont-medical-sign me-1"></i>Bắt đầu khám
                </button>
            );
        }

        return buttons;
    };

    // Filter appointments
    const filteredAppointments = appointments.filter(appointment => {
        if (!searchTerm) return true;

        return appointment.tenBenhNhan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.soDienThoai?.includes(searchTerm);
    });

    // Group by time slots
    const timeSlots = [
        { start: '08:00', end: '10:00', label: 'Ca sáng sớm (8:00 - 10:00)' },
        { start: '10:00', end: '12:00', label: 'Ca sáng muộn (10:00 - 12:00)' },
        { start: '13:00', end: '15:00', label: 'Ca chiều sớm (13:00 - 15:00)' },
        { start: '15:00', end: '17:00', label: 'Ca chiều muộn (15:00 - 17:00)' },
    ];

    const groupedAppointments = timeSlots.map(slot => {
        const slotAppointments = filteredAppointments.filter(appointment =>
            formatTime(appointment.gioBatDau) >= slot.start && formatTime(appointment.gioBatDau) < slot.end
        );

        return {
            ...slot,
            appointments: slotAppointments
        };
    });

    const stats = {
        waiting: appointments.filter(a => a.trangThai === 'Chờ' || a.trangThai === 'Đã đặt').length,
        arrived: appointments.filter(a => a.trangThai === 'Đã đến').length,
        examining: appointments.filter(a => a.trangThai === 'Đang khám').length,
        total: appointments.length
    };

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Xác nhận bệnh nhân đến khám</h4>
                <div className="d-flex align-items-center gap-3">
                    <input
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '180px' }}
                    />
                    <button className="btn btn-primary" onClick={fetchAppointments}>
                        <i className="icofont-refresh me-2"></i>Làm mới
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body text-center">
                            <i className="icofont-clock-time fs-1 mb-2"></i>
                            <h4>{stats.waiting}</h4>
                            <small>Chờ xác nhận</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <i className="icofont-check-alt fs-1 mb-2"></i>
                            <h4>{stats.arrived}</h4>
                            <small>Đã đến</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center">
                            <i className="icofont-medical-sign fs-1 mb-2"></i>
                            <h4>{stats.examining}</h4>
                            <small>Đang khám</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <i className="icofont-calendar fs-1 mb-2"></i>
                            <h4>{stats.total}</h4>
                            <small>Tổng lịch hẹn</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="card mb-3">
                <div className="card-body py-2">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm kiếm theo tên bệnh nhân hoặc số điện thoại..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6 text-end">
                            <span className="text-muted">
                                Ngày: {new Date(selectedDate).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointments by Time Slots */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {groupedAppointments.map((timeSlot, index) => (
                        <div key={index} className="col-lg-6 mb-4">
                            <div className="card h-100">
                                <div className="card-header bg-light">
                                    <h6 className="mb-0">
                                        <i className="icofont-clock-time me-2"></i>
                                        {timeSlot.label}
                                    </h6>
                                </div>
                                <div className="card-body">
                                    {timeSlot.appointments.length > 0 ? (
                                        <div className="list-group list-group-flush">
                                            {timeSlot.appointments.map(appointment => (
                                                <div key={appointment.maLichKham} className="list-group-item px-0">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <h6 className="mb-0 d-flex align-items-center">
                                                                    <i className={`${getStatusIcon(appointment.trangThai)} me-2 text-primary`}></i>
                                                                    {appointment.tenBenhNhan}
                                                                </h6>
                                                                <span className={getStatusBadge(appointment.trangThai)}>
                                                                    {appointment.trangThai}
                                                                </span>
                                                            </div>

                                                            <div className="row g-2 mb-2">
                                                                <div className="col-sm-6">
                                                                    <small className="text-muted">
                                                                        <i className="icofont-phone me-1"></i>
                                                                        {appointment.soDienThoai}
                                                                    </small>
                                                                </div>
                                                                <div className="col-sm-6">
                                                                    <small className="text-muted">
                                                                        <i className="icofont-clock-time me-1"></i>
                                                                        {formatTime(appointment.gioBatDau)} - {formatTime(appointment.gioKetThuc)}
                                                                    </small>
                                                                </div>
                                                            </div>

                                                            <div className="mb-2">
                                                                <small className="text-muted">
                                                                    <i className="icofont-doctor me-1"></i>
                                                                    Nha sĩ: {appointment.tenNhaSi || 'Chưa phân công'}
                                                                </small>
                                                            </div>

                                                            <div className="mb-3">
                                                                <small>
                                                                    <strong>Triệu chứng:</strong> {appointment.trieuChung}
                                                                </small>
                                                            </div>

                                                            <div className="d-flex gap-1">
                                                                {getActionButtons(appointment)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            <i className="icofont-calendar fs-3"></i>
                                            <p className="mt-2 mb-0">Không có lịch hẹn nào</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <div className="card mt-4">
                <div className="card-header">
                    <h6 className="mb-0">
                        <i className="icofont-list me-2"></i>Danh sách tổng hợp
                    </h6>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>STT</th>
                                    <th>Giờ khám</th>
                                    <th>Bệnh nhân</th>
                                    <th>Nha sĩ</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map((appointment, index) => (
                                    <tr key={appointment.maLichKham}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <strong>{formatTime(appointment.gioBatDau)} - {formatTime(appointment.gioKetThuc)}</strong>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="fw-bold">{appointment.tenBenhNhan}</div>
                                                <small className="text-muted">{appointment.soDienThoai}</small>
                                            </div>
                                        </td>
                                        <td>{appointment.tenNhaSi || 'Chưa phân công'}</td>
                                        <td>
                                            <span className={getStatusBadge(appointment.trangThai)}>
                                                {appointment.trangThai}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                {getActionButtons(appointment)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredAppointments.length === 0 && (
                            <div className="text-center py-4 text-muted">
                                <i className="icofont-calendar fs-3"></i>
                                <p className="mt-2">Không có lịch hẹn nào cần xác nhận</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReceptionistCheckin; 