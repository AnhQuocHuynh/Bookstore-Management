import React from "react";

interface DetailRowProps {
  label: string;
  value?: string | number;
  isMultiline?: boolean;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  isMultiline = false,
}) => (
  <div
    className={`relative self-stretch w-full ${
      isMultiline ? "h-[108px]" : "h-[54px]"
    }`}
  >
    <div
      className={`absolute ${
        isMultiline ? "top-0" : "top-[-11px]"
      } left-0 w-[383px] h-[54px] flex items-center justify-start font-normal text-black text-xl tracking-[0] leading-[normal]`}
    >
      {label}
    </div>
    {isMultiline ? (
      <p className="absolute top-0 right-0 w-[383px] h-[108px] flex items-center justify-end font-normal text-black text-xl text-right tracking-[0] leading-[normal] whitespace-pre-line">
        {value ?? "--"}
      </p>
    ) : (
      <div
        className={`absolute ${
          isMultiline ? "top-0" : "top-[-11px]"
        } right-0 w-[383px] h-[54px] flex items-center justify-end font-normal text-black text-xl text-right tracking-[0] leading-[normal]`}
      >
        {value ?? "--"}
      </div>
    )}
  </div>
);
