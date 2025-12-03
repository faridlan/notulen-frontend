import { X } from "lucide-react";

interface Props {
  open: boolean;
  images: string[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ImageLightbox({
  open,
  images,
  index,
  onClose,
  onNext,
  onPrev,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center">
      {/* Close Button */}
      <button
        className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full"
        onClick={onClose}
      >
        <X size={24} />
      </button>

      {/* Main Image */}
      <img
        src={images[index]}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-lg"
      />

      {/* LEFT BUTTON */}
      <button
        onClick={onPrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full"
      >
        ❮
      </button>

      {/* RIGHT BUTTON */}
      <button
        onClick={onNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full"
      >
        ❯
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 flex gap-2">
        {images.map((_, idx) => (
          <div
            key={idx}
            onClick={() => onNext()}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              index === idx ? "bg-white" : "bg-white/40"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
