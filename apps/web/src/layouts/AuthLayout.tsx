import { ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

interface AuthLayoutProps {
  children: ReactNode;
}

const slides = [
  {
    quote:
      "Sách là nguồn tri thức vô tận, mở ra những chân trời mới cho tâm hồn",
    author: "Albert Einstein",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
  },
  {
    quote: "Đọc sách là cách tốt nhất để đầu tư vào bản thân",
    author: "Warren Buffett",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  },
  {
    quote: "Một cuốn sách hay là người bạn tốt của chúng ta",
    author: "Victor Hugo",
    image:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80",
  },
];

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="h-screen overflow-hidden bg-[#E8F5F5]">
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Side - Form */}
        <div className="w-full md:w-2/5 flex items-center justify-center bg-white p-6 md:p-12">
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
                <div className="relative h-full w-full select-none pointer-events-none">
                  <img
                    src={slide.image}
                    alt={slide.author}
                    className="absolute inset-0 w-full h-full object-cover select-none"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
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
