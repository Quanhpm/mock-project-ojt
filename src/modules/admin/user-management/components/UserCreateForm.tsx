import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateUser } from '../hooks/useCreateUser.hook'
import type { RoleSelectItem } from '@/apis'
import { Upload, X } from 'lucide-react'
import axios from 'axios'
import { ENV } from '@/config/env.config'
import { useToast } from '@/hooks/use-toast.hook'

// ──────── Zod Schema ────────
const userCreateSchema = z
  .object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phone: z.string().optional(),
    avatar_url: z.string().optional(),
    role_id: z.string().min(1, 'Role is required'),
    franchise_id: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type UserCreateFormValues = z.infer<typeof userCreateSchema>

const STEP1_FIELDS: (keyof UserCreateFormValues)[] = [
  'name',
  'email',
  'password',
  'confirmPassword',
  'phone',
  'avatar_url',
]

// ──────── Shared Styles ────────
const inputClass =
  'mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm'

const errorClass = 'mt-1 text-xs text-red-500'

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

  // Cloudinary upload state
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      avatar_url: '',
      role_id: '',
      franchise_id: '',
    },
  })

  const avatarUrl = watch('avatar_url')
  const selectedRoleId = watch('role_id')

  // Find selected role to check if Admin
  const selectedRole: RoleSelectItem | undefined = roles.find(
    (r) => r.value === selectedRoleId,
  )
  const isAdmin = selectedRole?.code === 'ADMIN'

  // Reset franchise when Admin role selected
  useEffect(() => {
    if (isAdmin) {
      setValue('franchise_id', '')
    }
  }, [isAdmin, setValue])

  // ──────── Avatar Upload ────────
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
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )

      setValue('avatar_url', response.data.secure_url)
      showSuccess('Avatar uploaded successfully', 'Profile picture has been uploaded.')
    } catch (err: any) {
      console.error('Avatar Upload Error:', err)
      showError('Upload failed', err.message || 'Unable to upload image.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Invalid file', 'Please select an image file.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showError('File too large', 'Maximum size is 5MB.')
        return
      }
      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setValue('avatar_url', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCancel = () => {
    navigate('/admin/users')
  }

  const handleBackStep1 = () => {
    goBackToStep1()
  }

  // ──────── Step 1 Submit: validate step 1 fields before advancing ────────
  const onSubmitStep1 = async () => {
    const isStep1Valid = await trigger(STEP1_FIELDS)
    if (!isStep1Valid) return
    const values = watch()
    await handleCreateUser({
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone  ?? '',
      avatar_url: values.avatar_url,
    })
  }

  // ──────── Step 2 Submit ────────
  const onSubmitStep2 = async () => {
    const isStep2Valid = await trigger(['role_id', 'franchise_id'])
    if (!isStep2Valid) return
    const values = watch()
    const franchiseId = isAdmin ? null : values.franchise_id || null
    await handleAssignRole(values.role_id, franchiseId)
  }

  return (
    <div className="min-h-screen py-12 flex justify-center">
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
              ${currentStep === 1 ? 'bg-[#7F5539] text-white' : 'bg-[#9C6644] text-white'}`}
            >
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <span className="text-sm font-medium text-slate-700">User Info</span>
          </div>

          <div
            className={`w-28 h-[3px] mx-4 rounded-full ${currentStep > 1 ? 'bg-[#7F5539]' : 'bg-slate-200'}`}
          />

          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
              ${currentStep === 2 ? 'bg-[#7F5539] text-white' : 'bg-slate-200 text-slate-500'}`}
            >
              2
            </div>
            <span className="text-sm font-medium text-slate-500">Role Selection</span>
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
          <div className="bg-white rounded-2xl border border-[#E6CCB2] shadow-sm p-10">
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
                  {isUploading ? (
                    <span className="text-xs text-[#B08968]">Uploading...</span>
                  ) : (
                    <Upload size={20} className="text-[#B08968]" />
                  )}
                </div>
              )}
            </div>

            {/* NAME */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                className={inputClass}
                placeholder="e.g. Alex Morgan"
              />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>

            {/* EMAIL */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                className={inputClass}
                placeholder="alex.morgan@company.com"
              />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>

            {/* PASSWORD */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className={inputClass}
                />
                {errors.password && (
                  <p className={errorClass}>{errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className={inputClass}
                />
                {errors.confirmPassword && (
                  <p className={errorClass}>{errors.confirmPassword.message}</p>
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
                className={inputClass}
                placeholder="e.g. 0912345678"
              />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
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
                type="button"
                onClick={onSubmitStep1}
                disabled={isSubmitting || isUploading}
                className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Next Step →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
            <h2 className="text-lg font-semibold text-slate-800 mb-8">
              Role Selection
            </h2>

            {/* ROLE */}
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                {...register('role_id')}
                className={inputClass}
              >
                <option value="">
                  {isRolesLoading ? 'Loading roles...' : 'Select role'}
                </option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <p className={errorClass}>{errors.role_id.message}</p>
              )}
            </div>

            {/* FRANCHISE */}
            <div className="mb-8">
              <label className="text-sm font-medium text-slate-700">
                Franchise {!isAdmin && <span className="text-red-500">*</span>}
              </label>
              <select
                {...register('franchise_id')}
                disabled={isAdmin}
                className={`${inputClass} ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {isFranchisesLoading
                    ? 'Loading...'
                    : isAdmin
                    ? 'Not required for Admin'
                    : 'Select franchise'}
                </option>
                {franchises.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </select>
              {errors.franchise_id && (
                <p className={errorClass}>{errors.franchise_id.message}</p>
              )}
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
                type="button"
                onClick={onSubmitStep2}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
