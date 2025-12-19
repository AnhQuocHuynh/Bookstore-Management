import { ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const slides = [
    {
      image: "/image-5.jpg",
      quote:
        "Hệ thống quản lý này giúp chúng tôi theo dõi tồn kho nhanh chóng và chính xác hơn bao giờ hết.",
      author: "Nguyễn Thị Lan – Quản lý nhà sách A",
    },
    {
      image: "/image-6.jpg",
      quote:
        "Việc nhập – xuất hàng trở nên dễ dàng, tiết kiệm thời gian và tránh sai sót.",
      author: "Trần Văn Hùng – Nhân viên kho",
    },
    {
      image: "/image-7.jpg",
      quote:
        "Giao diện trực quan, dễ sử dụng, nhân viên mới cũng nhanh chóng làm quen.",
      author: "Phạm Thị Mai – Chủ nhà sách B",
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#E8F5F5]">
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Side - Form */}
        <div className="w-full md:w-2/5 flex items-center justify-center bg-[#E8F5F5] p-6 md:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Right Side - Carousel */}
        <div className="w-full md:w-3/5 relative h-64 md:h-full overflow-hidden">
          <Swiper
            modules={[Autoplay, EffectFade, Pagination]}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            allowTouchMove={false}
            loop
            speed={500}
            effect="fade"
            pagination={{
              clickable: true,
              bulletClass: "swiper-pagination-bullet !bg-white/50",
              bulletActiveClass: "swiper-pagination-bullet-active !bg-white",
            }}
            className="h-full w-full"
          >
            {slides.map((slide, idx) => (
              <SwiperSlide key={idx}>
                <div className="relative h-full w-full">
                  <img
                    src={slide.image}
                    alt={slide.author}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-12 text-white z-10">
                    <h2 className="text-2xl md:text-4xl font-semibold mb-4">
                      "{slide.quote}"
                    </h2>
                    <p className="text-lg md:text-2xl opacity-90">
                      — {slide.author}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};
