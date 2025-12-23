// import React, { useState } from "react";
// import vector5 from "./icon-logo.svg";
// import vector6 from "./icon-dashboard.svg";
// import vector7 from "./icon-transaction.svg";
// import vector8 from "./icon-import.svg";
// import vector9 from "./icon-product.svg";
// import vector10 from "./icon-customer.svg";
// import vector11 from "./icon-staff.svg";
// import vector12 from "./icon-provider.svg";
// import vector13 from "./icon-history.svg";
// import vector14 from "./icon-statistics.svg";
// import vector15 from "./icon-setting.svg";

// export const SidebarSection = (): React.ReactElement => {
//   const [activeMenu, setActiveMenu] = useState("Nhân viên");
//   const [expandedMenu, setExpandedMenu] = useState("Nhân viên");

//   const menuItems = [
//     { id: "overview", label: "Tổng quan", icon: vector6, hasSubmenu: false },
//     {
//       id: "transactions",
//       label: "Giao dịch",
//       icon: vector7,
//       hasSubmenu: false,
//     },
//     {
//       id: "import",
//       label: "Nhập hàng",
//       icon: vector8,
//       hasSubmenu: false,
//     },
//     { id: "products", label: "Sản Phẩm", icon: vector9, hasSubmenu: false },
//     { id: "customers", label: "Khách hàng", icon: vector10, hasSubmenu: false },
//     {
//       id: "employees",
//       label: "Nhân viên",
//       icon: vector11,
//       hasSubmenu: true,
//       submenuItems: [
//         { id: "employee-list", label: "Danh sách nhân viên" },
//         { id: "schedule", label: "Thời gian biểu" },
//       ],
//     },
//     {
//       id: "suppliers",
//       label: "Nhà cung cấp",
//       icon: vector12,
//       hasSubmenu: false,
//     },
//     {
//       id: "activity",
//       label: "Lịch sử hoạt động",
//       icon: vector13,
//       hasSubmenu: false,
//     },
//     { id: "statistics", label: "Thống kê", icon: vector14, hasSubmenu: false },
//   ];

//   const handleMenuClick = (menuId: string) => {
//     setActiveMenu(menuId);
//     if (menuItems.find((item) => item.id === menuId)?.hasSubmenu) {
//       setExpandedMenu(expandedMenu === menuId ? "" : menuId);
//     }
//   };

//   const handleSubmenuClick = (submenuId: string) => {
//     setActiveMenu(submenuId);
//   };

//   return (
//     <nav
//       className="flex flex-col max-w-[250px] w-[250px] items-start justify-between p-4 relative self-stretch bg-[#102e3c]"
//       role="navigation"
//       aria-label="Main navigation"
//     >
//       <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
//         <header className="flex h-[52px] items-center gap-3 px-3 py-0 relative self-stretch w-full">
//           <div
//             className="flex w-10 h-10 items-center justify-center relative bg-[#1a998f] rounded-full"
//             aria-hidden="true"
//           >
//             <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
//               <div className="relative w-[28.02px] h-[34px]">
//                 <img
//                   className="absolute w-[91.67%] h-[54.94%] top-[22.53%] left-[4.17%]"
//                   alt=""
//                   src={vector5}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
//             <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
//               <h1 className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-white text-base tracking-[0] leading-6 whitespace-nowrap">
//                 BookFlow
//               </h1>
//             </div>

//             <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
//               <p className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-gray-300 text-sm tracking-[0] leading-[21px] whitespace-nowrap">
//                 Quản lý
//               </p>
//             </div>
//           </div>
//         </header>

//         <ul className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
//           {menuItems.map((item) => (
//             <li key={item.id} className="w-full">
//               <button
//                 onClick={() => handleMenuClick(item.id)}
//                 className={`flex w-[218px] items-center gap-3 px-4 py-2 relative flex-[0_0_auto] ${
//                   activeMenu === item.id && !item.hasSubmenu
//                     ? "bg-[#1a998f]"
//                     : ""
//                 } ${
//                   expandedMenu === item.id && item.hasSubmenu
//                     ? "bg-[#1a998f]"
//                     : ""
//                 } hover:bg-[#1a998f] hover:bg-opacity-60 transition-colors`}
//                 aria-expanded={
//                   item.hasSubmenu ? expandedMenu === item.id : undefined
//                 }
//                 aria-current={activeMenu === item.id ? "page" : undefined}
//               >
//                 {item.id === "transactions" ? (
//                   <div className="relative -left-2 w-[117px] h-11 flex items-center gap-3">
//                     <div className="inline-flex h-7 w-[24.02px] relative ml-6 flex-col items-start">
//                       <div className="relative w-[24.02px] h-7">
//                         <img
//                           className="absolute w-[72.86%] h-[69.44%] top-[15.28%] left-[13.57%]"
//                           alt=""
//                           src={item.icon}
//                         />
//                       </div>
//                     </div>

//                     <div className="inline-flex mt-px h-[21px] w-16 relative flex-col items-start">
//                       <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-[21px] whitespace-nowrap">
//                         {item.label}
//                       </span>
//                     </div>
//                   </div>
//                 ) : item.id === "import" ? (
//                   <>
//                     <div className="relative w-6 h-7">
//                       <div className="relative w-[75.00%] h-[75.00%] top-[12.50%] left-[12.50%]">
//                         <img
//                           className="absolute w-full h-full top-[-4.76%] left-[-5.56%]"
//                           alt=""
//                           src={item.icon}
//                         />
//                       </div>
//                     </div>

//                     <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
//                       <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-[21px] whitespace-nowrap">
//                         {item.label}
//                       </span>
//                     </div>
//                   </>
//                 ) : item.id === "activity" ? (
//                   <>
//                     <div className="relative w-6 h-7">
//                       <img
//                         className="absolute w-[75.00%] h-[75.00%] top-[12.50%] left-[12.50%]"
//                         alt=""
//                         src={item.icon}
//                       />
//                     </div>

//                     <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
//                       <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-[21px] whitespace-nowrap">
//                         {item.label}
//                       </span>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
//                       <div className="relative w-[24.02px] h-7">
//                         <img
//                           className={`absolute ${
//                             item.id === "overview"
//                               ? "w-[72.86%] h-[62.50%] top-[18.75%] left-[13.57%]"
//                               : item.id === "products" ||
//                                   item.id === "suppliers"
//                                 ? "w-[89.05%] h-[55.56%] top-[22.22%] left-[5.48%]"
//                                 : item.id === "customers"
//                                   ? "w-[97.14%] h-[41.67%] top-[29.17%] left-0"
//                                   : item.id === "employees" ||
//                                       item.id === "statistics"
//                                     ? "w-[80.95%] h-[69.44%] top-[15.28%] left-[9.52%]"
//                                     : ""
//                           }`}
//                           alt=""
//                           src={item.icon}
//                         />
//                       </div>
//                     </div>

//                     <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
//                       <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-[21px] whitespace-nowrap">
//                         {item.label}
//                       </span>
//                     </div>

//                     {item.hasSubmenu && expandedMenu === item.id && (
//                       <div className="absolute top-[calc(50.00%_-_8px)] -left-2 w-2 h-4 border-t-8 [border-top-style:solid] border-b-8 [border-bottom-style:solid] border-l-8 [border-left-style:solid] border-transparent [border-image:linear-gradient(to_bottom_right,rgba(196,207,206,1)_0%,rgba(0,0,0,0)_50%)_bottom_right_/_50%_50%_no-repeat,linear-gradient(to_bottom_left,rgba(196,207,206,1)_0%,rgba(0,0,0,0)_50%)_bottom_left_/_50%_50%_no-repeat,linear-gradient(to_top_left,rgba(196,207,206,1)_0%,rgba(0,0,0,0)_50%)_top_left_/_50%_50%_no-repeat,linear-gradient(to_top_right,rgba(196,207,206,1)_0%,rgba(0,0,0,0)_50%)_top_right_/_50%_50%_no-repeat_1]" />
//                     )}
//                   </>
//                 )}
//               </button>

//               {item.hasSubmenu && expandedMenu === item.id && (
//                 <ul className="flex flex-col w-[218px] items-start">
//                   {item.submenuItems?.map((subitem) => (
//                     <li key={subitem.id} className="w-full">
//                       <button
//                         onClick={() => handleSubmenuClick(subitem.id)}
//                         className={`relative w-[218px] h-11 ${
//                           activeMenu === subitem.id
//                             ? "bg-[#1a998f] opacity-40"
//                             : ""
//                         } hover:bg-[#1a998f] hover:opacity-40 transition-colors`}
//                         aria-current={
//                           activeMenu === subitem.id ? "page" : undefined
//                         }
//                       >
//                         <div className="absolute top-[calc(50.00%_-_14px)] left-[72px] w-[146px] h-7">
//                           <span className="absolute top-[calc(50.00%_-_10px)] left-0 w-[146px] h-[21px] flex items-center justify-center [font-family:'Inter-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-[21px]">
//                             {subitem.label}
//                           </span>
//                         </div>
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>

//       <button className="flex items-center gap-3 px-4 py-2 relative self-stretch w-full flex-[0_0_auto] hover:bg-[#1a998f] hover:bg-opacity-60 transition-colors">
//         <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
//           <div className="relative w-[24.02px] h-7">
//             <img
//               className="absolute w-[81.36%] h-[69.44%] top-[15.28%] left-[9.32%]"
//               alt=""
//               src={vector15}
//             />
//           </div>
//         </div>

//         <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
//           <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-[21px] whitespace-nowrap">
//             Cài đặt
//           </span>
//         </div>
//       </button>
//     </nav>
//   );
// };