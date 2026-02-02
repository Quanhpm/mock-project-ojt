import React, { useState } from 'react'

function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [franchiseFilter, setFranchiseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleClearFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setFranchiseFilter('all')
    setStatusFilter('all')
  }

  return (
    <div className="flex h-screen w-full">
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header & Breadcrumbs */}
        <header className="w-full px-8 py-6 flex flex-col gap-6 shrink-0 z-10">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <a className="hover:text-primary transition-colors" href="#">
                Home
              </a>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-slate-900 font-medium">Users</span>
            </nav>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                User Management
              </h2>
              <p className="text-slate-500">Total Users: 124</p>
            </div>
            <button className="group flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm shadow-blue-500/20 transition-all active:scale-95">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="font-bold text-sm">Create User</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {/* Filters & Toolbar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 sticky top-0 z-20">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400">search</span>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                  placeholder="Search by name or email..."
                />
              </div>

              {/* Filters Group */}
              <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
                {/* Role Filter */}
                <div className="relative min-w-[140px]">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="manager">Manager</option>
                    <option value="barista">Barista</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </div>
                </div>

                {/* Franchise Filter */}
                <div className="relative min-w-[140px]">
                  <select
                    value={franchiseFilter}
                    onChange={(e) => setFranchiseFilter(e.target.value)}
                    className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
                  >
                    <option value="all">All Franchises</option>
                    <option value="nyc">New York - DT</option>
                    <option value="seattle">Seattle - North</option>
                    <option value="chicago">Chicago - Loop</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="relative min-w-[140px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </div>
                </div>

                <button
                  onClick={handleClearFilters}
                  className="text-sm font-medium text-primary hover:text-blue-600 px-2 whitespace-nowrap"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Roles
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Franchise
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Row 1 */}
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="h-10 w-10 rounded-full bg-cover bg-center shrink-0 border border-slate-200"
                          style={{
                            backgroundImage:
                              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAByAwMGAkJ7YLnb8ybwG2wV7QRG_ShmbvYjQM2aIUJ7ddZjOz6bLyA6LDfJ74adH3lwZMWhI78CX6CrmV4PfhNPjePg9V7T54PAMIbYPmeDDZ_tduHwQj8FlMhj8Dm8bjUddoL4cz9P7sQ9PYiBkQPpA7DrFQosKFQsJaythAsy8yLbctZ1OuIR1B77D30RPgSJPtv_fQu87h4SJajEsgRV3cZpe-7YzKpCaIcGqjKRXXKe7h_UgSGdKPIxqQGBpfl7seJ-hKPOv8')",
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            Sarah Jenkins
                          </span>
                          <span className="text-sm text-slate-500">
                            s.jenkins@coffeechain.com
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        Manager
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-lg">
                          location_on
                        </span>
                        <span className="text-sm text-slate-700">
                          NYC - Downtown
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                          <span className="material-symbols-outlined text-[20px]">
                            edit_square
                          </span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="h-10 w-10 rounded-full bg-cover bg-center shrink-0 border border-slate-200"
                          style={{
                            backgroundImage:
                              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDRn-TBbHyCdXtmuhbNhTxkiRKUu9wuOsb2zYDMMcjjjJ_oRAcpY-gEJwSyN58q5IPbSBBdCWVNyq28u2qow0870lZ7oKnFqZcEo1ywZknS0CTH2qxcR6pCBh7Z2IAoXby4a9yjZayK2rAI_SkCpuiHxVNSmp2MxbHU2Ada6gQETYMQNBqZMi5YgRF0tGzp-3rgsoqGFNrl4SLpApfDaFo3odKCeTcC7B-uvYv_ALu65kg_8GXUaxNuuVXnsXeKiuQS5nfjgYRUUL0')",
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            Michael Chen
                          </span>
                          <span className="text-sm text-slate-500">
                            m.chen@coffeechain.com
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        Barista
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-lg">
                          location_on
                        </span>
                        <span className="text-sm text-slate-700">
                          Seattle - North
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                          <span className="material-symbols-outlined text-[20px]">
                            edit_square
                          </span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="h-10 w-10 rounded-full bg-cover bg-center shrink-0 border border-slate-200"
                          style={{
                            backgroundImage:
                              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQKMYfQ8ksrPHv_K1j2m-eQtfhtLIb3DXLbPLRQ8sjN5MBjXlNNDbPpA0x9tPLIV6N2z-kp3Z8PaWMqBU8VWYZ0b5j_3wO7IvxP_cOLPVHuMCWVd7F-gxZvR0z92JG0MdI3q8yDBqeVNn8')",
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            Emily Davis
                          </span>
                          <span className="text-sm text-slate-500">
                            e.davis@coffeechain.com
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        Barista
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-lg">
                          location_on
                        </span>
                        <span className="text-sm text-slate-700">
                          Chicago - Loop
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
                      </label>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                          <span className="material-symbols-outlined text-[20px]">
                            edit_square
                          </span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="h-10 w-10 rounded-full bg-cover bg-center shrink-0 border border-slate-200"
                          style={{
                            backgroundImage:
                              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQ8yD5N_z8PFwKsXMRQJQ2wN3sKHPvNbXdLMPQ0xN5YzJT8jFVQ2kP5N8Q5yDN8Q_8yDN5Q8yDN5Q8yDN5Q8yDN5Q8yDN5Q8yDN5Q8yDN5Q8yD')",
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            Marcus Johnson
                          </span>
                          <span className="text-sm text-slate-500">
                            m.johnson@coffeechain.com
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                        Regional
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-lg">
                          location_on
                        </span>
                        <span className="text-sm text-slate-700">
                          West Coast
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
                      </label>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                          <span className="material-symbols-outlined text-[20px]">
                            edit_square
                          </span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 5 */}
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="h-10 w-10 rounded-full bg-cover bg-center shrink-0 border border-slate-200"
                          style={{
                            backgroundImage:
                              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA8Q5D_N8zPFwKsXMRQJQ2wN3sKHPvNbXdLMPQ0xN5YzJT8jFVQ2kP5N8Q5yDN8Q_8yDN5Q8yDN5Q8yDN5Q8yDN5Q8yDN5Q8yDN5Q8yDN5Q8yD')",
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            Lisa Wong
                          </span>
                          <span className="text-sm text-slate-500">
                            l.wong@coffeechain.com
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        Manager
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-lg">
                          location_on
                        </span>
                        <span className="text-sm text-slate-700">
                          Austin - East
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
                      </label>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                          <span className="material-symbols-outlined text-[20px]">
                            edit_square
                          </span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Showing <span className="font-medium">1</span> to{' '}
                    <span className="font-medium">5</span> of{' '}
                    <span className="font-medium">124</span> results
                  </p>
                </div>
                <div>
                  <nav
                    aria-label="Pagination"
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  >
                    <a
                      href="#"
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Previous</span>
                      <span className="material-symbols-outlined text-[20px]">
                        chevron_left
                      </span>
                    </a>
                    <a
                      href="#"
                      aria-current="page"
                      className="relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      1
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0"
                    >
                      2
                    </a>
                    <a
                      href="#"
                      className="relative hidden items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
                    >
                      3
                    </a>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 focus:outline-offset-0">
                      ...
                    </span>
                    <a
                      href="#"
                      className="relative hidden items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
                    >
                      12
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Next</span>
                      <span className="material-symbols-outlined text-[20px]">
                        chevron_right
                      </span>
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UserManagement
