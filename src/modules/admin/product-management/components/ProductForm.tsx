import { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Check, LoaderCircle, Upload, X } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProduct } from "./hooks/useCreateProduct";
import { useAssignProductFranchise } from "../hooks/useAssignProductFranchise.hook";
import { CKEditorField } from "@/components/ui";
import { SIZE_OPTIONS } from "@/types/product-option.type";
import {
  DEFAULT_PRODUCT_FORM_VALUES,
  buildPriceSchema,
  productFormSchema,
  toProductPayload,
  type ProductFormInput,
  type ProductFormValues,
} from "./productForm.schema";
import { useProductImageUpload } from "./hooks/useProductImageUpload";

const step2Schema = z.object({
  franchise_id: z.string().min(1, "Franchise is required"),
  size: z.string().min(1, "Size is required"),
  price_base: buildPriceSchema("Base price"),
});

type Step2FormInput = z.input<typeof step2Schema>;
type Step2FormValues = z.output<typeof step2Schema>;

export default function ProductForm() {
  const navigate = useNavigate();
  const { createProduct, isCreating, error } = useCreateProduct();

  const {
    currentStep,
    isSubmitting: isAssigning,
    error: assignError,
    franchises,
    isFranchisesLoading,
    handleAssignFranchise,
    goToStep2,
  } = useAssignProductFranchise(() => {
    navigate("/admin/products");
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProductFormInput, undefined, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: "onChange",
    defaultValues: DEFAULT_PRODUCT_FORM_VALUES,
  });

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: step2Errors },
  } = useForm<Step2FormInput, undefined, Step2FormValues>({
    resolver: zodResolver(step2Schema),
    mode: "onChange",
    defaultValues: {
      franchise_id: "",
      size: "",
      price_base: "",
    },
  });

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadMainImage,
    uploadGalleryImages,
    isUploadingMainImage,
    isUploadingGalleryImages,
  } = useProductImageUpload({
    setValue,
    getValues,
  });

  const mainImageUrl = useWatch({ control, name: "image_url" });
  const additionalImages = useWatch({ control, name: "images_url" });
  const hasTopping = useWatch({ control, name: "is_have_topping" });

  const isStep1Submitting = useMemo(
    () =>
      isCreating ||
      isAssigning ||
      isUploadingMainImage ||
      isUploadingGalleryImages,
    [
      isAssigning,
      isCreating,
      isUploadingGalleryImages,
      isUploadingMainImage,
    ],
  );

  const onSubmitStep1 = async (values: ProductFormValues) => {
    await createProduct(toProductPayload(values), (newProduct) => {
      goToStep2(newProduct.id);
    });
  };

  const onSubmitStep2 = async (values: Step2FormValues) => {
    await handleAssignFranchise({
      franchise_id: values.franchise_id,
      size: values.size,
      price_base: Number(values.price_base),
    });
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void uploadMainImage(file).finally(() => {
      if (mainFileInputRef.current) {
        mainFileInputRef.current.value = "";
      }
    });
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    void uploadGalleryImages(e.target.files).finally(() => {
      if (additionalFileInputRef.current) {
        additionalFileInputRef.current.value = "";
      }
    });
  };

  const removeMainImage = () => {
    setValue("image_url", "", { shouldValidate: true, shouldDirty: true });
    if (mainFileInputRef.current) mainFileInputRef.current.value = "";
  };

  const removeAdditionalImage = (indexToRemove: number) => {
    setValue(
      "images_url",
      (additionalImages ?? []).filter((_, idx) => idx !== indexToRemove),
      { shouldDirty: true },
    );
  };

  return (
    <div className="min-h-screen py-10 flex justify-center">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#7F5539]">
            {currentStep === 1 ? "Create New Product" : "Assign Franchise"}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {currentStep === 1
              ? "Step 1 of 2: Enter product information"
              : "Step 2 of 2: Link product to a franchise"}
          </p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 1 ? "bg-[#7F5539] text-white" : "bg-[#9C6644] text-white"}`}
            >
              {currentStep > 1 ? <Check size={16} /> : "1"}
            </div>
            <span className="text-sm font-medium text-slate-700">Product Info</span>
          </div>
          <div className={`w-28 h-[3px] mx-4 rounded-full ${currentStep > 1 ? "bg-[#7F5539]" : "bg-slate-200"}`} />
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 2 ? "bg-[#7F5539] text-white" : "bg-slate-200 text-slate-500"}`}
            >
              2
            </div>
            <span className="text-sm font-medium text-slate-500">Franchise Setup</span>
          </div>
        </div>

        {(error || assignError) && (
          <div className="mb-5 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5" />
            <span>{currentStep === 1 ? error : assignError}</span>
          </div>
        )}

        {currentStep === 1 && (
          <form onSubmit={handleSubmit(onSubmitStep1)} className="bg-white rounded-2xl border border-[#E6CCB2] shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-slate-700">SKU *</label>
                <input {...register("SKU")} placeholder="COFFEE_5" className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm" />
                {errors.SKU && <p className="text-xs text-red-600 mt-1">{errors.SKU.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Product Name *</label>
                <input {...register("name")} placeholder="Coffee 5" className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm" />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Minimum Price (VND) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  {...register("min_price")}
                  placeholder="30000"
                  className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter a whole number from 1000 to 100000.
                </p>
                {errors.min_price && <p className="text-xs text-red-600 mt-1">{errors.min_price.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Maximum Price (VND) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  {...register("max_price")}
                  placeholder="50000"
                  className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter a whole number from 1000 to 100000.
                </p>
                {errors.max_price && <p className="text-xs text-red-600 mt-1">{errors.max_price.message}</p>}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">Description *</label>
              <textarea {...register("description")} rows={3} placeholder="Traditional bold-roast morning coffee" className="mt-2 w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm resize-y" />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">Content *</label>
              <Controller
                control={control}
                name="content"
                render={({ field }) => (
                  <div className="mt-2">
                    <CKEditorField
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter product content here..."
                      hasError={!!errors.content}
                    />
                  </div>
                )}
              />
              {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content.message}</p>}
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-slate-700">Main Image *</label>
                <input ref={mainFileInputRef} type="file" accept="image/*" hidden onChange={handleMainImageChange} />
                {!mainImageUrl ? (
                  <button
                    type="button"
                    disabled={isUploadingMainImage}
                    onClick={() => mainFileInputRef.current?.click()}
                    className="mt-2 w-full h-28 border-2 border-dashed border-[#DDB892] rounded-lg flex flex-col items-center justify-center text-sm text-[#7F5539] hover:border-[#B08968] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUploadingMainImage ? (
                      <LoaderCircle size={20} className="mb-2 animate-spin" />
                    ) : (
                      <Upload size={20} className="mb-2" />
                    )}
                    {isUploadingMainImage ? "Uploading main image..." : "Click to select main image"}
                  </button>
                ) : (
                  <div className="mt-2 border border-slate-200 rounded-lg p-3 bg-slate-50 relative">
                    <img src={mainImageUrl} alt="Main preview" className="w-full h-36 object-cover rounded-md" />
                    <button type="button" onClick={removeMainImage} className="absolute top-5 right-5 p-1 rounded-full bg-red-600 text-white">
                      <X size={14} />
                    </button>
                  </div>
                )}
                {errors.image_url && <p className="text-xs text-red-600 mt-1">{errors.image_url.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Additional Images</label>
                <input ref={additionalFileInputRef} type="file" accept="image/*" multiple hidden onChange={handleAdditionalImagesChange} />
                <button
                  type="button"
                  disabled={isUploadingGalleryImages}
                  onClick={() => additionalFileInputRef.current?.click()}
                  className="mt-2 w-full h-11 rounded-lg border border-[#DDB892] text-[#7F5539] text-sm font-medium hover:bg-[#fdf7f2] transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {isUploadingGalleryImages && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}
                  {isUploadingGalleryImages ? "Uploading..." : "Upload Additional Images"}
                </button>
                {(additionalImages ?? []).length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {(additionalImages ?? []).map((url, idx) => (
                      <div key={url + idx} className="relative">
                        <img src={url} alt={`Additional ${idx + 1}`} className="w-full h-16 object-cover rounded-md border border-slate-200" />
                        <button type="button" onClick={() => removeAdditionalImage(idx)} className="absolute -top-1 -right-1 p-1 rounded-full bg-red-600 text-white">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Has Topping</p>
                <p className="text-xs text-slate-500">Enable if this product supports add-on toppings</p>
              </div>
              <button
                type="button"
                onClick={() => setValue("is_have_topping", !hasTopping, { shouldDirty: true })}
                className={`w-12 h-7 rounded-full relative transition ${hasTopping ? "bg-[#8B4513]" : "bg-slate-300"}`}
              >
                <span className={`absolute top-1 h-5 w-5 bg-white rounded-full transition ${hasTopping ? "left-6" : "left-1"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="h-10 px-5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isStep1Submitting}
                className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Next Step"}
              </button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleSubmitStep2(onSubmitStep2)} className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="p-3 mb-6 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
              Product created successfully. Select a franchise and save.
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700">Franchise *</label>
                <select {...registerStep2("franchise_id")} className="mt-2 w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                  <option value="">{isFranchisesLoading ? "Loading franchises..." : "Select a franchise"}</option>
                  {franchises.map((f) => (
                    <option key={f.value} value={f.value}>{f.name} ({f.code})</option>
                  ))}
                </select>
                {step2Errors.franchise_id && <p className="text-xs text-red-600 mt-1">{step2Errors.franchise_id.message}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Size *</label>
                <select {...registerStep2("size")} className="mt-2 w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                  <option value="">Select a size</option>
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s.code} value={s.code}>{s.label} ({s.code})</option>
                  ))}
                </select>
                {step2Errors.size && <p className="text-xs text-red-600 mt-1">{step2Errors.size.message}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Base Price (VND) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  {...registerStep2("price_base")}
                  className="mt-2 w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                  placeholder="35000"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter a whole number from 1000 to 100000.
                </p>
                {step2Errors.price_base && <p className="text-xs text-red-600 mt-1">{step2Errors.price_base.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="h-10 px-5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAssigning}
                className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
