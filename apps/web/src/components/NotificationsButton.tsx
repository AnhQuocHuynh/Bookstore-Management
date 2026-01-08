import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGetNotifications } from "@/hooks/use-get-notifications";
import Loading from "@/components/Loading";
import { UserNotification } from "@/types/notification";

interface Notification {
  id: number;
  content: string;
  read: boolean;
}

export default function NotificationsButton() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useGetNotifications(user?.id ?? "");

  const notifications: UserNotification[] = data ?? [];

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const displayedNotifications =
    activeTab === "unread" ? unreadNotifications : readNotifications;

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="default"
        className="relative h-10 w-10 p-0 rounded-full bg-[#187F87] hover:bg-[#1AA79F] transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-white" />

        {/* Unread badge */}
        {unreadNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-red-500 text-xs text-white flex items-center justify-center px-1">
            {unreadNotifications.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-92 rounded-xl bg-white shadow-xl border border-gray-100 z-50">
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b">
                <h3 className="text-sm font-semibold text-gray-800">
                  Thông báo
                </h3>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 px-3 py-2">
                <button
                  className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition
                ${
                  activeTab === "unread"
                    ? "bg-[#187F87] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                  onClick={() => setActiveTab("unread")}
                >
                  Chưa đọc
                </button>
                <button
                  className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition
                ${
                  activeTab === "read"
                    ? "bg-[#187F87] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                  onClick={() => setActiveTab("read")}
                >
                  Đã đọc
                </button>
              </div>

              {/* Notification List */}
              <ScrollArea
                className={`${displayedNotifications.length > 0 ? "h-[220px]" : "h-[90px]"} px-2 pb-2`}
              >
                {displayedNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                    Không có thông báo
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {displayedNotifications.map((note) => (
                      <li
                        key={note.id}
                        className={`group rounded-lg px-3 py-2 cursor-pointer transition
            ${
              !note.isRead
                ? "bg-emerald-50 hover:bg-emerald-100"
                : "hover:bg-gray-50"
            }`}
                      >
                        <div className="flex items-start gap-2">
                          {!note.isRead && (
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-[#187F87]" />
                          )}

                          <div className="flex-1 space-y-1">
                            {/* Title */}
                            <p className="text-sm font-medium text-gray-800">
                              {note.notification.title}
                            </p>

                            {/* Content lines */}
                            {note.content.map((line, index) => (
                              <p
                                key={index}
                                className="text-xs text-gray-600 leading-snug"
                              >
                                {line}
                              </p>
                            ))}

                            {/* Time */}
                            <p className="text-[11px] text-gray-400">
                              {new Date(note.createdAt).toLocaleString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </>
          )}
        </div>
      )}
    </div>
  );
}
