import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { appointmentService, shiftService, userServiceExtended, clinicService } from '../../../services';
import { requestAPI } from '../../../axiosconfig';
import EmptySchedule from '../../home/bookingPage/emptySchedule';

interface AppointmentForm {
    maBenhNhan: number;
    maCaKham: number;
    trieuChung: string;
    trangThai: string;
    ngayDatLich: string;
}

interface Patient {
    maNguoiDung: number;
    hoTen: string;
    soDienThoai: string;
    eMail: string;
    ngaySinh: string;
    gioiTinh: string;
    diaChi: string;
}

interface Shift {
    maCaKham: number;
    ngayKham: string;
    gioBatDau: string;
    gioKetThuc: string;
    maNhaSi?: string;
    tenNhaSi?: string;
    moTa?: string;
    isPendingAssignment?: boolean;
    needsDoctor?: boolean;
}

interface Clinic {
    maPhongKham: number;
    tenPhongKham: string;
    diaChi: string;
    soDienThoai: string;
    gioLamViec: string;
}

interface Doctor {
    maNguoiDung: number;
    hoTen: string;
    eMail: string;
    soDienThoai: string;
    bacsiData?: {
        maNhaSi: string;
        maPhongKham: number;
        kinhNghiem: string;
        chucVu: string;
    };
}

interface NewShiftForm {
    gioBatDau: string;
    gioKetThuc: string;
    maNhaSi: string;
    moTa: string;
}

function CreateAppointment() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedClinic, setSelectedClinic] = useState<number>(0);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableShifts, setAvailableShifts] = useState<Shift[]>([]);
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
    const [useEmptySchedule, setUseEmptySchedule] = useState(false);
    const [showCreateShiftModal, setShowCreateShiftModal] = useState(false);
    const [showAssignDoctorModal, setShowAssignDoctorModal] = useState(false);
    const [selectedShiftForAssignment, setSelectedShiftForAssignment] = useState<Shift | null>(null);
    const [assignDoctorForm, setAssignDoctorForm] = useState({
        maNhaSi: '',
        gioBatDau: '',
        gioKetThuc: '',
        moTa: ''
    });
    const [newShiftForm, setNewShiftForm] = useState<NewShiftForm>({
        gioBatDau: '',
        gioKetThuc: '',
        maNhaSi: '',
        moTa: ''
    });

    const [formData, setFormData] = useState<AppointmentForm>({
        maBenhNhan: 0,
        maCaKham: 0,
        trieuChung: '',
        trangThai: 'Chờ',
        ngayDatLich: new Date().toISOString().split('T')[0]
    });

    const [errors, setErrors] = useState<any>({});

    const statusOptions = [
        { value: 'Chờ', label: 'Chờ xác nhận', color: 'warning' },
        { value: 'Đã đặt', label: 'Đã đặt', color: 'info' },
        { value: 'Đã đến', label: 'Đã đến', color: 'primary' },
    ];

    const timeSlots = [
        { start: '08:00', end: '10:00', label: 'Ca sáng sớm' },
        { start: '10:00', end: '12:00', label: 'Ca sáng muộn' },
        { start: '13:00', end: '15:00', label: 'Ca chiều sớm' },
        { start: '15:00', end: '17:00', label: 'Ca chiều muộn' },
        { start: '17:00', end: '19:00', label: 'Ca tối' }
    ];

    useEffect(() => {
        fetchInitialData();
        fetchPendingAppointments();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchAvailableShifts();
        }
    }, [selectedDate, selectedClinic, selectedDoctor]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [patientsRes, clinicsRes, doctorsRes] = await Promise.all([
                userServiceExtended.getFullList({ maQuyen: 4 }), // Patients
                clinicService.all(),
                userServiceExtended.getFullList({ maQuyen: 2 }) // Doctors
            ]);

            setPatients(patientsRes.data);
            setClinics(clinicsRes.data);
            setDoctors(doctorsRes.data);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingAppointments = async () => {
        try {
            const response = await requestAPI.get('/api/lichkham/pending-doctor-assignment');
            setPendingAppointments(response.data);
        } catch (error) {
            console.error('Error fetching pending appointments:', error);
            // Don't show error toast as this is not critical
        }
    };

    const fetchAvailableShifts = async () => {
        try {
            const shiftsRes = await shiftService.all();
            let filteredShifts = shiftsRes.data.filter((shift: any) => {
                const shiftDate = new Date(shift.ngayKham).toISOString().split('T')[0];
                return shiftDate === selectedDate;
            });

            // Filter by clinic if selected
            if (selectedClinic) {
                const clinicDoctors = doctors.filter(doc =>
                    doc.bacsiData?.maPhongKham === selectedClinic
                );
                const clinicDoctorIds = clinicDoctors.map(doc => doc.bacsiData?.maNhaSi);
                filteredShifts = filteredShifts.filter((shift: any) =>
                    clinicDoctorIds.includes(shift.maNhaSi) || shift.maNhaSi === null
                );
            }

            // Filter by doctor if selected
            if (selectedDoctor) {
                filteredShifts = filteredShifts.filter((shift: any) =>
                    shift.maNhaSi === selectedDoctor
                );
            }

            // Enrich with doctor info and check for pending assignments
            const enrichedShifts = filteredShifts.map((shift: any) => {
                const doctor = doctors.find(doc => doc.bacsiData?.maNhaSi === shift.maNhaSi);
                const isPendingAssignment = shift.maNhaSi === null;

                return {
                    ...shift,
                    tenNhaSi: doctor?.hoTen || (isPendingAssignment ? 'Chờ phân công bác sĩ' : 'Chưa phân công'),
                    isPendingAssignment,
                    needsDoctor: isPendingAssignment
                };
            });

            setAvailableShifts(enrichedShifts);
        } catch (error) {
            toast.error('Không thể tải ca khám');
        }
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.maBenhNhan) newErrors.maBenhNhan = 'Vui lòng chọn bệnh nhân';

        // Validate shift selection based on mode
        if (useEmptySchedule) {
            if (!selectedSlot) newErrors.maCaKham = 'Vui lòng chọn khung giờ khám';
        } else {
            if (!formData.maCaKham) newErrors.maCaKham = 'Vui lòng chọn ca khám';
        }

        if (!formData.trieuChung.trim()) newErrors.trieuChung = 'Vui lòng nhập triệu chứng';
        if (!formData.ngayDatLich) newErrors.ngayDatLich = 'Vui lòng chọn ngày khám';

        // Validate date format
        if (formData.ngayDatLich) {
            const dateObj = new Date(formData.ngayDatLich);
            if (isNaN(dateObj.getTime())) {
                newErrors.ngayDatLich = 'Định dạng ngày không hợp lệ';
            } else {
                // Check if selected date is not in the past
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (dateObj < today) {
                    newErrors.ngayDatLich = 'Không thể đặt lịch cho ngày đã qua';
                }
            }
        }

        // Validate that the selected shift's examination date matches the form date
        const selectedShift = availableShifts.find(s => s.maCaKham === formData.maCaKham);
        if (selectedShift && formData.ngayDatLich && selectedShift.ngayKham !== formData.ngayDatLich) {
            newErrors.maCaKham = 'Ca khám không khớp với ngày đã chọn';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setLoading(true);

            // Debug log
            console.log('=== DEBUG frontend submit ===');
            console.log('Form data:', formData);
            console.log('Selected slot:', selectedSlot);
            console.log('ngayDatLich:', formData.ngayDatLich, 'type:', typeof formData.ngayDatLich);

            // Ensure proper date format - create manually to avoid any library conflicts
            const dateObj = new Date(formData.ngayDatLich);
            if (isNaN(dateObj.getTime())) {
                toast.error('Ngày khám không hợp lệ');
                return;
            }

            // Create YYYY-MM-DD format manually
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth() + 1;
            const day = dateObj.getDate();
            const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            console.log('Date components:', { year, month, day });
            console.log('Manual formatted date:', formattedDate);

            // Debug: Check if Date.prototype has been modified
            console.log('Date.prototype.toJSON:', Date.prototype.toJSON.toString());
            console.log('dateObj.toJSON():', dateObj.toJSON());

            if (selectedSlot && selectedSlot.isDefault) {
                // Get patient info for shift description
                const selectedPatient = patients.find(p => p.maNguoiDung === formData.maBenhNhan);
                const patientInfo = selectedPatient ? `${selectedPatient.hoTen} (${selectedPatient.soDienThoai})` : `ID:${formData.maBenhNhan}`;

                // Create new shift first, then create appointment
                const shiftData = {
                    ngayKham: formattedDate,
                    gioBatDau: selectedSlot.start + ':00',
                    gioKetThuc: selectedSlot.end + ':00',
                    moTa: `[Lễ tân] BN: ${patientInfo} - ${formData.trieuChung}`,
                    maNhaSi: null // Will be assigned later
                };

                console.log('Creating shift:', shiftData);
                const shiftResponse = await shiftService.create(shiftData);
                const newShiftId = shiftResponse.data.insertId || shiftResponse.data.maCaKham;

                // Create appointment with new shift
                const submitData = {
                    maBenhNhan: formData.maBenhNhan,
                    maCaKham: newShiftId,
                    trieuChung: formData.trieuChung,
                    trangThai: formData.trangThai,
                    ngayDatLich: formattedDate,
                    maNguoiDat: 'letan1', // TODO: Get from auth context
                    quanHeBenhNhanVaNguoiDat: 'Lễ tân đặt hộ'
                };

                console.log('Creating appointment with new shift:', submitData);
                await appointmentService.create(submitData);
                toast.success('Tạo ca khám và lịch khám thành công!');
            } else {
                // Use existing shift - create completely new object to avoid any reference issues
                const submitData = Object.create(null);
                submitData.maBenhNhan = Number(formData.maBenhNhan);
                submitData.maCaKham = Number(formData.maCaKham);
                submitData.trieuChung = String(formData.trieuChung);
                submitData.trangThai = String(formData.trangThai);
                submitData.ngayDatLich = String(formattedDate);
                submitData.maNguoiDat = String('letan1'); // TODO: Get from auth context
                submitData.quanHeBenhNhanVaNguoiDat = String('Lễ tân đặt hộ');

                console.log('Creating appointment with existing shift:', submitData);
                console.log('submitData.ngayDatLich:', submitData.ngayDatLich);
                console.log('formattedDate:', formattedDate);

                // Final validation before sending
                if (!/^\d{4}-\d{2}-\d{2}$/.test(submitData.ngayDatLich)) {
                    toast.error('Lỗi format ngày: ' + submitData.ngayDatLich);
                    return;
                }

                // Create a completely new object with primitive values only
                const finalData: any = {};
                finalData.maBenhNhan = parseInt(String(submitData.maBenhNhan));
                finalData.maCaKham = parseInt(String(submitData.maCaKham));
                finalData.trieuChung = String(submitData.trieuChung);
                finalData.trangThai = String(submitData.trangThai);
                finalData.ngayDatLich = String(formattedDate); // Use the manually formatted date
                finalData.maNguoiDat = String(submitData.maNguoiDat);
                finalData.quanHeBenhNhanVaNguoiDat = String(submitData.quanHeBenhNhanVaNguoiDat);

                console.log('Final data for axios:', finalData);
                console.log('Final data ngayDatLich:', finalData.ngayDatLich);
                console.log('JSON.stringify(finalData):', JSON.stringify(finalData));

                await appointmentService.create(finalData);
                toast.success('Tạo lịch khám thành công!');
            }

            navigate('/le-tan/appointments');
        } catch (error: any) {
            console.error('Submit error:', error);
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo lịch khám';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof AppointmentForm, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }

        // Auto-set ngayDatLich when selecting a shift to match the actual examination date
        if (field === 'maCaKham' && value > 0) {
            const selectedShift = availableShifts.find(shift => shift.maCaKham === value);
            if (selectedShift && selectedShift.ngayKham) {
                // Validate the shift date before setting
                const shiftDate = new Date(selectedShift.ngayKham);
                if (!isNaN(shiftDate.getTime())) {
                    // Create YYYY-MM-DD format manually
                    const year = shiftDate.getFullYear();
                    const month = shiftDate.getMonth() + 1;
                    const day = shiftDate.getDate();
                    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

                    setFormData(prev => ({
                        ...prev,
                        [field]: value,
                        ngayDatLich: formattedDate // Use the actual examination date from CAKHAM
                    }));
                } else {
                    console.error('Invalid shift date:', selectedShift.ngayKham);
                    toast.error('Ca khám có ngày không hợp lệ');
                }
            }
        }
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        // Reset shift selection when date changes
        setFormData((prev: AppointmentForm) => ({
            ...prev,
            ngayDatLich: date,
            maCaKham: 0
        }));
        // Clear any existing errors
        if (errors.maCaKham) {
            setErrors((prev: any) => ({ ...prev, maCaKham: '' }));
        }
    };

    const handleCreateShift = async () => {
        if (!newShiftForm.gioBatDau || !newShiftForm.gioKetThuc || !newShiftForm.maNhaSi) {
            toast.error('Vui lòng điền đầy đủ thông tin ca khám');
            return;
        }

        try {
            setLoading(true);
            const shiftData = {
                ngayKham: selectedDate,
                gioBatDau: newShiftForm.gioBatDau + ':00',
                gioKetThuc: newShiftForm.gioKetThuc + ':00',
                moTa: newShiftForm.moTa,
                maNhaSi: newShiftForm.maNhaSi
            };

            const response = await shiftService.create(shiftData);
            const newShiftId = response.data.insertId || response.data.maCaKham;

            toast.success('Tạo ca khám mới thành công!');
            setShowCreateShiftModal(false);
            setNewShiftForm({ gioBatDau: '', gioKetThuc: '', maNhaSi: '', moTa: '' });

            // Auto select the new shift
            handleInputChange('maCaKham', newShiftId);

            // Refresh available shifts
            await fetchAvailableShifts();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo ca khám';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignDoctor = async () => {
        if (!assignDoctorForm.maNhaSi || !selectedShiftForAssignment) {
            toast.error('Vui lòng chọn bác sĩ');
            return;
        }

        try {
            setLoading(true);
            const updateData = {
                maNhaSi: assignDoctorForm.maNhaSi,
                gioBatDau: assignDoctorForm.gioBatDau ? assignDoctorForm.gioBatDau + ':00' : selectedShiftForAssignment.gioBatDau,
                gioKetThuc: assignDoctorForm.gioKetThuc ? assignDoctorForm.gioKetThuc + ':00' : selectedShiftForAssignment.gioKetThuc,
                moTa: assignDoctorForm.moTa || selectedShiftForAssignment.moTa
            };

            await shiftService.update(selectedShiftForAssignment.maCaKham, updateData);

            toast.success('Phân công bác sĩ thành công!');
            setShowAssignDoctorModal(false);
            setSelectedShiftForAssignment(null);
            setAssignDoctorForm({ maNhaSi: '', gioBatDau: '', gioKetThuc: '', moTa: '' });

            // Refresh both available shifts and pending appointments
            await fetchAvailableShifts();
            await fetchPendingAppointments();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi phân công bác sĩ';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssignModal = (shift: Shift) => {
        setSelectedShiftForAssignment(shift);
        setAssignDoctorForm({
            maNhaSi: '',
            gioBatDau: formatTime(shift.gioBatDau),
            gioKetThuc: formatTime(shift.gioKetThuc),
            moTa: shift.moTa || ''
        });
        setShowAssignDoctorModal(true);
    };

    const formatTime = (time: string) => {
        return time ? time.substring(0, 5) : '';
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return 'N/A';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getSelectedPatient = () => {
        return patients.find(p => p.maNguoiDung === formData.maBenhNhan);
    };

    const getSelectedShift = () => {
        return availableShifts.find(s => s.maCaKham === formData.maCaKham);
    };

    const getAvailableDoctors = () => {
        let availableDoctors = doctors;

        // Filter by clinic if selected
        if (selectedClinic) {
            availableDoctors = availableDoctors.filter(doc =>
                doc.bacsiData?.maPhongKham === selectedClinic
            );
        }

        return availableDoctors;
    };

    const handleSlotSelect = (slotData: any) => {
        console.log('=== DEBUG slot selected ===');
        console.log('Slot data:', slotData);

        setSelectedSlot(slotData);

        if (slotData.isDefault) {
            // Default slot - will create new shift
            setFormData(prev => ({
                ...prev,
                maCaKham: 0, // Will be set after creating shift
                ngayDatLich: new Date(slotData.date).toISOString().split('T')[0]
            }));
        } else {
            // Existing shift
            setFormData(prev => ({
                ...prev,
                maCaKham: slotData.id,
                ngayDatLich: new Date(slotData.date).toISOString().split('T')[0]
            }));
        }
    };

    if (loading && patients.length === 0) {
        return (
            <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Tạo lịch khám mới</h4>
                    <p className="text-muted mb-0">Đặt lịch khám cho bệnh nhân</p>
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/le-tan/appointments')}
                >
                    <i className="icofont-arrow-left me-2"></i>Quay lại
                </button>
            </div>

            {/* Pending Doctor Assignments Section */}
            {pendingAppointments.length > 0 && (
                <div className="card mb-4 border-warning">
                    <div className="card-header bg-warning bg-opacity-10">
                        <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 text-warning">
                                <i className="icofont-doctor me-2"></i>
                                Lịch khám chờ phân công bác sĩ ({pendingAppointments.length})
                            </h6>
                            <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={fetchPendingAppointments}
                            >
                                <i className="icofont-refresh me-1"></i>Làm mới
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="alert alert-info mb-3">
                            <i className="icofont-info-circle me-2"></i>
                            Các bệnh nhân đã đặt lịch khám nhưng chưa có bác sĩ phụ trách. Vui lòng phân công bác sĩ phù hợp.
                        </div>
                        <div className="row g-3">
                            {pendingAppointments.map((appointment) => (
                                <div key={appointment.maLichKham} className="col-md-6 col-lg-4">
                                    <div className="card border-warning h-100">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h6 className="card-title text-primary mb-0">
                                                        {appointment.tenBenhNhan}
                                                    </h6>
                                                    <small className="text-muted">
                                                        {appointment.gioiTinh} • {calculateAge(appointment.ngaySinh)} tuổi
                                                    </small>
                                                </div>
                                                <span className="badge bg-warning text-dark">
                                                    {appointment.trangThai}
                                                </span>
                                            </div>

                                            <div className="mb-2">
                                                <small className="text-muted">Ngày khám:</small>
                                                <div className="fw-bold">
                                                    {new Date(appointment.ngayKham).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <small className="text-muted">Thời gian:</small>
                                                <div className="fw-bold text-success">
                                                    {formatTime(appointment.gioBatDau)} - {formatTime(appointment.gioKetThuc)}
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <small className="text-muted">Liên hệ:</small>
                                                <div className="small">
                                                    <i className="icofont-phone me-1"></i>{appointment.soDienThoai}
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <small className="text-muted">Triệu chứng:</small>
                                                <div className="small text-break">
                                                    {appointment.trieuChung}
                                                </div>
                                            </div>

                                            <button
                                                className="btn btn-warning btn-sm w-100"
                                                onClick={() => {
                                                    // Convert appointment to shift format for the modal
                                                    const shiftData = {
                                                        maCaKham: appointment.maCaKham,
                                                        ngayKham: appointment.ngayKham,
                                                        gioBatDau: appointment.gioBatDau,
                                                        gioKetThuc: appointment.gioKetThuc,
                                                        moTa: appointment.moTa,
                                                        maNhaSi: appointment.maNhaSi,
                                                        isPendingAssignment: true
                                                    };
                                                    handleOpenAssignModal(shiftData);
                                                }}
                                            >
                                                <i className="icofont-doctor me-1"></i>
                                                Phân công bác sĩ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="row">
                {/* Main Form */}
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">
                                <i className="icofont-calendar me-2"></i>Thông tin lịch khám
                            </h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {/* Patient Selection */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h6 className="text-primary mb-3">
                                            <i className="icofont-patient-bed me-2"></i>Thông tin bệnh nhân
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-8">
                                                <label className="form-label">Bệnh nhân *</label>
                                                <div className="position-relative">
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.maBenhNhan ? 'is-invalid' : ''}`}
                                                        placeholder="Tìm kiếm bệnh nhân theo tên hoặc số điện thoại..."
                                                        value={patientSearch}
                                                        onChange={(e) => setPatientSearch(e.target.value)}
                                                        onFocus={() => setPatientSearch('')}
                                                    />
                                                    {patientSearch && (
                                                        <div className="dropdown-menu show w-100" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                            {patients
                                                                .filter(patient =>
                                                                    patient.hoTen.toLowerCase().includes(patientSearch.toLowerCase()) ||
                                                                    patient.soDienThoai.includes(patientSearch)
                                                                )
                                                                .map(patient => (
                                                                    <button
                                                                        key={patient.maNguoiDung}
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => {
                                                                            handleInputChange('maBenhNhan', patient.maNguoiDung);
                                                                            setPatientSearch(`${patient.hoTen} - ${patient.soDienThoai}`);
                                                                        }}
                                                                    >
                                                                        <div>
                                                                            <strong>{patient.hoTen}</strong>
                                                                            <br />
                                                                            <small className="text-muted">{patient.soDienThoai} • {patient.gioiTinh}</small>
                                                                        </div>
                                                                    </button>
                                                                ))
                                                            }
                                                            {patients.filter(patient =>
                                                                patient.hoTen.toLowerCase().includes(patientSearch.toLowerCase()) ||
                                                                patient.soDienThoai.includes(patientSearch)
                                                            ).length === 0 && (
                                                                    <div className="dropdown-item-text text-muted">
                                                                        Không tìm thấy bệnh nhân
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )}
                                                    <select
                                                        className={`form-select mt-2 ${errors.maBenhNhan ? 'is-invalid' : ''}`}
                                                        value={formData.maBenhNhan}
                                                        onChange={(e) => {
                                                            const selectedPatient = patients.find(p => p.maNguoiDung === parseInt(e.target.value));
                                                            if (selectedPatient) {
                                                                setPatientSearch(`${selectedPatient.hoTen} - ${selectedPatient.soDienThoai}`);
                                                            }
                                                            handleInputChange('maBenhNhan', parseInt(e.target.value));
                                                        }}
                                                    >
                                                        <option value={0}>Hoặc chọn từ danh sách</option>
                                                        {patients.map(patient => (
                                                            <option key={patient.maNguoiDung} value={patient.maNguoiDung}>
                                                                {patient.hoTen} - {patient.soDienThoai}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {errors.maBenhNhan && <div className="invalid-feedback">{errors.maBenhNhan}</div>}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Thao tác</label>
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm me-2"
                                                        onClick={() => navigate('/le-tan/patients')}
                                                    >
                                                        <i className="icofont-plus me-1"></i>Thêm BN mới
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Patient Info Display */}
                                        {getSelectedPatient() && (
                                            <div className="alert alert-info mt-3">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <small className="text-muted">Họ tên:</small>
                                                        <div className="fw-bold">{getSelectedPatient()?.hoTen}</div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <small className="text-muted">Tuổi:</small>
                                                        <div className="fw-bold">{calculateAge(getSelectedPatient()?.ngaySinh || '')}</div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <small className="text-muted">Giới tính:</small>
                                                        <div className="fw-bold">{getSelectedPatient()?.gioiTinh}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Date and Filter Selection - Improved UX */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h6 className="text-primary mb-3">
                                            <i className="icofont-calendar me-2"></i>Chọn thời gian khám
                                        </h6>

                                        {/* Step 1: Date Selection */}
                                        <div className="card mb-3">
                                            <div className="card-body">
                                                <div className="row align-items-center">
                                                    <div className="col-md-4">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <div style={{
                                                                width: '30px',
                                                                height: '30px',
                                                                backgroundColor: '#007bff',
                                                                color: 'white',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: 'bold',
                                                                fontSize: '14px'
                                                            }}>1</div>
                                                            <label className="form-label mb-0 ms-2">Chọn ngày khám *</label>
                                                        </div>
                                                        <input
                                                            type="date"
                                                            className={`form-control ${errors.ngayDatLich ? 'is-invalid' : ''}`}
                                                            value={selectedDate}
                                                            onChange={(e) => handleDateChange(e.target.value)}
                                                            min={new Date().toISOString().split('T')[0]}
                                                        />
                                                        {errors.ngayDatLich && <div className="invalid-feedback">{errors.ngayDatLich}</div>}
                                                    </div>
                                                    <div className="col-md-8">
                                                        <div className="alert alert-light mb-0">
                                                            <i className="icofont-calendar me-2"></i>
                                                            <strong>Ngày đã chọn:</strong> {new Date(selectedDate).toLocaleDateString('vi-VN', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 2: Filter Options */}
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        backgroundColor: '#6c757d',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px'
                                                    }}>2</div>
                                                    <label className="form-label mb-0 ms-2">Lọc ca khám (tùy chọn)</label>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label className="form-label small text-muted">Theo phòng khám</label>
                                                        <select
                                                            className="form-select"
                                                            value={selectedClinic}
                                                            onChange={(e) => setSelectedClinic(parseInt(e.target.value))}
                                                        >
                                                            <option value={0}>-- Tất cả phòng khám --</option>
                                                            {clinics.map(clinic => (
                                                                <option key={clinic.maPhongKham} value={clinic.maPhongKham}>
                                                                    {clinic.tenPhongKham}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label small text-muted">Theo bác sĩ</label>
                                                        <select
                                                            className="form-select"
                                                            value={selectedDoctor}
                                                            onChange={(e) => setSelectedDoctor(e.target.value)}
                                                            disabled={!selectedClinic && doctors.length > 10}
                                                        >
                                                            <option value="">-- Tất cả bác sĩ --</option>
                                                            {doctors
                                                                .filter(doc => !selectedClinic || doc.bacsiData?.maPhongKham === selectedClinic)
                                                                .map(doctor => (
                                                                    <option key={doctor.maNguoiDung} value={doctor.bacsiData?.maNhaSi}>
                                                                        {doctor.hoTen}
                                                                    </option>
                                                                ))
                                                            }
                                                        </select>
                                                        {!selectedClinic && doctors.length > 10 && (
                                                            <small className="text-muted">Vui lòng chọn phòng khám trước</small>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                {/* Schedule Selection Mode */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        backgroundColor: '#28a745',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px'
                                                    }}>3</div>
                                                    <label className="form-label mb-0 ms-2">Chọn phương thức đặt lịch</label>
                                                </div>
                                                <div className="btn-group w-100 mb-3" role="group">
                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        name="scheduleMode"
                                                        id="existingShifts"
                                                        checked={!useEmptySchedule}
                                                        onChange={() => {
                                                            setUseEmptySchedule(false);
                                                            setSelectedSlot(null);
                                                            setFormData(prev => ({ ...prev, maCaKham: 0 }));
                                                        }}
                                                    />
                                                    <label className="btn btn-outline-primary" htmlFor="existingShifts">
                                                        <i className="icofont-calendar me-2"></i>Ca khám có sẵn
                                                    </label>

                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        name="scheduleMode"
                                                        id="emptySchedule"
                                                        checked={useEmptySchedule}
                                                        onChange={() => {
                                                            setUseEmptySchedule(true);
                                                            setSelectedSlot(null);
                                                            setFormData(prev => ({ ...prev, maCaKham: 0 }));
                                                        }}
                                                    />
                                                    <label className="btn btn-outline-success" htmlFor="emptySchedule">
                                                        <i className="icofont-plus me-2"></i>Khung giờ linh hoạt
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Available Shifts or Empty Schedule */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        {!useEmptySchedule ? (
                                            <>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="text-primary mb-0">Ca khám có sẵn *</h6>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-success"
                                                        onClick={() => setShowCreateShiftModal(true)}
                                                    >
                                                        <i className="icofont-plus me-1"></i>Tạo ca khám mới
                                                    </button>
                                                </div>

                                                {availableShifts.length > 0 ? (
                                                    <div className="row g-3">
                                                        {availableShifts.map(shift => (
                                                            <div key={shift.maCaKham} className="col-md-6 col-lg-4">
                                                                <div className={`card h-100 cursor-pointer ${formData.maCaKham === shift.maCaKham ? 'border-primary bg-light' : shift.isPendingAssignment ? 'border-warning' : 'border-light'}`}>
                                                                    <div className="card-body p-3">
                                                                        <div className="form-check">
                                                                            <input
                                                                                className="form-check-input"
                                                                                type="radio"
                                                                                name="shift"
                                                                                id={`shift-${shift.maCaKham}`}
                                                                                value={shift.maCaKham}
                                                                                checked={formData.maCaKham === shift.maCaKham}
                                                                                onChange={(e) => handleInputChange('maCaKham', parseInt(e.target.value))}
                                                                            />
                                                                            <label className="form-check-label w-100" htmlFor={`shift-${shift.maCaKham}`}>
                                                                                <div className="d-flex justify-content-between align-items-start">
                                                                                    <div>
                                                                                        <div className="fw-bold text-primary">
                                                                                            {formatTime(shift.gioBatDau)} - {formatTime(shift.gioKetThuc)}
                                                                                        </div>
                                                                                        <div className="small text-muted">
                                                                                            {new Date(shift.ngayKham).toLocaleDateString('vi-VN')}
                                                                                        </div>
                                                                                    </div>
                                                                                    {shift.isPendingAssignment && (
                                                                                        <span className="badge bg-warning text-dark">
                                                                                            <i className="icofont-clock-time me-1"></i>Chờ BS
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className={`small ${shift.isPendingAssignment ? 'text-warning' : 'text-muted'}`}>
                                                                                    <i className="icofont-doctor me-1"></i>
                                                                                    {shift.tenNhaSi}
                                                                                </div>
                                                                                {shift.isPendingAssignment && (
                                                                                    <div className="small text-info mt-1">
                                                                                        <i className="icofont-info-circle me-1"></i>
                                                                                        Bệnh nhân đã đăng ký khung giờ này
                                                                                    </div>
                                                                                )}
                                                                                {shift.isPendingAssignment && (
                                                                                    <div className="mt-2">
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-sm btn-outline-primary"
                                                                                            onClick={(e) => {
                                                                                                e.preventDefault();
                                                                                                e.stopPropagation();
                                                                                                handleOpenAssignModal(shift);
                                                                                            }}
                                                                                        >
                                                                                            <i className="icofont-doctor me-1"></i>Phân công BS
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                                {shift.moTa && (
                                                                                    <div className="small text-muted mt-1">
                                                                                        {shift.moTa}
                                                                                    </div>
                                                                                )}
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-5 text-muted">
                                                        <i className="icofont-clock-time fs-1"></i>
                                                        <p className="mt-2">Không có ca khám nào cho ngày này</p>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary"
                                                            onClick={() => setShowCreateShiftModal(true)}
                                                        >
                                                            <i className="icofont-plus me-2"></i>Tạo ca khám mới
                                                        </button>
                                                    </div>
                                                )}
                                                {errors.maCaKham && <div className="text-danger mt-2">{errors.maCaKham}</div>}
                                            </>
                                        ) : (
                                            <>
                                                <h6 className="text-success mb-3">Khung giờ linh hoạt</h6>
                                                <div className="alert alert-info">
                                                    <i className="icofont-info-circle me-2"></i>
                                                    Chọn khung giờ mong muốn. Hệ thống sẽ tự động tạo ca khám mới và phân công bác sĩ phù hợp.
                                                </div>
                                                <EmptySchedule
                                                    onSlotSelect={handleSlotSelect}
                                                    selectedDoctor={selectedDoctor}
                                                    selectedPhongKham={selectedClinic.toString()}
                                                />
                                                {selectedSlot && (
                                                    <div className="mt-3 p-3 bg-light rounded">
                                                        <h6 className="text-success">
                                                            <i className="icofont-check-circled me-2"></i>Đã chọn khung giờ
                                                        </h6>
                                                        <p className="mb-0">
                                                            <strong>{selectedSlot.start} - {selectedSlot.end}</strong>
                                                            {selectedSlot.isDefault && (
                                                                <span className="badge bg-success ms-2">Khung giờ mới</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Symptom Description */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h6 className="text-primary mb-3">
                                            <i className="icofont-prescription me-2"></i>Thông tin khám
                                        </h6>
                                        <div className="mb-3">
                                            <label className="form-label">Triệu chứng *</label>
                                            <textarea
                                                className={`form-control ${errors.trieuChung ? 'is-invalid' : ''}`}
                                                rows={4}
                                                value={formData.trieuChung}
                                                onChange={(e) => handleInputChange('trieuChung', e.target.value)}
                                                placeholder="Mô tả triệu chứng và lý do khám..."
                                            />
                                            {errors.trieuChung && <div className="invalid-feedback">{errors.trieuChung}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Trạng thái</label>
                                            <select
                                                className="form-select"
                                                value={formData.trangThai}
                                                onChange={(e) => handleInputChange('trangThai', e.target.value)}
                                            >
                                                {statusOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="d-flex gap-3">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <i className="icofont-calendar me-2"></i>Tạo lịch khám
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/le-tan/appointments')}
                                        disabled={loading}
                                    >
                                        Hủy bỏ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">
                                <i className="icofont-eye me-2"></i>Xem trước lịch khám
                            </h6>
                        </div>
                        <div className="card-body">
                            {getSelectedPatient() ? (
                                <div className="mb-3">
                                    <small className="text-muted">Bệnh nhân</small>
                                    <div className="fw-bold">{getSelectedPatient()?.hoTen}</div>
                                    <div className="small text-muted">
                                        {getSelectedPatient()?.soDienThoai} • {getSelectedPatient()?.gioiTinh}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted mb-3">
                                    <i className="icofont-patient-bed me-2"></i>Chưa chọn bệnh nhân
                                </div>
                            )}

                            {formData.ngayDatLich ? (
                                <div className="mb-3">
                                    <small className="text-muted">Ngày khám</small>
                                    <div className="fw-bold">
                                        {new Date(formData.ngayDatLich).toLocaleDateString('vi-VN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <div className="small text-info">
                                        <i className="icofont-calendar me-1"></i>
                                        Ngày khám thực tế từ ca đã chọn
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted mb-3">
                                    <i className="icofont-calendar me-2"></i>Chưa chọn ngày
                                </div>
                            )}

                            {(getSelectedShift() || selectedSlot) ? (
                                <div className="mb-3">
                                    <small className="text-muted">Thời gian</small>
                                    <div className="fw-bold">
                                        {selectedSlot ?
                                            `${selectedSlot.start} - ${selectedSlot.end}` :
                                            `${formatTime(getSelectedShift()?.gioBatDau || '')} - ${formatTime(getSelectedShift()?.gioKetThuc || '')}`
                                        }
                                    </div>
                                    <div className="small text-muted">
                                        <i className="icofont-doctor me-1"></i>
                                        {selectedSlot?.isDefault ?
                                            'Sẽ phân công bác sĩ sau' :
                                            getSelectedShift()?.tenNhaSi
                                        }
                                    </div>
                                    {selectedSlot?.isDefault && (
                                        <div className="small text-success">
                                            <i className="icofont-plus me-1"></i>Khung giờ mới
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-muted mb-3">
                                    <i className="icofont-clock-time me-2"></i>
                                    {useEmptySchedule ? 'Chưa chọn khung giờ' : 'Chưa chọn ca khám'}
                                </div>
                            )}

                            {formData.trieuChung && (
                                <div className="mb-3">
                                    <small className="text-muted">Triệu chứng</small>
                                    <div className="text-break">{formData.trieuChung}</div>
                                </div>
                            )}

                            <div className="mb-3">
                                <small className="text-muted">Trạng thái</small>
                                <div>
                                    <span className={`badge bg-${statusOptions.find(opt => opt.value === formData.trangThai)?.color}`}>
                                        {statusOptions.find(opt => opt.value === formData.trangThai)?.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Doctor Modal */}
            {showAssignDoctorModal && selectedShiftForAssignment && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="icofont-doctor me-2"></i>Phân công bác sĩ
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAssignDoctorModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info">
                                    <i className="icofont-info-circle me-2"></i>
                                    {selectedShiftForAssignment?.isPendingAssignment ?
                                        'Bệnh nhân đã đặt lịch khám cho khung giờ này. Vui lòng phân công bác sĩ phù hợp.' :
                                        'Bạn có thể phân công bác sĩ hoặc điều chỉnh thời gian nếu cần.'
                                    }
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Khung giờ hiện tại</label>
                                    <div className="form-control-plaintext bg-light p-2 rounded">
                                        {formatTime(selectedShiftForAssignment.gioBatDau)} - {formatTime(selectedShiftForAssignment.gioKetThuc)}
                                        <br />
                                        <small className="text-muted">Ngày: {new Date(selectedShiftForAssignment.ngayKham).toLocaleDateString('vi-VN')}</small>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Bác sĩ phụ trách *</label>
                                    <select
                                        className="form-select"
                                        value={assignDoctorForm.maNhaSi}
                                        onChange={(e) => setAssignDoctorForm({ ...assignDoctorForm, maNhaSi: e.target.value })}
                                    >
                                        <option value="">-- Chọn bác sĩ --</option>
                                        {getAvailableDoctors().map(doctor => (
                                            <option key={doctor.maNguoiDung} value={doctor.bacsiData?.maNhaSi}>
                                                {doctor.hoTen}
                                                {selectedClinic && (
                                                    <span> - {clinics.find(c => c.maPhongKham === doctor.bacsiData?.maPhongKham)?.tenPhongKham}</span>
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Điều chỉnh thời gian (tùy chọn)</label>
                                    <div className="row">
                                        <div className="col-6">
                                            <label className="form-label small">Giờ bắt đầu</label>
                                            <select
                                                className="form-select"
                                                value={assignDoctorForm.gioBatDau}
                                                onChange={(e) => setAssignDoctorForm({ ...assignDoctorForm, gioBatDau: e.target.value })}
                                            >
                                                {timeSlots.map(slot => (
                                                    <option key={slot.start} value={slot.start}>
                                                        {slot.start} ({slot.label})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small">Giờ kết thúc</label>
                                            <select
                                                className="form-select"
                                                value={assignDoctorForm.gioKetThuc}
                                                onChange={(e) => setAssignDoctorForm({ ...assignDoctorForm, gioKetThuc: e.target.value })}
                                            >
                                                {timeSlots.map(slot => (
                                                    <option key={slot.end} value={slot.end}>
                                                        {slot.end}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Ghi chú</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={assignDoctorForm.moTa}
                                        onChange={(e) => setAssignDoctorForm({ ...assignDoctorForm, moTa: e.target.value })}
                                        placeholder="Ghi chú về ca khám (tùy chọn)..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAssignDoctorModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAssignDoctor}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Đang phân công...
                                        </>
                                    ) : (
                                        <>
                                            <i className="icofont-check me-2"></i>Phân công bác sĩ
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create New Shift Modal */}
            {showCreateShiftModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="icofont-plus me-2"></i>Tạo ca khám mới
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCreateShiftModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Ngày khám</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={selectedDate}
                                        disabled
                                    />
                                </div>

                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label">Giờ bắt đầu *</label>
                                        <select
                                            className="form-select"
                                            value={newShiftForm.gioBatDau}
                                            onChange={(e) => setNewShiftForm({ ...newShiftForm, gioBatDau: e.target.value })}
                                        >
                                            <option value="">-- Chọn giờ --</option>
                                            {timeSlots.map(slot => (
                                                <option key={slot.start} value={slot.start}>
                                                    {slot.start} ({slot.label})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">Giờ kết thúc *</label>
                                        <select
                                            className="form-select"
                                            value={newShiftForm.gioKetThuc}
                                            onChange={(e) => setNewShiftForm({ ...newShiftForm, gioKetThuc: e.target.value })}
                                        >
                                            <option value="">-- Chọn giờ --</option>
                                            {timeSlots.map(slot => (
                                                <option key={slot.end} value={slot.end}>
                                                    {slot.end}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Bác sĩ *</label>
                                    <select
                                        className="form-select"
                                        value={newShiftForm.maNhaSi}
                                        onChange={(e) => setNewShiftForm({ ...newShiftForm, maNhaSi: e.target.value })}
                                    >
                                        <option value="">-- Chọn bác sĩ --</option>
                                        {getAvailableDoctors().map(doctor => (
                                            <option key={doctor.maNguoiDung} value={doctor.bacsiData?.maNhaSi}>
                                                {doctor.hoTen}
                                                {selectedClinic && (
                                                    <span> - {clinics.find(c => c.maPhongKham === doctor.bacsiData?.maPhongKham)?.tenPhongKham}</span>
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Ghi chú</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={newShiftForm.moTa}
                                        onChange={(e) => setNewShiftForm({ ...newShiftForm, moTa: e.target.value })}
                                        placeholder="Ghi chú về ca khám (tùy chọn)..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateShiftModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleCreateShift}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Đang tạo...
                                        </>
                                    ) : (
                                        <>
                                            <i className="icofont-check me-2"></i>Tạo ca khám
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateAppointment; 