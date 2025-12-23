/**
 * Sample data for testing registration and login
 * These are example credentials for development/testing purposes
 */

export interface SampleOwnerData {
  // Store Info
  storeName: string;
  storePhoneNumber: string;
  storeAddress: string;
  
  // Owner Info
  fullName: string;
  email: string;
  phoneNumber: string;
  birthDate: string; // YYYY-MM-DD format
  address: string;
  
  // Security
  password: string;
}

export const SAMPLE_OWNERS: SampleOwnerData[] = [
  {
    // Sample Owner 1
    storeName: "Nhà Sách Vạn Kim",
    storePhoneNumber: "+84393873630",
    storeAddress: "123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    fullName: "Nguyễn Văn Anh",
    email: "owner1@bookstore.com",
    phoneNumber: "+84393873631",
    birthDate: "1990-05-15",
    address: "456 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    password: "Password123@",
  },
  {
    // Sample Owner 2
    storeName: "Nhà Sách Phương Nam",
    storePhoneNumber: "+84393873632",
    storeAddress: "789 Đường Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh",
    fullName: "Trần Thị Bình",
    email: "owner2@bookstore.com",
    phoneNumber: "+84393873633",
    birthDate: "1988-08-20",
    address: "321 Đường Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh",
    password: "Password123@",
  },
  {
    // Sample Owner 3
    storeName: "Nhà Sách Fahasa",
    storePhoneNumber: "+84393873634",
    storeAddress: "111 Đường Võ Văn Tần, Quận 3, TP. Hồ Chí Minh",
    fullName: "Lê Hoàng Cường",
    email: "owner3@bookstore.com",
    phoneNumber: "+84393873635",
    birthDate: "1992-12-10",
    address: "222 Đường Điện Biên Phủ, Quận Bình Thạnh, TP. Hồ Chí Minh",
    password: "Password123@",
  },
  {
    // Sample Owner 4
    storeName: "Nhà Sách Thành Nghĩa",
    storePhoneNumber: "+84393873636",
    storeAddress: "333 Đường Đồng Khởi, Quận 1, TP. Hồ Chí Minh",
    fullName: "Phạm Thị Dung",
    email: "owner4@bookstore.com",
    phoneNumber: "+84393873637",
    birthDate: "1985-03-25",
    address: "444 Đường Lý Tự Trọng, Quận 1, TP. Hồ Chí Minh",
    password: "Password123@",
  },
  {
    // Sample Owner 5
    storeName: "Nhà Sách Đông Tây",
    storePhoneNumber: "+84393873638",
    storeAddress: "555 Đường Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh",
    fullName: "Hoàng Văn Em",
    email: "owner5@bookstore.com",
    phoneNumber: "+84393873639",
    birthDate: "1995-07-30",
    address: "666 Đường Lê Văn Việt, Quận 9, TP. Hồ Chí Minh",
    password: "Password123@",
  },
];

/**
 * Get random sample owner data
 */
export function getRandomSampleOwner(): SampleOwnerData {
  const randomIndex = Math.floor(Math.random() * SAMPLE_OWNERS.length);
  return SAMPLE_OWNERS[randomIndex];
}

/**
 * Get sample owner by index (0-based)
 */
export function getSampleOwner(index: number): SampleOwnerData {
  return SAMPLE_OWNERS[index % SAMPLE_OWNERS.length];
}

