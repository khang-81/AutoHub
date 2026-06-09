import { useState } from 'react';
import type { Car, CarImageItem } from '../../types';
import { CAR_PLACEHOLDER } from '../../utils/helpers';

export function getCarGallery(car: Car): CarImageItem[] {
  if (car.images?.length) {
    return [...car.images].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  if (car.imagePath) {
    return [{ imageUrl: car.imagePath, imageType: 'EXTERIOR', sortOrder: 1 }];
  }
  return [{ imageUrl: CAR_PLACEHOLDER, imageType: 'EXTERIOR', sortOrder: 1 }];
}

const typeLabel: Record<string, string> = {
  EXTERIOR: 'Ngoại thất',
  INTERIOR: 'Nội thất',
};

interface CarGalleryProps {
  car: Car;
  title?: string;
  className?: string;
}

const CarGallery = ({ car, title, className = '' }: CarGalleryProps) => {
  const images = getCarGallery(car);
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className={`sale-gallery ${className}`}>
      <div className="relative">
        <img
          src={current?.imageUrl || CAR_PLACEHOLDER}
          alt={title ?? 'Ảnh xe'}
          className="sale-gallery__img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
          }}
        />
        {current?.imageType && (
          <span className="sale-gallery__type-badge">
            {typeLabel[current.imageType] ?? current.imageType}
          </span>
        )}
        {images.length > 1 && (
          <span className="sale-gallery__counter">
            {active + 1} / {images.length}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="sale-gallery__thumbs">
          {images.map((img, i) => (
            <button
              key={`${img.sortOrder}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`sale-gallery__thumb ${active === i ? 'sale-gallery__thumb--active' : ''}`}
              title={typeLabel[img.imageType] ?? img.imageType}
            >
              <img
                src={img.imageUrl}
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                }}
              />
              <span className="sale-gallery__thumb-label">
                {typeLabel[img.imageType] ?? img.imageType}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarGallery;
