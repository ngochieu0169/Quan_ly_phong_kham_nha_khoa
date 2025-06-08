import React, { useState, useRef } from 'react';

interface FileUploadProps {
    accept?: string;
    onChange: (file: File | null) => void;
    preview?: string | null;
    className?: string;
    label?: string;
    error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    accept = 'image/*',
    onChange,
    preview,
    className = '',
    label = 'Chọn file',
    error
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File không được vượt quá 5MB');
                return;
            }

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            }

            onChange(file);
        } else {
            setPreviewUrl(null);
            onChange(null);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`file-upload-wrapper ${className}`}>
            <div className="mb-2">
                <label className="form-label">{label}</label>
            </div>

            {previewUrl ? (
                <div className="preview-container position-relative">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                    <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                        onClick={handleRemove}
                        style={{ margin: '5px' }}
                    >
                        <i className="icofont-close"></i>
                    </button>
                </div>
            ) : (
                <div className="upload-area">
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="form-control"
                        accept={accept}
                        onChange={handleFileChange}
                    />
                </div>
            )}

            {error && (
                <div className="text-danger small mt-1">{error}</div>
            )}
        </div>
    );
};

export default FileUpload; 