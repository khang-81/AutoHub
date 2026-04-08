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
export interface Car {
  id: number;
  modelYear: number;
  plate: string;
  minFindeksRate: number;
  kilometer: number;
  dailyPrice: number;
  imagePath: string;
  model: CarModel;
  color: Color;
}

export interface AddCarRequest {
  kilometer: number;
  plate: string;
  modelYear: number;
  dailyPrice: number;
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
  car: Car;
  user: User;
}

export interface AddRentalRequest {
  startDate: string;
  endDate: string;
  carId: number;
  userId: number;
}

export interface AddRentalResponse {
  success: boolean;
  message: string;
  rentalId?: number;
  totalPrice?: number;
}

export interface RentalByUser {
  id: number;
  startDate: string;
  endDate: string;
  returnDate: string | null;
  totalPrice: number;
  car: Car;
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
