export const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-primary">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-base font-medium">Đang tải thông tin...</p>
    </div>
  </div>
)
