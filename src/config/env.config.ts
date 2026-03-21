export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'https://ecommerce-franchise-training-nodejs.vercel.app/api',
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'de2dyvcb7',
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'OJT_MOCKPROJECT',
} as const;
