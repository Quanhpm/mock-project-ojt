import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateUser } from '../hooks/useCreateUser.hook'
import type { RoleSelectItem } from '@/apis'
import { Upload, X } from 'lucide-react'
import axios from 'axios'
import { ENV } from '@/config/env.config'
import { useToast } from '@/hooks/use-toast.hook'

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

  // ──────── Step 1 fields ────────
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

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
  const onSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleCreateUser({ name, email, password, phone, avatar_url: avatarUrl })
  }

  // ──────── Step 2 submit ────────
  const onSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    const franchiseId = isAdmin ? null : selectedFranchiseId || null
    await handleAssignRole(selectedRoleId, franchiseId)
  }

  // ──────── Validate ────────
  const isStep1Valid =
    name.trim() &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    password === confirmPassword
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
              placeholder="e.g. Alex Morgan"
            />

          </div>

          {/* EMAIL */}
          <div className="mb-5">

            <label className="text-sm font-medium text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm"
              placeholder="alex.morgan@company.com"
            />

          </div>

          {/* PASSWORD */}
          <div className="grid grid-cols-2 gap-5 mb-5">

            <div>

              <label className="text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm"
              />

            </div>

            <div>

              <label className="text-sm font-medium text-slate-700">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm"
              />

            </div>

          </div>

          {/* PHONE */}
          <div className="mb-8">

            <label className="text-sm font-medium text-slate-700">
              Phone Number
            </label>

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm"
            />

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
              disabled={!isStep1Valid || isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] transition"
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
