import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] px-4">
      <div className="text-center max-w-md">
        {/* Code */}
        <h1 className="text-7xl font-extrabold text-red-600">404</h1>

        {/* Title */}
        <h2 className="mt-4 text-2xl font-semibold text-slate-800">Page Not Found</h2>

        {/* Description */}
        <p className="mt-3 text-slate-500">Sorry, the page you are looking for doesn’t exist or has been moved.</p>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/" className="rounded bg-red-600 px-5 py-2 text-white font-medium hover:bg-red-700">
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="rounded border border-slate-300 px-5 py-2 text-slate-700 hover:bg-slate-100"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
