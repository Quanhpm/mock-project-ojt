import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateUser } from '../hooks/useCreateUser.hook'
import type { RoleSelectItem } from '@/apis'

export const UserCreateForm: React.FC = () => {
  const navigate = useNavigate()
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
    await handleCreateUser({ name, email, password, phone })
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
    <div className="w-full flex flex-col">
      <main className="flex flex-col flex-1">
        {/* Page Header */}
        <header className="w-full px-8 py-6 flex flex-col gap-6 shrink-0 z-10 bg-white border-b border-slate-200">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <a className="hover:text-primary transition-colors" href="/admin/users">
                Users
              </a>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-slate-900 font-medium">
                {currentStep === 1 ? 'Create User' : 'Assign Role & Franchise'}
              </span>
            </nav>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                {currentStep === 1 ? 'Create New User' : 'Assign Role & Franchise'}
              </h2>
              <p className="text-slate-500">
                {currentStep === 1
                  ? 'Step 1 of 2 — Enter user information'
                  : 'Step 2 of 2 — Assign role and franchise'}
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-0">
            {/* Step 1 dot */}
            <div className="flex items-center gap-2">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  currentStep === 1
                    ? 'bg-primary text-white'
                    : 'bg-green-500 text-white'
                }`}
              >
                {currentStep > 1 ? (
                  <span className="material-symbols-outlined text-[18px]">
                    check
                  </span>
                ) : (
                  '1'
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === 1 ? 'text-gray-800' : 'text-green-600'
                }`}
              >
                Create User
              </span>
            </div>

            {/* Connector */}
            <div
              className={`flex-1 h-0.5 mx-3 rounded transition-colors ${
                currentStep > 1 ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />

            {/* Step 2 dot */}
            <div className="flex items-center gap-2">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  currentStep === 2
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === 2 ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                Assign Role
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-8 pb-8 flex-1">
          <div className="max-w-2xl mx-auto">
            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5 flex-shrink-0">
                  error
                </span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Step 1: Create User Form */}
            {currentStep === 1 && (
              <form onSubmit={onSubmitStep1} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="space-y-5">
                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        person
                      </span>
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
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        mail
                      </span>
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

                  {/* Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        lock
                      </span>
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        placeholder="Enter password"
                        required
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        lock
                      </span>
                      <input
                        type="text"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        placeholder="Re-enter password"
                        required
                      />
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-xs text-red-500">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Phone Number{' '}
                      <span className="text-gray-500 font-normal text-xs">
                        (optional)
                      </span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        phone
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        placeholder="+84 xxx xxx xxxx"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isStep1Valid || isSubmitting}
                    className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">
                          progress_activity
                        </span>
                        Creating...
                      </>
                    ) : (
                      <>
                        Next
                        <span className="material-symbols-outlined text-[18px]">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Assign Role & Franchise */}
            {currentStep === 2 && (
              <form onSubmit={onSubmitStep2} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="space-y-5">
                  {/* Success banner from Step 1 */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-[18px]">
                      check_circle
                    </span>
                    <p className="text-sm text-green-700 font-medium">
                      User created successfully! Now assign a role.
                    </p>
                  </div>

                  {/* Role dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        badge
                      </span>
                      <select
                        value={selectedRoleId}
                        onChange={(e) => setSelectedRoleId(e.target.value)}
                        className="w-full h-10 pl-9 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                        required
                      >
                        <option value="">
                          {isRolesLoading ? 'Loading roles...' : '— Select a role —'}
                        </option>
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.name} ({role.scope})
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Franchise dropdown — ẩn/disable khi chọn ADMIN */}
                  <div
                    className={`flex flex-col gap-2 transition-opacity ${
                      isAdmin ? 'opacity-40 pointer-events-none' : ''
                    }`}
                  >
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      Franchise <span className="text-red-500">*</span>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase normal-case">
                          <span className="material-symbols-outlined text-[12px]">
                            info
                          </span>
                          Not required for Admin
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        storefront
                      </span>
                      <select
                        value={selectedFranchiseId}
                        onChange={(e) => setSelectedFranchiseId(e.target.value)}
                        disabled={isAdmin}
                        className="w-full h-10 pl-9 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required={!isAdmin}
                      >
                        <option value="">
                          {isFranchisesLoading
                            ? 'Loading franchises...'
                            : '— Select a franchise —'}
                        </option>
                        {franchises.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.name} ({f.code})
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleBackStep1}
                    className="px-4 py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-sm flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_back
                    </span>
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isStep2Valid || isSubmitting}
                      className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">
                            progress_activity
                          </span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">
                            save
                          </span>
                          Save & Finish
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
