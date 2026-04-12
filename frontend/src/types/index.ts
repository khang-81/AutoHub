// ─── Auth ───────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  roles: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    userId: number;
    email: string;
    roles: string[];
  };
}

export interface AuthResult {
  success: boolean;
  message: string;
  data?: string; // JWT token
}

// ─── Brand ──────────────────────────────────────────────────────────────────
export interface Brand {
  id: number;
  name: string;
}

// ─── Model ──────────────────────────────────────────────────────────────────
export interface CarModel {
  id: number;
  name: string;
  brand: Brand;
}

// ─── Color ──────────────────────────────────────────────────────────────────
export interface Color {
  id: number;
  name: string;
}

// ─── Car ────────────────────────────────────────────────────────────────────
export type ListingType = 'RENT_ONLY' | 'SALE_ONLY' | 'BOTH';

export interface Car {
  id: number;
  modelYear: number;
  serviceCity?: string;
  averageRating?: number;
  reviewCount?: number;
  plate: string;
  minFindeksRate: number;
  kilometer: number;
  dailyPrice: number;
  listingType?: ListingType | string;
  salePrice?: number | null;
  saleStatus?: string | null;
  imagePath: string;
  model: CarModel;
  color: Color;
}

export interface AddCarRequest {
  kilometer: number;
  plate: string;
  modelYear: number;
  dailyPrice?: number;
  listingType?: ListingType | string;
  salePrice?: number | null;
  modelId: number;
  colorId: number;
  minFindeksRate: number;
  imagePath: string;
}

export interface UpdateCarRequest extends AddCarRequest {
  id: number;
}

// ─── Customer ────────────────────────────────────────────────────────────────
export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  birthdate: string;
  internationalId: string;
  licenceIssueDate: string;
  userId: number;
}

export interface AddCustomerRequest {
  firstName: string;
  lastName: string;
  birthdate: string;
  internationalId: string;
  licenceIssueDate: string;
  userId: number;
}

export interface UpdateCustomerRequest extends AddCustomerRequest {
  id: number;
}

// ─── CorporateCustomer ───────────────────────────────────────────────────────
export interface CorporateCustomer {
  id: number;
  companyName: string;
  taxNo: string;
  userId: number;
}

// ─── Rental ──────────────────────────────────────────────────────────────────
export interface Rental {
  id: number;
  startDate: string;
  endDate: string;
  returnDate: string | null;
  startKilometer: number;
  totalPrice: number;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER';
  paymentStatus?: 'PENDING_TRANSFER' | 'PENDING_CONFIRM' | 'PAID' | 'UNPAID' | 'FAILED' | 'CANCELLED';
  rentalStatus?: 'PENDING_PAYMENT' | 'PENDING_ADMIN_CONFIRM' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  depositAmount?: number;
  depositStatus?: string;
  insuranceCode?: string;
  insuranceFeeAmount?: number;
  extraFeesAmount?: number;
  pickupDistrict?: string;
  car: Car;
  user: User;
}

export interface AddRentalRequest {
  startDate: string;
  endDate: string;
  carId: number;
  userId: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
  insuranceCode?: string;
  extraFeesAmount?: number;
  pickupDistrict?: string;
}

export interface AddRentalResponse {
  id?: number;
  success?: boolean;
  message?: string;
  rentalId?: number;
  totalPrice?: number;
  result?: { success?: boolean; message?: string };
}

export interface RentalByUser {
  id: number;
  startDate: string;
  endDate: string;
  returnDate: string | null;
  totalPrice: number;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER';
  paymentStatus?: 'PENDING_TRANSFER' | 'PENDING_CONFIRM' | 'PAID' | 'UNPAID' | 'FAILED' | 'CANCELLED';
  rentalStatus?: 'PENDING_PAYMENT' | 'PENDING_ADMIN_CONFIRM' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  car: Car;
  depositAmount?: number;
  depositStatus?: string;
  insuranceCode?: string;
  insuranceFeeAmount?: number;
  extraFeesAmount?: number;
  pickupDistrict?: string;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  refundDepositAmount?: number;
  cancellationFeeAmount?: number;
  hasReview?: boolean;
}

// ─── Invoice ─────────────────────────────────────────────────────────────────
export interface Invoice {
  id: number;
  invoiceNo: string;
  totalPrice: number;
  discountRate: number;
  taxRate: number;
  rentalId?: number;      // used when creating
  rental?: {              // returned from API
    id: number;
    startDate?: string;
    endDate?: string;
    totalPrice?: number;
    car?: Car;
  };
  saleOrder?: {
    id: number;
    orderStatus?: string;
    totalPrice?: number;
    car?: Car;
  };
}

export interface SaleOrder {
  id: number;
  totalPrice: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  car: Car;
  user?: { id: number; email?: string };
}

export interface AddSaleOrderRequest {
  carId: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
}

export interface AddSaleOrderResponse {
  id?: number;
  result?: { success?: boolean; message?: string };
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
}

// ─── Contact ─────────────────────────────────────────────────────────────────
export interface ContactMailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface JoinUsMailRequest {
  name: string;
  email: string;
  phone: string;
  city: string;
  carCount: number;
}

// ─── API Result ──────────────────────────────────────────────────────────────
export interface ApiResult {
  success: boolean;
  message: string;
  data?: unknown;
}

// ─── Auth Store ──────────────────────────────────────────────────────────────
export interface AuthState {
  token: string | null;
  userId: number | null;
  email: string | null;
  roles: string[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, userId: number, email: string, roles: string[]) => void;
  logout: () => void;
}

// ─── Filter ──────────────────────────────────────────────────────────────────
export interface CarFilter {
  brandId?: number;
  colorId?: number;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  search?: string;
}
