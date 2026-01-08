import React from "react";

interface ActionButtonProps {
  label: string;
  variant: "filled" | "outlined";
  onClick?: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  variant,
  onClick,
}) => (
  <div className="h-[58px] w-[125px] relative">
    <button
      type="button"
      onClick={onClick}
      className={`absolute top-[calc(50.00%_-_18px)] left-[calc(50.00%_-_56px)] w-[111px] h-[37px] ${
        variant === "filled"
          ? "bg-[#32b8ad]"
          : "bg-[#102e3c] border-2 border-solid border-[#32b8ad]"
      } rounded-[133.33px] flex items-center justify-center hover:opacity-90 transition-opacity`}
      aria-label={label}
    >
      <span className="font-bold text-white text-[15px] text-center tracking-[0] leading-[normal]">
        {label}
      </span>
    </button>
  </div>
);
