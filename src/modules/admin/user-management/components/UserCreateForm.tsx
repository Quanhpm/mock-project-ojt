import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useCreateUser } from '../hooks/useCreateUser.hook'
import type { RoleSelectItem } from '@/apis'
import { Eye, EyeOff, Upload, X } from 'lucide-react'
import axios from 'axios'
import { ENV } from '@/config/env.config'
import { useToast } from '@/hooks/use-toast.hook'

// ============================================================================
// YUP VALIDATION SCHEMA (Step 1)
// ============================================================================
interface Step1Values {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
}

const step1Schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Tên là bắt buộc')
    .min(5, 'Tên phải có ít nhất 5 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự')
    .matches(
      /^[a-zA-Z0-9. ]+$/,
      'Tên chỉ được chứa chữ thường, chữ hoa, số, dấu chấm và khoảng trắng',
    )
    .test('no-consecutive-dots', 'Không được chứa hai dấu chấm liên tiếp', (v) => !v || !v.includes('..'))
    .test('no-multiple-spaces', 'Không được chứa nhiều khoảng trắng liên tiếp', (v) => !v || !/ {2,}/.test(v))
    .test('no-edge-dot', 'Không được bắt đầu hoặc kết thúc bằng dấu chấm', (v) => !v || (!v.startsWith('.') && !v.endsWith('.')))
    .default(''),

  email: yup
    .string()
    .trim()
    .required('Email là bắt buộc')
    .min(6, 'Email phải có ít nhất 6 ký tự')
    .max(254, 'Email không được vượt quá 254 ký tự')
    .test('has-at', 'Email phải chứa ký tự @', (v) => !v || v.includes('@'))
    .test('single-at', 'Email chỉ được chứa đúng một ký tự @', (v) => !v || (v.match(/@/g) ?? []).length === 1)
    .test('local-not-empty', 'Phần trước @ không được để trống', (v) => {
      if (!v || !v.includes('@')) return true
      return (v.split('@')[0] ?? '').length > 0
    })
    .test('local-valid-chars', 'Phần trước @ chỉ được chứa chữ cái, số, dấu chấm, gạch dưới, dấu cộng hoặc dấu gạch ngang', (v) => {
      if (!v || !v.includes('@')) return true
      const local = v.split('@')[0] ?? ''
      return /^[a-zA-Z0-9._%+-]+$/.test(local)
    })
    .test('local-no-edge-dot', 'Phần trước @ không được bắt đầu hoặc kết thúc bằng dấu chấm', (v) => {
      if (!v || !v.includes('@')) return true
      const local = v.split('@')[0] ?? ''
      return !local.startsWith('.') && !local.endsWith('.')
    })
    .test('no-consecutive-dots', 'Email không được chứa hai dấu chấm liên tiếp', (v) => !v || !v.includes('..'))
    .test('domain-not-empty', 'Phần tên miền sau @ không được để trống', (v) => {
      if (!v || !v.includes('@')) return true
      const domain = v.split('@')[1] ?? ''
      return domain.length > 0
    })
    .test('domain-has-dot', 'Tên miền phải có ít nhất một dấu chấm (ví dụ: gmail.com)', (v) => {
      if (!v || !v.includes('@')) return true
      const domain = v.split('@')[1] ?? ''
      return domain.includes('.')
    })
    .test('domain-valid-chars', 'Tên miền chỉ được chứa chữ cái, số, dấu chấm hoặc dấu gạch ngang', (v) => {
      if (!v || !v.includes('@')) return true
      const domain = v.split('@')[1] ?? ''
      return /^[a-zA-Z0-9.-]+$/.test(domain)
    })
    .test('domain-no-edge-hyphen', 'Tên miền không được bắt đầu hoặc kết thúc bằng dấu gạch ngang', (v) => {
      if (!v || !v.includes('@')) return true
      const domain = v.split('@')[1] ?? ''
      const labels = domain.split('.')
      return labels.every((label) => !label.startsWith('-') && !label.endsWith('-'))
    })
    .test('tld-valid', 'Phần đuôi tên miền không hợp lệ — phải có ít nhất 2 chữ cái (ví dụ: .com, .vn, .org)', (v) => {
      if (!v || !v.includes('@')) return true
      const domain = v.split('@')[1] ?? ''
      if (!domain.includes('.')) return true
      const tld = domain.split('.').pop() ?? ''
      return tld.length >= 2 && /^[a-zA-Z]+$/.test(tld)
    }),

  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(100, 'Mật khẩu không được vượt quá 100 ký tự')
    .matches(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa (A–Z)')
    .matches(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường (a–z)')
    .matches(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số (0–9)')
    .matches(/[^a-zA-Z0-9]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@, #, $, ...)'),

  confirmPassword: yup
    .string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp'),

  phone: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .test(
      'only-valid-chars',
      'Số điện thoại chỉ được chứa chữ số và dấu + ở đầu',
      (v) => !v || /^[+0-9]+$/.test(v),
    )
    .min(10, 'Số điện thoại phải có ít nhất 10 ký tự')
    .max(13, 'Số điện thoại không được vượt quá 13 ký tự')
    .matches(
      /^(\+84|0)(3[2-9]|5[2689]|7[06-9]|8\d|9\d)\d{7}$/,
      'Số điện thoại không hợp lệ (ví dụ: 0912345678 hoặc +84912345678)',
    ),
})

export const UserCreateForm: React.FC = () => {
  const navigate = useNavigate()
  const { success: showSuccess, error: showError } = useToast()

  const {
    currentStep,
    isSubmitting,
    error,
    franchises,
    roles,
    isFranchisesLoading,
    isRolesLoading,
    handleCreateUser,
    handleAssignRole,
    goBackToStep1,
  } = useCreateUser(() => {
    navigate('/admin/users')
  })

  // ──────── Step 1 fields (react-hook-form) ────────
  const {
    register,
    handleSubmit: hookFormHandleSubmit,
    formState: { errors, isValid },
  } = useForm<Step1Values>({
    resolver: yupResolver(step1Schema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', phone: '' },
  })

  // ──────── Avatar (managed outside RHF) ────────
  const [avatarUrl, setAvatarUrl] = useState('')

  // ──────── Password visibility ────────
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ──────── Cloudinary Upload ────────
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('upload_preset', ENV.CLOUDINARY_UPLOAD_PRESET)
      uploadData.append('folder', 'users/avatars')

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${ENV.CLOUDINARY_CLOUD_NAME}/image/upload`,
        uploadData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      setAvatarUrl(response.data.secure_url)
      showSuccess('Tải ảnh lên thành công', 'Ảnh đại diện đã được tải lên.')
    } catch (err: any) {
      console.error('Avatar Upload Error:', err)
      showError('Upload thất bại', err.message || 'Không thể tải ảnh.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('File không hợp lệ', 'Vui lòng chọn file ảnh.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showError('File quá lớn', 'Kích thước tối đa 5MB.')
        return
      }
      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setAvatarUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ──────── Step 2 fields ────────
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [selectedFranchiseId, setSelectedFranchiseId] = useState('')

  // Tìm role hiện tại để check scope
  const selectedRole: RoleSelectItem | undefined = roles.find(
    (r) => r.value === selectedRoleId,
  )
  const isAdmin = selectedRole?.code === 'ADMIN'

  // Khi chọn ADMIN → reset franchise
  useEffect(() => {
    if (isAdmin) {
      setSelectedFranchiseId('')
    }
  }, [isAdmin])

  // Reset form khi quay lại step 1
  const handleBackStep1 = () => {
    goBackToStep1()
  }

  // Navigate back to user list
  const handleCancel = () => {
    navigate('/admin/users')
  }

  // ──────── Step 1 submit ────────
  const onSubmitStep1 = hookFormHandleSubmit(async (data) => {
    await handleCreateUser({ name: data.name, email: data.email, password: data.password, phone: data.phone, avatar_url: avatarUrl })
  })

  // ──────── Step 2 submit ────────
  const onSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    const franchiseId = isAdmin ? null : selectedFranchiseId || null
    await handleAssignRole(selectedRoleId, franchiseId)
  }

  // ──────── Validate ────────
  const isStep2Valid =
    selectedRoleId && (isAdmin || selectedFranchiseId)
return (
  <div className="min-h-screen  py-12 flex justify-center">

    <div className="w-full max-w-6xl">

      {/* HEADER */}
      <div className="text-center mb-10">

        <h1 className="text-3xl font-bold text-[#7F5539]">
          Create New User
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Expand your team by inviting a new member.
        </p>

      </div>

      {/* STEP INDICATOR */}
      <div className="flex items-center justify-center mb-10">

        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
            ${currentStep === 1
              ? "bg-[#7F5539] text-white"
              : "bg-[#9C6644] text-white"}`}
          >
            {currentStep > 1 ? "✓" : "1"}
          </div>

          <span className="text-sm font-medium text-slate-700">
            User Info
          </span>
        </div>

        <div
          className={`w-28 h-[3px] mx-4 rounded-full
          ${currentStep > 1 ? "bg-[#7F5539]" : "bg-slate-200"}`}
        />

        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
            ${currentStep === 2
              ? "bg-[#7F5539] text-white"
              : "bg-slate-200 text-slate-500"}`}
          >
            2
          </div>

          <span className="text-sm font-medium text-slate-500">
            Role Selection
          </span>
        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* STEP 1 */}
      {currentStep === 1 && (
        <form
          onSubmit={onSubmitStep1}
          noValidate
          className="bg-white rounded-2xl border border-[#E6CCB2] shadow-sm p-10"
        >

          <h2 className="text-lg font-semibold text-slate-800 mb-8">
            Personal Information
          </h2>

          {/* AVATAR */}
          <div className="flex justify-center mb-8">

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />

            {avatarUrl ? (
              <div className="relative">

                <img
                  src={avatarUrl}
                  className="w-24 h-24 rounded-full object-cover border"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-white border rounded-full p-1 shadow"
                >
                  <X size={14} />
                </button>

              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-[#DDB892] flex items-center justify-center cursor-pointer hover:border-[#B08968] transition"
              >
                <Upload size={20} className="text-[#B08968]" />
              </div>
            )}

          </div>

          {/* NAME */}
          <div className="mb-5">

            <label className="text-sm font-medium text-slate-700">
              Full Name
            </label>

            <input
              {...register('name')}
              className={`mt-2 w-full h-11 px-4 rounded-lg border ${errors.name ? 'border-red-400' : 'border-slate-200'} bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm`}
              placeholder="e.g. Alex Morgan"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}

          </div>

          {/* EMAIL */}
          <div className="mb-5">

            <label className="text-sm font-medium text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              {...register('email')}
              className={`mt-2 w-full h-11 px-4 rounded-lg border ${errors.email ? 'border-red-400' : 'border-slate-200'} bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm`}
              placeholder="alex.morgan@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}

          </div>

          {/* PASSWORD */}
          <div className="grid grid-cols-2 gap-5 mb-5">

            <div>

              <label className="text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full h-11 px-4 pr-10 rounded-lg border ${errors.password ? 'border-red-400' : 'border-slate-200'} bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}

            </div>

            <div>

              <label className="text-sm font-medium text-slate-700">
                Confirm Password
              </label>

              <div className="relative mt-2">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className={`w-full h-11 px-4 pr-10 rounded-lg border ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200'} bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}

            </div>

          </div>

          {/* PHONE */}
          <div className="mb-8">

            <label className="text-sm font-medium text-slate-700">
              Phone Number
            </label>

            <input
              {...register('phone')}
              className={`mt-2 w-full h-11 px-4 rounded-lg border ${errors.phone ? 'border-red-400' : 'border-slate-200'} bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm`}
              placeholder="e.g. 0912345678"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
            )}

          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center pt-6">

            <button
              type="button"
              onClick={handleCancel}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Next Step →"}
            </button>

          </div>

        </form>
      )}

      {/* STEP 2 */}
      {currentStep === 2 && (
        <form
          onSubmit={onSubmitStep2}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10"
        >

          <h2 className="text-lg font-semibold text-slate-800 mb-8">
            Role Selection
          </h2>

          {/* ROLE */}
          <div className="mb-6">

            <label className="text-sm font-medium text-slate-700">
              Role
            </label>

            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 text-sm"
            >
              <option value="">
                {isRolesLoading ? "Loading roles..." : "Select role"}
              </option>

              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.name}
                </option>
              ))}

            </select>

          </div>

          {/* FRANCHISE */}
          <div className="mb-8">

            <label className="text-sm font-medium text-slate-700">
              Franchise
            </label>

            <select
              value={selectedFranchiseId}
              onChange={(e) => setSelectedFranchiseId(e.target.value)}
              disabled={isAdmin}
              className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 text-sm"
            >
              <option value="">
                {isFranchisesLoading ? "Loading..." : "Select franchise"}
              </option>

              {franchises.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name}
                </option>
              ))}

            </select>

          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center pt-6">

            <button
              type="button"
              onClick={handleBackStep1}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={!isStep2Valid || isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-sky-600 transition"
            >
              {isSubmitting ? "Saving..." : "Save User"}
            </button>

          </div>

        </form>
      )}

    </div>

  </div>
)
}
