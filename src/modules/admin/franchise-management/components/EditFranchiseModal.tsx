import React, { useState, useEffect } from 'react'

type Franchise = {
  id: string
  title: string
  location: string
  contact: string
}

interface EditFranchiseModalProps {
  isOpen: boolean
  franchise: Franchise | null
  onClose: () => void
  onSave: (franchiseId: string, data: any) => void
}

export const EditFranchiseModal: React.FC<EditFranchiseModalProps> = ({
  isOpen,
  franchise,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    contact: '',
  })

  useEffect(() => {
    if (franchise) {
      setFormData({
        title: franchise.title,
        location: franchise.location,
        contact: franchise.contact,
      })
    }
  }, [franchise, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    if (!formData.title || !formData.location || !formData.contact) {
      alert('Please fill in all fields')
      return
    }
    if (franchise) {
      onSave(franchise.id, formData)
      onClose()
    }
  }

  if (!isOpen || !franchise) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Franchise</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter franchise title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter contact number"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
