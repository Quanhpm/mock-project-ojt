import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Upload, X } from "lucide-react";
import { useCreateFranchise } from "./hooks/useCreateFranchise";
import {
  DEFAULT_FRANCHISE_FORM_VALUES,
  franchiseFormSchema,
  type FranchiseFormValues,
} from "./franchiseForm.schema";
import { CLOUDINARY_IMAGE_REQUIREMENT_TEXT } from "@/utils";
import { useFranchiseLogoUpload } from "./hooks/useFranchiseLogoUpload";

const inputClass =
  "mt-2 w-full h-11 px-3 rounded-md border border-[#d1d5db] bg-white focus:bg-white focus:border-[#B08968] focus:outline-none text-sm transition-colors";

const textareaClass =
  "mt-2 w-full min-h-[96px] px-3 py-3 rounded-md border border-[#d1d5db] bg-white focus:bg-white focus:border-[#B08968] focus:outline-none text-sm transition-colors resize-y";

const checkboxClass =
  "h-4 w-4 rounded border-slate-300 text-[#7F5539] focus:ring-[#B08968]";

const labelClass = "text-sm font-semibold text-[#374151]";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export default function FranchiseForm() {
  const navigate = useNavigate();
  const { createFranchise, isCreating } = useCreateFranchise();
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FranchiseFormValues>({
    resolver: zodResolver(franchiseFormSchema),
    mode: "onChange",
    defaultValues: DEFAULT_FRANCHISE_FORM_VALUES,
  });

  const { uploadLogo, isUploadingLogo } = useFranchiseLogoUpload({
    setValue,
  });

  const logoUrl = useWatch({ control, name: "logo_url" });
  const isSubmitting = isCreating || isUploadingLogo;

  const onSubmit = async (data: FranchiseFormValues) => {
    if (isSubmitting) return;

    await createFranchise(
      {
        code: data.code.trim(),
        name: data.name.trim(),
        hotline: data.hotline.trim(),
        logo_url: data.logo_url?.trim() ?? "",
        address: data.address.trim(),
        opened_at: data.opened_at,
        closed_at: data.closed_at ? data.closed_at : null,
        google_map_script: data.google_map_script?.trim() ?? "",
        is_active: data.is_active ?? true,
      },
      () => {
        navigate("/admin/franchises");
      },
    );
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    void uploadLogo(file).finally(() => {
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    });
  };

  const removeLogo = () => {
    setValue("logo_url", "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#f9f7f4",
        padding: "24px 16px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: "700px", margin: "0 auto", width: "100%" }}>
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#7F5539]">
            Create New Franchise
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Add a new franchise location to the system.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl border border-[#E6CCB2] shadow-sm p-6 sm:p-10">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 sm:mb-8">
              Franchise Information
            </h2>

            <div className="flex justify-center mb-8">
              <div className="text-center">
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleLogoChange}
                />
                {logoUrl ? (
                  <div className="relative inline-block">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[28px] border border-[#E6CCB2] bg-white">
                      <img
                        src={logoUrl}
                        alt="Franchise logo"
                        className="h-full w-full object-contain p-3"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      disabled={isUploadingLogo}
                      className="absolute -top-2 -right-2 rounded-full border bg-white p-1 shadow disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="flex h-28 w-28 items-center justify-center rounded-[28px] border-2 border-dashed border-[#DDB892] text-[#B08968] transition hover:border-[#B08968] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploadingLogo ? (
                      <LoaderCircle size={20} className="animate-spin" />
                    ) : (
                      <Upload size={20} />
                    )}
                  </button>
                )}
                <p className="mt-3 text-xs text-slate-500">
                  {CLOUDINARY_IMAGE_REQUIREMENT_TEXT}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className={labelClass}>
                  Franchise Code <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("code")}
                  className={inputClass}
                  placeholder="FR_001"
                />
                {errors.code && <p className={errorClass}>{errors.code.message}</p>}
              </div>

              <div>
                <label className={labelClass}>
                  Franchise Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  className={inputClass}
                  placeholder="Hanoi Franchise"
                />
                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
              </div>
            </div>

            <div className="mb-5">
              <label className={labelClass}>
                Hotline <span className="text-red-500">*</span>
              </label>
              <input
                {...register("hotline")}
                className={inputClass}
                placeholder="0123456789"
                maxLength={10}
              />
              {errors.hotline && <p className={errorClass}>{errors.hotline.message}</p>}
            </div>

            <div className="mb-5">
              <label className={labelClass}>
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("address")}
                className={textareaClass}
                placeholder="Enter franchise address"
              />
              {errors.address && <p className={errorClass}>{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className={labelClass}>
                  Opening Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  {...register("opened_at")}
                  className={inputClass}
                />
                {errors.opened_at && (
                  <p className={errorClass}>{errors.opened_at.message}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Closing Time</label>
                <input
                  type="time"
                  {...register("closed_at")}
                  className={inputClass}
                />
                {errors.closed_at && (
                  <p className={errorClass}>{errors.closed_at.message}</p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <label className={labelClass}>Google Map Script</label>
              <textarea
                {...register("google_map_script")}
                className={`${textareaClass} font-mono`}
                placeholder="Enter Google Map embed script"
              />
            </div>

            <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  {...register("is_active")}
                  className={checkboxClass}
                />
                <span>Active Franchise</span>
              </label>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "space-between",
                marginTop: "32px",
                paddingTop: "24px",
                borderTop: "1px solid #E6CCB2",
              }}
              className="flex-col-reverse sm:flex-row"
            >
              <button
                type="button"
                onClick={() => navigate("/admin/franchises")}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] transition disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isCreating
                  ? "Creating..."
                  : isUploadingLogo
                    ? "Uploading..."
                    : "Create Franchise"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
