export const DashboardPage = () => {
  const store = {
    name: "Nhà sách BookFlow",
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    phone: "0909 123 456",
    slogan: "Quản lý nhà sách nội bộ hiệu quả",
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Tiêu đề tổng quan */}
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#102E3C]">
        Tổng quan hôm nay
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Doanh thu */}
        <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-[#1A998F]">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-[#155665]">Doanh thu</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A998F]/20 text-[#1A998F]">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#102E3C]">$1,250.75</p>
          <p className="text-base font-medium text-[#078830]">
            +5.2% so với hôm qua
          </p>
        </div>

        {/* Số sách đã bán */}
        <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-[#1A998F]">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-[#155665]">Sách đã bán</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A998F]/20 text-[#1A998F]">
              <span className="material-symbols-outlined">sell</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#102E3C]">86</p>
          <p className="text-base font-medium text-[#078830]">
            +1.5% so với hôm qua
          </p>
        </div>

        {/* Đơn hàng mới */}
        <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-[#1A998F]">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-[#155665]">Đơn hàng mới</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A998F]/20 text-[#1A998F]">
              <span className="material-symbols-outlined">shopping_cart</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#102E3C]">12</p>
          <p className="text-base font-medium text-[#078830]">
            +8.0% so với hôm qua
          </p>
        </div>

        {/* Cảnh báo tồn kho thấp */}
        <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-[#1A998F]">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-[#155665]">
              Cảnh báo tồn kho thấp
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e73108]/20 text-[#e73108]">
              <span className="material-symbols-outlined">warning</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#102E3C]">5</p>
          <p className="text-base font-medium text-[#e73108]">Cần chú ý</p>
        </div>
      </div>
    </div>
  );
};
