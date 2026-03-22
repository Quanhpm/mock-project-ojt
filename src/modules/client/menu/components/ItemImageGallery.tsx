interface ItemImageGalleryProps {
  productName: string;
  images: string[];
  activeImg: number;
  onSelectImage: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

function ItemImageGallery({
  productName,
  images,
  activeImg,
  onSelectImage,
  onPrevious,
  onNext,
}: ItemImageGalleryProps) {
  return (
    <section className="md:col-span-3 w-full flex flex-col gap-3">
      <div className="w-full aspect-square rounded-[2rem] overflow-hidden bg-white relative">
        <img
          key={activeImg}
          src={images[activeImg]}
          alt={productName}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={onPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white transition cursor-pointer text-lg font-bold"
              type="button"
            >
              ‹
            </button>
            <button
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white transition cursor-pointer text-lg font-bold"
              type="button"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex flex-row gap-2 justify-center flex-wrap">
          {images.map((url, idx) => (
            <button
              key={url + idx}
              onClick={() => onSelectImage(idx)}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer flex-shrink-0 ${activeImg === idx ? 'border-[var(--cf-primary)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
              type="button"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default ItemImageGallery;
