interface ErrorScreenProps {
  message: string
}

export const ErrorScreen = ({ message }: ErrorScreenProps) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-red-500">
      <span className="material-symbols-outlined text-5xl">error</span>
      <p className="text-base font-medium">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 rounded-xl bg-primary text-white font-semibold"
      >
        Thử lại
      </button>
    </div>
  </div>
)
