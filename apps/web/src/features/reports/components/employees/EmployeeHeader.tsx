import React from "react";

export const EmployeeHeader = () => {
    return (
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-cyan-950 text-4xl font-bold leading-9">
                    Thống kê Hiệu suất Nhân viên
                </h1>
            </div>
            <div className="text-cyan-950 text-xl opacity-70">
                Cập nhật: {new Date().toLocaleString("vi-VN")}
            </div>
        </div>
    );
};