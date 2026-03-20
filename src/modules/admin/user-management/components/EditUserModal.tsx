import React, { useState, useEffect, useRef } from 'react'
import type { UserItem } from '../hooks/useUserList.hook'
import {
  updateUser,
  assignUserFranchiseRole,
  getFranchisesForSelect,
} from '@/apis'
import type { FranchiseSelectItem } from '@/apis'
import { ROLES } from '@/consts/roles.const'
import type { RoleOption } from '@/consts/roles.const'
import { Upload, X } from 'lucide-react'
import axios from 'axios'
import { ENV } from '@/config/env.config'
import { useToast } from '@/hooks/use-toast.hook'

// ======================== Types ========================

type ActiveTab = 'info' | 'role'

interface EditUserModalProps {
  isOpen: boolean
  user: UserItem | null
  onClose: () => void
  onSuccess: () => void
}

// ======================== Component ========================

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const { success: showSuccess, error: showError } = useToast()

  // ──────── Tab ────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('info')

  // ──────── Part 1: User info ────────
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  // ──────── Cloudinary Upload ────────
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)
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
      showSuccess('Avatar uploaded successfully', 'Profile picture has been updated.')
    } catch (err: any) {
      console.error('Avatar Upload Error:', err)
      showError('Upload failed', err.message || 'Unable to upload image.')
      setError('Image upload failed. The file may be too large or there is a connection error.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Invalid file', 'Please select a valid image file.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showError('File too large', 'Maximum image size is 5MB.')
        return
      }
      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setAvatarUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ──────── Part 2: Role & Franchise ────────
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [selectedFranchiseId, setSelectedFranchiseId] = useState('')
  const [franchises, setFranchises] = useState<FranchiseSelectItem[]>([])
  const [isFranchisesLoading, setIsFranchisesLoading] = useState(false)

  // ──────── Shared state ────────
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Role logic
  const selectedRole: RoleOption | undefined = ROLES.find(
    (r) => r.value === selectedRoleId,
  )
  const isAdmin = selectedRole?.code === 'ADMIN'

  // Reset franchise khi chọn ADMIN
  useEffect(() => {
    if (isAdmin) {
      setSelectedFranchiseId('')
    }
  }, [isAdmin])

  // Pre-fill form khi user thay đổi
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setAvatarUrl(user.avatar_url || '')
      setActiveTab('info')
      setSelectedRoleId('')
      setSelectedFranchiseId('')
      setError(null)
      setSuccessMsg(null)
    }
  }, [user])

  // Fetch franchises khi mở tab role
  useEffect(() => {
    if (!isOpen || activeTab !== 'role') return
    let cancelled = false
    const fetchFranchises = async () => {
      setIsFranchisesLoading(true)
      try {
        const data = await getFranchisesForSelect()
        if (!cancelled) {
          setFranchises(data ?? [])
        }
      } catch (err) {
        if (err === null) return // bị cancel — bỏ qua
        if (!cancelled) {
          console.error('Failed to fetch franchises:', err)
          setFranchises([])
        }
      } finally {
        if (!cancelled) setIsFranchisesLoading(false)
      }
    }
    fetchFranchises()
    return () => { cancelled = true }
  }, [isOpen, activeTab])

  if (!isOpen || !user) return null

  const handleClose = () => {
    setError(null)
    setSuccessMsg(null)
    onClose()
  }

  // ──────── Submit Part 1: Update User Info ────────
  const onSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await updateUser(user.id, {
        email,
        name,
        phone,
        avatar_url: avatarUrl,
      })
      setSuccessMsg('User information updated successfully!')
      onSuccess()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update user.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ──────── Submit Part 2: Assign Role ────────
  const onSubmitRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await assignUserFranchiseRole({
        user_id: user.id,
        role_id: selectedRoleId,
        franchise_id: isAdmin ? null : selectedFranchiseId || null,
        note: '',
      })
      setSuccessMsg('Role assigned successfully!')
      onSuccess()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to assign role.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ──────── Validation ────────
  const isInfoValid = name.trim() && email.trim()
  const isRoleValid = selectedRoleId && (isAdmin || selectedFranchiseId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        {/* ═══════════ Header ═══════════ */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-primary tracking-tight">
              Edit User
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {user.name} — {user.email}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* ═══════════ Tabs ═══════════ */}
        <div className="px-6 pt-4 flex gap-0 border-b border-gray-100">
          <button
            type="button"
            onClick={() => { setActiveTab('info'); setError(null); setSuccessMsg(null) }}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'info'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">person</span>
              User Info
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('role'); setError(null); setSuccessMsg(null) }}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'role'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              Assign Role
            </span>
          </button>
        </div>

        {/* ═══════════ Messages ═══════════ */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">error</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-green-600 text-[18px] mt-0.5">check_circle</span>
            <p className="text-sm text-green-700 font-medium">{successMsg}</p>
          </div>
        )}

        {/* ═══════════ Tab 1: User Info ═══════════ */}
        {activeTab === 'info' && (
          <form onSubmit={onSubmitInfo} className="flex flex-col flex-1">
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">person</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="e.g. Nguyen Van A"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="user@example.com"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Phone Number{' '}
                  <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">phone</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="+84 xxx xxx xxxx"
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Avatar Image{' '}
                  <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  style={{ display: "none" }}
                />

                {avatarUrl ? (
                  // Preview Mode
                  <div className="relative border-2 border-slate-200 rounded-lg p-4 bg-slate-50 flex items-center gap-4">
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      className="w-20 h-20 object-cover rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-slate-800 m-0 mb-1">Avatar Uploaded</p>
                      <p className="text-xs text-slate-500 m-0 truncate">{avatarUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={isUploading}
                      className="absolute top-3 right-3 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  // Upload Mode
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${isUploading
                        ? 'border-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
                        : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-primary cursor-pointer'
                      }`}
                  >
                    <Upload
                      size={32}
                      className={`mx-auto mb-3 ${isUploading ? 'text-slate-400' : 'text-primary'}`}
                    />
                    <p className={`text-sm font-semibold m-0 mb-1 ${isUploading ? 'text-slate-500' : 'text-slate-800'}`}>
                      {isUploading ? "Uploading..." : "Click to select avatar image"}
                    </p>
                    <p className="text-xs text-slate-500 m-0">
                      JPG, PNG, WEBP (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isInfoValid || isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Update Info
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ═══════════ Tab 2: Assign Role ═══════════ */}
        {activeTab === 'role' && (
          <form onSubmit={onSubmitRole} className="flex flex-col flex-1">
            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              {/* Hint */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
                <p className="text-sm text-blue-700">
                  Assign an additional role to this user. This creates a new role assignment.
                </p>
              </div>

              {/* Role dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">badge</span>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full h-10 pl-9 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="">— Select a role —</option>
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.name} ({role.scope})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Franchise dropdown */}
              <div
                className={`flex flex-col gap-1.5 transition-opacity ${isAdmin ? 'opacity-40 pointer-events-none' : ''
                  }`}
              >
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                  Franchise <span className="text-red-500">*</span>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase normal-case">
                      <span className="material-symbols-outlined text-[12px]">info</span>
                      Not required for Admin
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">storefront</span>
                  <select
                    value={selectedFranchiseId}
                    onChange={(e) => setSelectedFranchiseId(e.target.value)}
                    disabled={isAdmin}
                    className="w-full h-10 pl-9 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required={!isAdmin}
                  >
                    <option value="">
                      {isFranchisesLoading ? 'Loading franchises...' : '— Select a franchise —'}
                    </option>
                    {franchises.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isRoleValid || isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Assign Role
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
