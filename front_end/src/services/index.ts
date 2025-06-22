// API Services
import { requestAPI as axios } from '../axiosconfig';
import Resource from './Resource';

// Base API endpoints
export const userService = new Resource({ service: axios, path: '/api/users' });
export const clinicService = new Resource({ service: axios, path: '/api/phongkham' });
export const serviceService = new Resource({ service: axios, path: '/api/dichvu' });
export const serviceTypeService = new Resource({ service: axios, path: '/api/loaidichvu' });
export const invoiceService = new Resource({ service: axios, path: '/api/hoadon' });
export const appointmentService = new Resource({ service: axios, path: '/api/lichkham' });
export const shiftService = new Resource({ service: axios, path: '/api/cakham' });
export const dentistService = new Resource({ service: axios, path: '/api/nhasi' });
export const notificationService = new Resource({ service: axios, path: '/api/thongbao' });
export const medicalRecordService = new Resource({ service: axios, path: '/api/phieukham' });

// Custom API calls
export const authService = {
    login: (data: { tenTaiKhoan: string; matKhau: string }) =>
        axios.post('/api/users/login', data),
    register: (data: FormData) =>
        axios.post('/api/users/register', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    updateAccount: (tenTaiKhoan: string, data: { matKhau: string; maQuyen: number }) =>
        axios.put(`/api/users/account/${tenTaiKhoan}`, data)
};

export const userServiceExtended = {
    ...userService,
    getFullList: (params?: { maQuyen?: number; maPhongKham?: number }) =>
        axios.get('/api/users/full', { params }),
    updateUser: (id: number, data: FormData) =>
        axios.put(`/api/users/edit/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    deleteUser: (id: number) =>
        axios.delete(`/api/users/delete/${id}`)
};

export const appointmentServiceExtended = {
    ...appointmentService,
    confirmBooking: (id: number, trangThai: string) =>
        axios.put(`/api/lichkham/${id}`, { trangThai }),
    getByDoctor: (maNhaSi: string, params?: { startDate?: string; endDate?: string }) =>
        axios.get(`/api/lichkham/doctor/${maNhaSi}`, { params }),
    getPatientsByDoctor: (maNhaSi: string) =>
        axios.get(`/api/lichkham/doctor/${maNhaSi}/patients`)
};

export const shiftServiceExtended = {
    ...shiftService,
    getEmptySlots: (date: string) =>
        axios.get('/api/cakham/lich-trong', { params: { date } }),
    getByDoctor: (maNhaSi: string, params?: { startDate?: string; endDate?: string }) =>
        axios.get(`/api/cakham/doctor/${maNhaSi}`, { params })
};

export const invoiceServiceExtended = {
    ...invoiceService,
    getByPatientAndDoctor: (maBenhNhan: number, maNhaSi: string) =>
        axios.get(`/api/hoadon/patient/${maBenhNhan}/doctor/${maNhaSi}`),
    createWithDetails: (data: any) =>
        axios.post('/api/hoadon/with-details', data),
    getDetailWithServices: (id: number) =>
        axios.get(`/api/hoadon/${id}/details`)
};

export const clinicServiceExtended = {
    ...clinicService,
    getByOwner: (ownerUsername: string) =>
        axios.get(`/api/phongkham/owner/${ownerUsername}`),
    getRevenue: (clinicId: number, params?: { startDate?: string; endDate?: string }) =>
        axios.get(`/api/phongkham/${clinicId}/revenue`, { params }),
    getStats: (clinicId: number) =>
        axios.get(`/api/phongkham/${clinicId}/stats`)
};

export const dentistServiceExtended = {
    ...dentistService,
    getByClinic: (clinicId: number) =>
        axios.get(`/api/nhasi/phongkham/${clinicId}`),
    createWithAccount: (data: any) =>
        axios.post('/api/nhasi/with-account', data)
}; 