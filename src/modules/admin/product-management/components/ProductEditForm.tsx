import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Upload, X } from "lucide-react";
import { productApi } from "@/apis/endpoints/product.api";
import { ENV } from "@/config/env.config";
import { useToast } from "@/hooks/use-toast.hook";
import { CKEditorField } from "@/components/ui";

const editProductSchema = z
  .object({
    SKU: z.string().trim().min(1, "SKU is required"),
    name: z.string().trim().min(1, "Product name is required"),
    description: z.string().trim().min(1, "Description is required"),
    content: z.string().trim().min(1, "Content is required"),
    image_url: z.string().trim().min(1, "Main image is required"),
    images_url: z.array(z.string()).optional(),
    min_price: z.coerce.number().gt(0, "Minimum price must be greater than 0"),
    max_price: z.coerce.number().gt(0, "Maximum price must be greater than 0"),
    is_have_topping: z.boolean().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => data.max_price >= data.min_price, {
    path: ["max_price"],
    message: "Maximum price must be greater than or equal to minimum price",
  });

type EditProductFormValues = z.infer<typeof editProductSchema>;

export default function ProductEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success: showSuccess, error: showError } = useToast();

  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      SKU: "",
      name: "",
      description: "",
      content: "",
      image_url: "",
      images_url: [],
      min_price: 0,
      max_price: 0,
      is_have_topping: false,
      is_active: true,
    },
  });

  useEffect(() => {
    if (!id) {
      setIsLoadingProduct(false);
      return;
    }

    const loadProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const product = await productApi.getProductById(id);
        if (!product) {
          showError("Load failed", "Product not found.");
          navigate("/admin/products");
          return;
        }

        form.reset({
          SKU: product.SKU ?? "",
          name: product.name ?? "",
          description: product.description ?? "",
          content: product.content ?? "",
          image_url: product.image_url ?? "",
          images_url: product.images_url ?? [],
          min_price: Number(product.min_price ?? 0),
          max_price: Number(product.max_price ?? 0),
          is_have_topping: !!product.is_have_topping,
          is_active: product.is_active ?? true,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load product.";
        showError("Load failed", message);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    void loadProduct();
  }, [form, id, navigate, showError]);

  const handleUploadMainImage = async (file: File) => {
    setIsUploadingMain(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", ENV.CLOUDINARY_UPLOAD_PRESET);
      uploadData.append("folder", "products/main");

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${ENV.CLOUDINARY_CLOUD_NAME}/image/upload`,
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      form.setValue("image_url", response.data.secure_url, { shouldValidate: true });
      showSuccess("Upload successful", "Main image has been uploaded.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload image.";
      showError("Upload failed", message);
    } finally {
      setIsUploadingMain(false);
    }
  };

  const handleUploadAdditionalImages = async (files: FileList) => {
    setIsUploadingAdditional(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error("One or more files are not images.");
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("One or more files exceed 5MB.");
        }

        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("upload_preset", ENV.CLOUDINARY_UPLOAD_PRESET);
        uploadData.append("folder", "products/additional");

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${ENV.CLOUDINARY_CLOUD_NAME}/image/upload`,
          uploadData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        return response.data.secure_url as string;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const current = form.getValues("images_url") ?? [];
      form.setValue("images_url", [...current, ...uploadedUrls], { shouldValidate: true });
      showSuccess("Upload successful", `${uploadedUrls.length} additional image(s) uploaded.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload additional images.";
      showError("Upload failed", message);
    } finally {
      setIsUploadingAdditional(false);
      if (additionalFileInputRef.current) additionalFileInputRef.current.value = "";
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!id) {
      showError("Update failed", "Missing product ID.");
      return;
    }

    setIsSaving(true);
    try {
      await productApi.updateProduct(id, {
        SKU: values.SKU,
        name: values.name,
        description: values.description,
        content: values.content,
        image_url: values.image_url,
        images_url: values.images_url,
        min_price: values.min_price,
        max_price: values.max_price,
      });

      showSuccess("Update successful", "Product has been updated.");
      navigate("/admin/products");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update product.";
      showError("Update failed", message);
    } finally {
      setIsSaving(false);
    }
  });

  const additionalImages = form.watch("images_url") ?? [];
  const mainImage = form.watch("image_url");

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-12 flex justify-center">
      <div className="w-full max-w-6xl px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#7F5539]">Edit Product</h1>
          <p className="text-sm text-slate-500 mt-2">Update product details and pricing information.</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl border border-[#E6CCB2] shadow-sm p-10"
        >
          {isLoadingProduct ? (
            <p className="text-sm text-slate-500">Loading product...</p>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-800 mb-8">Product Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm font-medium text-slate-700">SKU</label>
                  <input
                    {...form.register("SKU")}
                    className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                    placeholder="COFFEE_001"
                  />
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.SKU?.message}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Product Name</label>
                  <input
                    {...form.register("name")}
                    className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                    placeholder="Cold Brew"
                  />
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.name?.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm font-medium text-slate-700">Min Price (VND)</label>
                  <input
                    type="number"
                    {...form.register("min_price")}
                    className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                  />
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.min_price?.message}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Max Price (VND)</label>
                  <input
                    type="number"
                    {...form.register("max_price")}
                    className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                  />
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.max_price?.message}</p>
                </div>
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  {...form.register("description")}
                  rows={3}
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                  placeholder="Write a short product description"
                />
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.description?.message}</p>
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-slate-700">Content</label>
                <Controller
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <CKEditorField
                      value={field.value}
                      onChange={field.onChange}
                      hasError={!!form.formState.errors.content}
                      placeholder="Write product details"
                    />
                  )}
                />
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.content?.message}</p>
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-slate-700">Main Image</label>
                <input
                  ref={mainFileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUploadMainImage(file);
                  }}
                />

                {mainImage ? (
                  <div className="mt-2 p-3 border border-slate-200 rounded-lg bg-slate-50 flex items-center gap-4">
                    <img src={mainImage} alt="Main" className="w-24 h-24 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => form.setValue("image_url", "", { shouldValidate: true })}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => mainFileInputRef.current?.click()}
                    disabled={isUploadingMain}
                    className="mt-2 h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm hover:bg-white"
                  >
                    {isUploadingMain ? "Uploading..." : "Upload main image"}
                  </button>
                )}
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.image_url?.message}</p>
              </div>

              <div className="mb-8">
                <label className="text-sm font-medium text-slate-700">Additional Images</label>
                <input
                  ref={additionalFileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  multiple
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      void handleUploadAdditionalImages(e.target.files);
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => additionalFileInputRef.current?.click()}
                  disabled={isUploadingAdditional}
                  className="mt-2 h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm hover:bg-white flex items-center gap-2"
                >
                  <Upload size={16} />
                  {isUploadingAdditional ? "Uploading..." : "Add images"}
                </button>

                {additionalImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {additionalImages.map((url, index) => (
                      <div key={`${url}-${index}`} className="relative">
                        <img src={url} alt={`Additional ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = additionalImages.filter((_, itemIndex) => itemIndex !== index);
                            form.setValue("images_url", filtered, { shouldValidate: true });
                          }}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 border border-slate-200"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoadingProduct || isSaving}
              className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] transition"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}