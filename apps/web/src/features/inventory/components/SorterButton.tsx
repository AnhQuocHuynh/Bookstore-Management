import { useState, useRef, useEffect } from "react";

interface SorterButtonProps {
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  currentSort: string;
  currentSortOrder?: 'asc' | 'desc';
}

export const SorterButton: React.FC<SorterButtonProps> = ({
  onSortChange,
  currentSort,
  currentSortOrder = 'asc',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: "sku", label: "Mã hàng" },
    { value: "name", label: "Tên hàng" },
    { value: "stock", label: "Tồn kho" },
    { value: "sellingPrice", label: "Giá Bán" },
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  };

  const handleSelectOption = (value: string) => {
    onSortChange(value, currentSortOrder);
    setIsOpen(false);
  };

  const toggleSortOrder = () => {
    onSortChange(currentSort, currentSortOrder === 'asc' ? 'desc' : 'asc');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentLabel =
    sortOptions.find((opt) => opt.value === currentSort)?.label ||
    "Tên hàng";

  return (
    <div ref={dropdownRef} className="h-[58px] w-[360px] relative flex items-center gap-2">
      <button
        className="w-[300px] h-[37px] bg-white rounded-[20px] border-2 border-solid border-[#1a998f] cursor-pointer hover:bg-[#f0f9f8] transition-colors relative"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Sắp xếp theo: ${currentLabel}`}
        type="button"
      >
        <p className="absolute top-[calc(50.00%_-_8px)] left-4 right-10 h-[18px] flex items-center justify-start font-['Inter-Bold',Helvetica] font-bold text-[#102e3c] text-[15px] tracking-[0] leading-[normal] whitespace-nowrap pointer-events-none overflow-hidden text-ellipsis">
          Sắp xếp theo: {currentLabel}
        </p>

        <div className="absolute top-[calc(50.00%_-_12px)] right-1.5 w-6 h-6 rotate-[90.00deg] aspect-[1] pointer-events-none">
          <svg
            className="absolute w-[39.58%] h-[58.33%] top-[30.21%] left-[36.46%] rotate-[-90.00deg]"
            viewBox="0 0 48 48"
            fill="none"
          >
            <path d="M31 10H22L32 24L22 38H31L41 24L31 10Z" fill="#102E3C" />
          </svg>

          <svg
            className="absolute w-[39.58%] h-[58.33%] top-[30.21%] left-[7.29%] rotate-[-90.00deg]"
            viewBox="0 0 48 48"
            fill="none"
          >
            <path d="M17 10H8L18 24L8 38H17L27 24L17 10Z" fill="#102E3C" />
          </svg>
        </div>
      </button>

      {/* Sort Order Toggle Button */}
      <button
        className="w-[48px] h-[37px] bg-white rounded-[20px] border-2 border-solid border-[#1a998f] cursor-pointer hover:bg-[#f0f9f8] transition-colors flex items-center justify-center"
        onClick={toggleSortOrder}
        aria-label={currentSortOrder === 'asc' ? 'Sắp xếp tăng dần' : 'Sắp xếp giảm dần'}
        type="button"
      >
        {currentSortOrder === 'asc' ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M7 10L12 15L17 10H7Z" fill="#102E3C" />
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M7 14L12 9L17 14H7Z" fill="#102E3C" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute top-[calc(37px_+_2px)] left-0 w-[280px] bg-white rounded-[10px] border-2 border-solid border-[#1a998f] shadow-lg z-50"
          role="listbox"
        >
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className="w-full px-4 py-2 text-left hover:bg-[#d4e5e480] transition-colors cursor-pointer border-none bg-transparent font-['Inter-Bold',Helvetica] font-bold text-[#102e3c] text-[14px] first:rounded-t-[8px] last:rounded-b-[8px]"
              onClick={() => handleSelectOption(option.value)}
              role="option"
              aria-selected={currentSort === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
