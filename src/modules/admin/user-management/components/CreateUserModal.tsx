import React, { useState } from 'react'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: any) => void
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tempPassword, setTempPassword] = useState('CoffeeBeans123!')
  const [showPassword, setShowPassword] = useState(false)
  const [forcePasswordChange, setForcePasswordChange] = useState(true)
  const [franchiseRoles, setFranchiseRoles] = useState([
    { id: 1, location: 'HCM - Quận 1', role: 'FRANCHISE_MANAGER' },
    { id: 2, location: 'HCM - Quận 7', role: 'STAFF' },
  ])

  if (!isOpen) return null

  const handleSave = () => {
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      tempPassword,
      forcePasswordChange,
      franchiseRoles,
    }
    onSave(userData)
    onClose()
  }

  const handleRemoveRole = (id: number) => {
    setFranchiseRoles(franchiseRoles.filter((role) => role.id !== id))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-primary tracking-tight">
              Create New User
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Onboard a new employee to the franchise system.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 md:p-8 bg-white space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              {/* Personal Details */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    person
                  </span>
                  <h3 className="text-lg font-bold text-gray-800">Personal Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                      placeholder="e.g. Jane"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                      placeholder="e.g. Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        mail
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                        placeholder="jane.doe@coffeechain.com"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Phone Number{' '}
                      <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                      placeholder="+84 (xxx) xxx-xxxx"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* Franchise Assignment */}
              <section className="flex flex-col h-full">
                <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      storefront
                    </span>
                    <h3 className="text-lg font-bold text-gray-800">
                      Franchise Assignment
                    </h3>
                  </div>
                  <button className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 text-primary rounded-md hover:bg-accent-light hover:text-white hover:border-accent-light transition-all flex items-center gap-1.5 group">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Role
                  </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {franchiseRoles.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-4 py-3 font-medium text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-gray-400">
                                location_on
                              </span>
                              {item.location}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                item.role === 'FRANCHISE_MANAGER'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {item.role === 'FRANCHISE_MANAGER' ? 'Manager' : 'Staff'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRemoveRole(item.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                delete
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Profile Picture */}
              <section className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-300 flex-shrink-0">
                    <span className="material-symbols-outlined text-[32px]">person</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-bold text-gray-800">Profile Picture</h4>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-700 transition-colors">
                        Upload
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors">
                        Remove
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">JPG, GIF or PNG. Max 800K</p>
                  </div>
                </div>
              </section>

              {/* Security */}
              <section className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    lock
                  </span>
                  <h3 className="text-sm font-bold text-gray-800">Security</h3>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Temp Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full h-9 px-3 rounded-md bg-white border border-gray-200 text-gray-800 text-sm focus:ring-1 focus:ring-primary focus:border-primary pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mt-1">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="force-change"
                        checked={forcePasswordChange}
                        onChange={(e) => setForcePasswordChange(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-accent-dark focus:ring-accent-light focus:ring-offset-0 bg-white cursor-pointer"
                      />
                    </div>
                    <label
                      htmlFor="force-change"
                      className="text-xs text-gray-700 cursor-pointer select-none leading-5"
                    >
                      Force password change on next login
                    </label>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save User
          </button>
        </div>
      </div>
    </div>
  )
}
