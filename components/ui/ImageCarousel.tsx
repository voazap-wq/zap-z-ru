import React, { useState, useEffect, useRef, useCallback } from 'react';
import IconButton from './IconButton';

interface ImageCarouselProps {
  images: {
    src: string;
    alt: string;
  }[];
  autoPlayInterval?: number; // in seconds
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, autoPlayInterval = 5 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  useEffect(() => {
    if (autoPlayInterval && images.length > 1) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(goToNext, autoPlayInterval * 1000);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, images.length, autoPlayInterval, goToNext]);

  if (!images || images.length === 0) {
    return (
        <div className="my-6 p-4 text-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500">Нет изображений для отображения.</p>
        </div>
    );
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="relative h-96 group my-6" aria-roledescription="carousel">
      <div className="w-full h-full rounded-lg overflow-hidden relative">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={index !== currentIndex}
          >
            <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between left-0 px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <IconButton
              onClick={goToPrevious}
              className="bg-black/40 hover:bg-black/60 text-white pointer-events-auto"
              aria-label="Предыдущий слайд"
            >
              <span className="material-icons">chevron_left</span>
            </IconButton>
            <IconButton
              onClick={goToNext}
              className="bg-black/40 hover:bg-black/60 text-white pointer-events-auto"
              aria-label="Следующий слайд"
            >
              <span className="material-icons">chevron_right</span>
            </IconButton>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, slideIndex) => (
              <button
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentIndex === slideIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                aria-label={`Перейти к слайду ${slideIndex + 1}`}
                aria-current={currentIndex === slideIndex}
              ></button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
