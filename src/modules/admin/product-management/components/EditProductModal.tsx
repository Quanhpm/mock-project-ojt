import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ImagePlus, LoaderCircle, Upload, X } from "lucide-react";
import type {
  Product,
  ProductUpdatePayload,
} from "../../../../types/product.types";
import { CKEditorField } from "@/components/ui";
import { useUpdateProduct } from "./hooks/useUpdateProduct";
import {
  DEFAULT_PRODUCT_FORM_VALUES,
  getProductFormDefaultValues,
  productFormSchema,
  toProductPayload,
  type ProductFormInput,
  type ProductFormValues,
} from "./productForm.schema";
import { useProductImageUpload } from "./hooks/useProductImageUpload";
import { CLOUDINARY_IMAGE_REQUIREMENT_TEXT } from "@/utils";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  product: Product | null;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function EditProductModal({
  isOpen,
  onClose,
  onUpdated,
  product,
  isLoading = false,
}: EditProductModalProps) {
  const { updateProduct, isUpdating, error: updateError } = useUpdateProduct();
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProductFormInput, undefined, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: "onChange",
    defaultValues: DEFAULT_PRODUCT_FORM_VALUES,
  });

  const {
    uploadMainImage,
    uploadGalleryImages,
    isUploadingMainImage,
    isUploadingGalleryImages,
  } = useProductImageUpload({
    setValue,
    getValues,
  });

  const canClose =
    !isUpdating && !isUploadingMainImage && !isUploadingGalleryImages;
  const mainImageUrl = useWatch({ control, name: "image_url" });
  const additionalImages = useWatch({ control, name: "images_url" }) ?? [];
  const hasTopping = useWatch({ control, name: "is_have_topping" });
  const minPrice = Number(useWatch({ control, name: "min_price" }));
  const maxPrice = Number(useWatch({ control, name: "max_price" }));
  const additionalImagesErrorMessage = Array.isArray(errors.images_url)
    ? errors.images_url.find((item) => item?.message)?.message
    : errors.images_url?.message;

  useEffect(() => {
    if (!isOpen) {
      reset(DEFAULT_PRODUCT_FORM_VALUES);
      return;
    }

    if (product) {
      // Sync fetched product data into RHF once the async detail request finishes.
      reset(getProductFormDefaultValues(product));
    }
  }, [isOpen, product, reset]);

  const handleClose = () => {
    if (!canClose) return;
    onClose();
  };

  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    void uploadMainImage(file).finally(() => {
      if (mainFileInputRef.current) {
        mainFileInputRef.current.value = "";
      }
    });
  };

  const handleAdditionalImagesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    void uploadGalleryImages(event.target.files).finally(() => {
      if (additionalFileInputRef.current) {
        additionalFileInputRef.current.value = "";
      }
    });
  };

  const removeMainImage = () => {
    setValue("image_url", "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = "";
    }
  };

  const removeAdditionalImage = (indexToRemove: number) => {
    setValue(
      "images_url",
      additionalImages.filter((_, index) => index !== indexToRemove),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (!product) return;

    const payload: ProductUpdatePayload = toProductPayload(values);
    const updated = await updateProduct(product.id, payload);

    if (!updated) return;

    onUpdated?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/45 p-5"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_40px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Product</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update the product information before saving it back to the
              backend.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={!canClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="overflow-y-auto px-6 py-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
              </div>
              <div className="space-y-4">
                <div className="h-52 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>
        ) : !product ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-500">
              <ImagePlus size={26} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Product data is unavailable
            </h3>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              The product could not be loaded for editing. Try opening it again
              from the list.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="overflow-y-auto overflow-x-hidden px-6 py-6">
              {updateError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {updateError}
                </div>
              )}

              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      Basic Information
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Keep the core product details in sync with the backend
                      payload.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        SKU *
                      </label>
                      <input
                        {...register("SKU")}
                        placeholder="COFFEE_01"
                        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#B08968] focus:bg-white"
                      />
                      {errors.SKU && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.SKU.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Product Name *
                      </label>
                      <input
                        {...register("name")}
                        placeholder="Espresso"
                        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#B08968] focus:bg-white"
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Minimum Price (VND) *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        {...register("min_price")}
                        placeholder="30000"
                        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#B08968] focus:bg-white"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Enter a whole number from 1000 to 100000.
                      </p>
                      {formatCurrency(minPrice) && (
                        <p className="mt-1 text-xs text-slate-600">
                          {formatCurrency(minPrice)}
                        </p>
                      )}
                      {errors.min_price && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.min_price.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Maximum Price (VND) *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        {...register("max_price")}
                        placeholder="45000"
                        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#B08968] focus:bg-white"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Enter a whole number from 1000 to 100000.
                      </p>
                      {formatCurrency(maxPrice) && (
                        <p className="mt-1 text-xs text-slate-600">
                          {formatCurrency(maxPrice)}
                        </p>
                      )}
                      {errors.max_price && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.max_price.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-medium text-slate-700">
                      Description *
                    </label>
                    <textarea
                      {...register("description")}
                      rows={4}
                      placeholder="Short product description"
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#B08968] focus:bg-white"
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 min-w-0">
                    <label className="text-sm font-medium text-slate-700">
                      Content *
                    </label>
                    <Controller
                      control={control}
                      name="content"
                      render={({ field }) => (
                        <div className="mt-2">
                          <CKEditorField
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter detailed HTML content here..."
                            hasError={!!errors.content}
                          />
                        </div>
                      )}
                    />
                    {errors.content && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.content.message}
                      </p>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      Media And Topping
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      The main image URL, additional image URLs, and topping are
                      all visible here without needing horizontal scrolling.
                    </p>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <label className="text-sm font-medium text-slate-700">
                        Main Image URL *
                      </label>
                      <input
                        {...register("image_url")}
                        placeholder="https://..."
                        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#B08968]"
                      />
                      {errors.image_url && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.image_url.message}
                        </p>
                      )}

                      <input
                        ref={mainFileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleMainImageChange}
                      />

                      {!mainImageUrl ? (
                        <button
                          type="button"
                          disabled={isUploadingMainImage}
                          onClick={() => mainFileInputRef.current?.click()}
                          className="mt-3 flex h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#DDB892] bg-white text-sm text-[#7F5539] transition hover:border-[#B08968] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUploadingMainImage ? (
                            <LoaderCircle
                              size={22}
                              className="mb-2 animate-spin"
                            />
                          ) : (
                            <Upload size={22} className="mb-2" />
                          )}
                          {isUploadingMainImage
                            ? "Uploading main image..."
                            : "Select a new main image"}
                        </button>
                      ) : (
                        <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <img
                            src={mainImageUrl}
                            alt="Main preview"
                            className="h-44 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeMainImage}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-slate-500">
                        {CLOUDINARY_IMAGE_REQUIREMENT_TEXT}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Additional Images URLs
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            One URL per line for `images_url`.
                          </p>
                        </div>
                      </div>

                      <input
                        ref={additionalFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleAdditionalImagesChange}
                      />
                      <button
                        type="button"
                        disabled={isUploadingGalleryImages}
                        onClick={() => additionalFileInputRef.current?.click()}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DDB892] bg-white px-4 text-sm font-medium text-[#7F5539] transition hover:bg-[#fdf7f2] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUploadingGalleryImages && (
                          <LoaderCircle size={16} className="animate-spin" />
                        )}
                        {isUploadingGalleryImages ? "Uploading..." : "Upload"}
                      </button>
                      <p className="mt-2 text-xs text-slate-500">
                        {CLOUDINARY_IMAGE_REQUIREMENT_TEXT}
                      </p>

                      <Controller
                        control={control}
                        name="images_url"
                        render={({ field }) => (
                          <textarea
                            value={(field.value ?? []).join("\n")}
                            onChange={(event) =>
                              field.onChange(
                                event.target.value
                                  .split("\n")
                                  .map((value) => value.trim())
                                  .filter(Boolean),
                              )
                            }
                            rows={5}
                            placeholder={"https://image-1.jpg\nhttps://image-2.jpg"}
                            className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#B08968]"
                          />
                        )}
                      />
                      {additionalImagesErrorMessage && (
                        <p className="mt-1 text-xs text-red-600">
                          {additionalImagesErrorMessage}
                        </p>
                      )}

                      {additionalImages.length > 0 ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {additionalImages.map((url, index) => (
                            <div
                              key={`${url}-${index}`}
                              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                            >
                              <img
                                src={url}
                                alt={`Additional ${index + 1}`}
                                className="h-24 w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeAdditionalImage(index)}
                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                          No additional images uploaded yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Has Topping
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Turn this on when the product supports toppings.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setValue("is_have_topping", !hasTopping, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className={`relative h-7 w-12 rounded-full transition ${
                          hasTopping ? "bg-[#8B4513]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                            hasTopping ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={!canClose}
                className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={
                  isUpdating ||
                  isLoading ||
                  isUploadingMainImage ||
                  isUploadingGalleryImages
                }
                className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-lg bg-[#8B4513] px-5 text-sm font-semibold text-white transition hover:bg-[#6d3610] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(isUpdating ||
                  isUploadingMainImage ||
                  isUploadingGalleryImages) && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
