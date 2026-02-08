import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { useFranchiseStore, type FranchiseCreateInput } from "../hooks/useFranchiseStore.hook";

export default function FranchiseCreatePage() {
  const navigate = useNavigate();

  const { create } = useFranchiseStore({ searchTerm: "", statusFilter: "all" });

  const [formData, setFormData] = useState<FranchiseCreateInput>({
    title: "",
    location: "",
    contact: "",
    status: "draft",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(formData);
    alert("Franchise created successfully!");
    navigate("/admin/franchises");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-sm text-gray-500 mb-4">
          <span
            onClick={() => navigate("/admin/franchises")}
            className="cursor-pointer text-primary"
          >
            Franchises
          </span>{" "}
          › <span className="text-gray-800">Create Franchise</span>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
            <div>
              <h2 className="text-2xl font-bold text-primary tracking-tight">
                Create New Franchise
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Add a new franchise with identity and basic contact details.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/franchises")}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              aria-label="Close"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          <form id="create-franchise-form" onSubmit={handleSubmit}>
            <div className="overflow-y-auto p-6 md:p-8 bg-white space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 flex flex-col gap-8">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        storefront
                      </span>
                      <h3 className="text-lg font-bold text-gray-800">Franchise Identity</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Franchise Name
                        </label>
                        <input
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          placeholder="Enter franchise name"
                          className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Location
                        </label>
                        <input
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          required
                          placeholder="Enter location (e.g., HCM - District 1)"
                          className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Contact (Phone/Email)
                        </label>
                        <input
                          name="contact"
                          value={formData.contact}
                          onChange={handleChange}
                          required
                          placeholder="Enter contact"
                          className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                        />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                  <section className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        toggle_on
                      </span>
                      <h3 className="text-sm font-bold text-gray-800">Franchise Status</h3>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full h-10 px-3 rounded-md bg-white border border-gray-200 text-gray-800 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/admin/franchises")}
                className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm"
              >
                <Save size={18} />
                Create Franchise
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
