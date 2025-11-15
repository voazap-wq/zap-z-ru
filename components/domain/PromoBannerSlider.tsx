import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import IconButton from '../ui/IconButton';

const PromoBannerSlider: React.FC = () => {
    const { siteSettings } = useAppContext();
    const { promoBanners = [], promoBannerSpeed = 5, promoBannerHeight = 320 } = siteSettings;
    
    const enabledBanners = promoBanners.filter(b => b.enabled && b.imageUrl);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const goToNext = useCallback(() => {
        setCurrentIndex((prevIndex) =>
            prevIndex === enabledBanners.length - 1 ? 0 : prevIndex + 1
        );
    }, [enabledBanners.length]);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        if (enabledBanners.length > 1) {
            timeoutRef.current = setTimeout(goToNext, promoBannerSpeed * 1000);
        }
        return () => {
            resetTimeout();
        };
    }, [currentIndex, enabledBanners.length, promoBannerSpeed, goToNext]);

    if (enabledBanners.length === 0) {
        return null;
    }

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? enabledBanners.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };
    
    const currentBanner = enabledBanners[currentIndex];

    const BannerImage = () => (
        <div
            className="w-full h-full bg-cover bg-center rounded-lg transition-all duration-500"
            style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
            aria-label="Рекламный баннер"
        ></div>
    );
    
    return (
        <section 
            className="relative group"
            style={{ height: `${promoBannerHeight}px` }}
            aria-label="Промо-баннеры"
        >
            <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
                {currentBanner.linkUrl && currentBanner.linkUrl !== '#' ? (
                    <a href={currentBanner.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <BannerImage />
                    </a>
                ) : (
                    <BannerImage />
                )}
            </div>

            {enabledBanners.length > 1 && (
                <>
                    {/* Arrows */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between left-0 px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <IconButton
                            onClick={goToPrevious}
                            className="bg-black/40 hover:bg-black/60 text-white pointer-events-auto"
                            aria-label="Предыдущий баннер"
                        >
                            <span className="material-icons">chevron_left</span>
                        </IconButton>
                        <IconButton
                            onClick={goToNext}
                            className="bg-black/40 hover:bg-black/60 text-white pointer-events-auto"
                            aria-label="Следующий баннер"
                        >
                            <span className="material-icons">chevron_right</span>
                        </IconButton>
                    </div>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {enabledBanners.map((_, slideIndex) => (
                            <button
                                key={slideIndex}
                                onClick={() => goToSlide(slideIndex)}
                                className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentIndex === slideIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                                aria-label={`Перейти к баннеру ${slideIndex + 1}`}
                            ></button>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default PromoBannerSlider;