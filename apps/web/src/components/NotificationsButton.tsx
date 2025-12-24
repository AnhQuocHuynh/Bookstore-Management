import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface Notification {
  id: number;
  content: string;
  read: boolean;
}

export default function NotificationsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications: Notification[] = [
    { id: 1, content: "Đơn hàng #123 đã được tạo", read: false },
    { id: 2, content: "Sách 'React Guide' sắp hết hàng", read: false },
    { id: 3, content: "Nhân viên mới đã đăng ký", read: true },
  ];

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayedNotifications =
    activeTab === "unread" ? unreadNotifications : readNotifications;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="default"
        className="h-10 w-10 p-0 rounded-full bg-[#187F87] hover:bg-[#1AA79F] hover:shadow-md transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-white" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white shadow-lg z-50">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "unread"
                  ? "border-b-2 border-[#187F87] text-[#187F87]"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("unread")}
            >
              Chưa đọc
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "read"
                  ? "border-b-2 border-[#187F87] text-[#187F87]"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("read")}
            >
              Đã đọc
            </button>
          </div>

          {/* Notification List */}
          <ul className="max-h-60 overflow-y-auto">
            {displayedNotifications.length === 0 ? (
              <li className="px-4 py-2 text-sm text-gray-400">
                Không có thông báo
              </li>
            ) : (
              displayedNotifications.map((note) => (
                <li
                  key={note.id}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  {note.content}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
