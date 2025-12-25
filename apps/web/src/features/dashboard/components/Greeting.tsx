import React from "react";

interface GreetingProps {
  user?: {
    name: string;
    role: string; // tiếng Anh: "OWNER", "MANAGER", "STAFF"
  };
}

const roleColors: Record<string, string> = {
  OWNER: "#e73108", // đỏ cam
  MANAGER: "#1A998F", // xanh đậm
  STAFF: "#2a9d8f", // xanh nhạt
};

export const Greeting: React.FC<GreetingProps> = ({ user }) => {
  const nameColor = user ? roleColors[user.role] || "#102E3C" : "#102E3C";

  return (
    <div className="mb-4 flex flex-wrap items-baseline gap-2">
      <span className="text-lg sm:text-xl font-bold text-[#102E3C]">
        Chào mừng quay trở lại,
      </span>
      {user && (
        <span
          className="text-xl sm:text-2xl font-bold"
          style={{ color: nameColor }}
        >
          {user.name}!
        </span>
      )}
    </div>
  );
};
