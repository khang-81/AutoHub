import { Link } from 'react-router-dom';
import { Calendar, Gauge, Fuel, Star } from 'lucide-react';
import type { Car } from '../../types';
import { formatCurrency, CAR_PLACEHOLDER } from '../../utils/helpers';

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  return (
    <div className="card group overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden h-52 bg-gray-100">
        <img
          src={car.imagePath || CAR_PLACEHOLDER}
          alt={`${car.model?.brand?.name} ${car.model?.name}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
          }}
        />
        <div className="absolute top-3 left-3">
          <span className="badge bg-navy text-white text-xs">
            {car.model?.brand?.name}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="text-xs font-semibold text-gray-700">4.8</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-heading font-semibold text-navy text-lg mb-1 truncate">
          {car.model?.brand?.name} {car.model?.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4">{car.color?.name} • {car.modelYear}</p>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-xl">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs text-gray-500 text-center">{car.modelYear}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-xl">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="text-xs text-gray-500 text-center">
              {(car.kilometer / 1000).toFixed(0)}k km
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-xl">
            <Fuel className="w-4 h-4 text-primary" />
            <span className="text-xs text-gray-500 text-center">Xăng</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-heading font-bold text-primary text-xl">
              {formatCurrency(car.dailyPrice)}
            </span>
            <span className="text-gray-400 text-sm">/ngày</span>
          </div>
          <Link
            to={`/cars/${car.id}`}
            className="btn-primary !py-2 !px-4 !text-sm"
          >
            Thuê ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
