import { useRef, useState } from 'react';
import { useCloudinaryUpload } from '@/hooks';
import { useToast } from '@/hooks/use-toast.hook';
import {
  CLOUDINARY_IMAGE_REQUIREMENT_TEXT,
  validateCloudinaryImageFile,
} from '@/utils';

interface AvatarUploadProps {
  value: string;
  onChange: (url: string) => void;
  isEditMode: boolean;
  name?: string;
}

function AvatarUpload({ value, onChange, isEditMode, name = '' }: AvatarUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, loading: isUploading } = useCloudinaryUpload();
  const { error: showError } = useToast();

  const handleFile = async (file: File) => {
    try {
      validateCloudinaryImageFile(file);
    } catch {
      showError(CLOUDINARY_IMAGE_REQUIREMENT_TEXT);
      return;
    }
    try {
      const url = await upload(file);
      if (url) onChange(url);
    } catch {
      showError('Tải ảnh lên thất bại, vui lòng thử lại.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isEditMode) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm">
          {isUploading ? (
            <span className="material-symbols-outlined text-primary text-[32px] animate-spin">progress_activity</span>
          ) : value ? (
            <img src={value} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[32px] text-gray-300">person</span>
          )}
        </div>
        {isEditMode && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="cursor-pointer absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-[#6c4830] transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
        )}
      </div>

      {/* Drop zone */}
      {isEditMode && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer w-full rounded-xl border-2 border-dashed px-4 py-5 flex flex-col items-center gap-2 transition-all ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-primary hover:bg-primary/5'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <span className="material-symbols-outlined text-[28px] text-gray-400">cloud_upload</span>
          <p className="text-xs text-gray-500 text-center">
            Kéo thả hoặc <span className="text-primary font-semibold">chọn file</span>
          </p>
          <p className="text-[10px] text-gray-400">PNG, JPG, WEBP</p>
        </div>
      )}

      {isEditMode && (
        <p className="text-[10px] text-gray-400 text-center">
          {CLOUDINARY_IMAGE_REQUIREMENT_TEXT}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Current URL display when not in edit mode */}
      {!isEditMode && value && (
        <p className="text-[10px] text-gray-400 text-center truncate max-w-full px-2">
          {value}
        </p>
      )}
    </div>
  );
}

export default AvatarUpload;
