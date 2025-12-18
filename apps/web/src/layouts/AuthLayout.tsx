import { Layout } from "antd";
import { ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

const { Content } = Layout;

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
    <Layout className="h-screen overflow-hidden">
      <Content className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-2/5 flex items-center justify-center bg-white p-6 md:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <div className="w-full md:w-3/5 relative h-64 md:h-full overflow-hidden">
          <Swiper
            modules={[Autoplay, EffectFade, Navigation, Pagination]}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            allowTouchMove={false}
            loop
            speed={500}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            pagination={{ clickable: true }}
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
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-12 text-white">
                    <h2 className="text-2xl md:text-4xl font-semibold mb-4 animate-fade-in">
                      "{slide.quote}"
                    </h2>
                    <p className="text-lg md:text-2xl opacity-90 animate-fade-in delay-200">
                      — {slide.author}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Content>
    </Layout>
  );
};
