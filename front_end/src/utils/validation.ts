// Form validation utilities

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    email?: boolean;
    phone?: boolean;
    date?: boolean;
    custom?: (value: any) => string | null;
}

export interface ValidationSchema {
    [field: string]: ValidationRule;
}

export interface ValidationErrors {
    [field: string]: string;
}

export const validateField = (value: any, rules: ValidationRule): string | null => {
    if (rules.required && (!value || value.toString().trim() === '')) {
        return 'Trường này là bắt buộc';
    }

    if (value && rules.minLength && value.toString().length < rules.minLength) {
        return `Tối thiểu ${rules.minLength} ký tự`;
    }

    if (value && rules.maxLength && value.toString().length > rules.maxLength) {
        return `Tối đa ${rules.maxLength} ký tự`;
    }

    if (value && rules.pattern && !rules.pattern.test(value.toString())) {
        return 'Định dạng không hợp lệ';
    }

    if (value && rules.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value.toString())) {
            return 'Email không hợp lệ';
        }
    }

    if (value && rules.phone) {
        const phonePattern = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!phonePattern.test(value.toString())) {
            return 'Số điện thoại không hợp lệ';
        }
    }

    if (value && rules.date) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return 'Ngày không hợp lệ';
        }
    }

    if (rules.custom) {
        return rules.custom(value);
    }

    return null;
};

export const validateForm = (data: any, schema: ValidationSchema): ValidationErrors => {
    const errors: ValidationErrors = {};

    Object.keys(schema).forEach(field => {
        const error = validateField(data[field], schema[field]);
        if (error) {
            errors[field] = error;
        }
    });

    return errors;
};

// Common validation schemas
export const userValidationSchema: ValidationSchema = {
    tenTaiKhoan: {
        required: true,
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_]+$/
    },
    matKhau: {
        required: true,
        minLength: 6
    },
    hoTen: {
        required: true,
        minLength: 2,
        maxLength: 50
    },
    eMail: {
        required: true,
        email: true
    },
    soDienThoai: {
        required: true,
        phone: true
    },
    ngaySinh: {
        required: true,
        date: true,
        custom: (value) => {
            const date = new Date(value);
            const now = new Date();
            if (date > now) {
                return 'Ngày sinh không thể trong tương lai';
            }
            return null;
        }
    }
};

export const clinicValidationSchema: ValidationSchema = {
    tenPhongKham: {
        required: true,
        minLength: 3,
        maxLength: 50
    },
    diaChi: {
        required: true,
        minLength: 10,
        maxLength: 200
    },
    soDienThoai: {
        required: true,
        phone: true
    },
    gioLamViec: {
        required: true
    }
};

export const serviceValidationSchema: ValidationSchema = {
    tenDichVu: {
        required: true,
        minLength: 3,
        maxLength: 200
    },
    donGia: {
        required: true,
        custom: (value) => {
            const price = parseFloat(value);
            if (isNaN(price) || price < 0) {
                return 'Giá phải là số dương';
            }
            return null;
        }
    },
    maLoaiDichVu: {
        required: true
    }
};

export const appointmentValidationSchema: ValidationSchema = {
    trieuChung: {
        required: true,
        minLength: 10,
        maxLength: 255
    },
    maCaKham: {
        required: true
    },
    maBenhNhan: {
        required: true
    }
}; 