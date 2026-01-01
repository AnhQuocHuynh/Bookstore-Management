import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="BookFlow Logo"
          className="mx-auto mb-6 h-16 object-contain"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          404 – Không tìm thấy trang
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Đường dẫn bạn truy cập không tồn tại trong hệ thống quản lý sách
          <span className="font-medium text-emerald-600"> BookFlow</span>.
        </p>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            Về Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Quay lại
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-400">
          © {new Date().getFullYear()} BookFlow
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
