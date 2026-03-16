import { useFormContext } from 'react-hook-form';
import AvatarUpload from './AvatarUpload';
import type { EditProfileFormValues } from '../../schemas/client-edit-profile.schema';

interface ProfileTabContentProps {
  isEditMode: boolean;
  email: string;
  createdAt: string;
}

export function ProfileTabContent({ isEditMode, email, createdAt }: ProfileTabContentProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<EditProfileFormValues>();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* ── Left Column: Personal Details ── */}
      <div className="lg:col-span-7">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            <h3 className="text-lg font-bold text-gray-800">Thông tin cá nhân</h3>
          </div>

          {/* Profile error banner */}
          {errors.root?.message && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">error</span>
              <p className="text-sm text-red-700">{errors.root.message}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  person
                </span>
                <input
                  type="text"
                  {...register('name')}
                  disabled={!isEditMode}
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>
              )}
            </div>

            {/* Email (always read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Địa chỉ Email{' '}
                <span className="text-gray-400 font-normal lowercase">(không thể thay đổi)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-gray-100 border border-gray-200 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Số điện thoại{' '}
                <span className="text-gray-400 font-normal lowercase">(tùy chọn)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  phone
                </span>
                <input
                  type="tel"
                  {...register('phone')}
                  disabled={!isEditMode}
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  placeholder="+84 xxx xxx xxxx"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-0.5">{errors.phone.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Địa chỉ{' '}
                <span className="text-gray-400 font-normal lowercase">(tùy chọn)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  location_on
                </span>
                <input
                  type="text"
                  {...register('address')}
                  disabled={!isEditMode}
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  placeholder="123 Đường, Thành phố"
                />
              </div>
              {errors.address && (
                <p className="text-xs text-red-500 mt-0.5">{errors.address.message}</p>
              )}
            </div>

            {/* Member Since (always read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Thành viên từ
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  calendar_today
                </span>
                <input
                  type="text"
                  value={createdAt}
                  disabled
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-gray-100 border border-gray-200 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Right Column: Avatar ── */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <section className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h4 className="text-sm font-bold text-gray-800 mb-4">Ảnh đại diện</h4>
          <AvatarUpload
            value={watch('avatar_url') ?? ''}
            onChange={(url) => setValue('avatar_url', url, { shouldDirty: true })}
            isEditMode={isEditMode}
            name={watch('name')}
          />
        </section>
      </div>
    </div>
  );
}
