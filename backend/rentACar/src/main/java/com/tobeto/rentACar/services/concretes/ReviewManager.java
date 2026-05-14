package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Car;
import com.tobeto.rentACar.entities.concretes.Rental;
import com.tobeto.rentACar.entities.concretes.Review;
import com.tobeto.rentACar.entities.concretes.SaleOrder;
import com.tobeto.rentACar.entities.concretes.User;
import com.tobeto.rentACar.repositories.CarRepository;
import com.tobeto.rentACar.repositories.RentalRepository;
import com.tobeto.rentACar.repositories.ReviewRepository;
import com.tobeto.rentACar.repositories.SaleOrderRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import com.tobeto.rentACar.services.abstracts.ReviewService;
import com.tobeto.rentACar.services.constants.Messages;
import com.tobeto.rentACar.services.dtos.review.request.AdminReplyRequest;
import com.tobeto.rentACar.services.dtos.review.request.CreateReviewRequest;
import com.tobeto.rentACar.services.dtos.review.response.ReviewResponse;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class ReviewManager implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RentalRepository rentalRepository;
    private final SaleOrderRepository saleOrderRepository;
    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private MessageService messageService;

    @Override
    @Transactional
    public Result add(CreateReviewRequest request, int userId) {
        Integer rentalId = request.getRentalId();
        Integer saleOrderId = request.getSaleOrderId();
        if ((rentalId == null && saleOrderId == null) || (rentalId != null && saleOrderId != null)) {
            throw new BusinessException("Vui lòng chọn đúng một giao dịch để đánh giá (đơn thuê hoặc đơn mua).");
        }

        User user = userRepository.getReferenceById(userId);
        Review.ReviewBuilder builder = Review.builder()
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment() != null ? request.getComment().trim() : null)
                .hiddenFromPublic(false);

        if (rentalId != null) {
            Rental rental = rentalRepository.findById(rentalId).orElseThrow(
                    () -> new NotFoundException(messageService.getMessage(Messages.Rental.getRentalNotFoundMessage)));

            if (rental.getUser() == null || rental.getUser().getId() != userId) {
                throw new BusinessException("Bạn không thể đánh giá đơn thuê của người khác.");
            }
            if (!"COMPLETED".equals(rental.getRentalStatus())) {
                throw new BusinessException("Chỉ có thể đánh giá sau khi chuyến đi đã hoàn tất.");
            }
            if (reviewRepository.existsByRental_Id(rental.getId())) {
                throw new BusinessException("Bạn đã đánh giá đơn thuê này rồi.");
            }
            builder.rental(rental);
        } else {
            SaleOrder saleOrder = saleOrderRepository.findById(saleOrderId).orElseThrow(
                    () -> new NotFoundException("Không tìm thấy đơn mua."));
            if (saleOrder.getUser() == null || saleOrder.getUser().getId() != userId) {
                throw new BusinessException("Bạn không thể đánh giá đơn mua của người khác.");
            }
            if (!"COMPLETED".equals(saleOrder.getOrderStatus())) {
                throw new BusinessException("Chỉ có thể đánh giá sau khi đơn mua đã hoàn tất.");
            }
            if (reviewRepository.existsBySaleOrder_Id(saleOrder.getId())) {
                throw new BusinessException("Bạn đã đánh giá đơn mua này rồi.");
            }
            builder.saleOrder(saleOrder);
        }

        Review saved = reviewRepository.save(builder.build());
        recalcCarRating(saved);

        return new SuccessResult("Cảm ơn bạn đã đánh giá!");
    }

    @Override
    public List<ReviewResponse> getByCarId(int carId, Integer minRating) {
        List<Review> reviews;
        if (minRating != null && minRating > 1) {
            reviews = reviewRepository.findByCarIdAndMinRating(carId, minRating);
        } else {
            reviews = reviewRepository.findByCarIdOrderByCreatedDateDesc(carId);
        }
        return reviews.stream().map(this::toResponse).toList();
    }

    @Override
    public List<ReviewResponse> getAll() {
        return reviewRepository.findAllWithRefsOrderByIdDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public Result adminReply(int reviewId, AdminReplyRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá."));
        review.setAdminReply(request.getReply().trim());
        reviewRepository.save(review);
        return new SuccessResult("Đã phản hồi đánh giá.");
    }

    @Override
    @Transactional
    public Result setHidden(int reviewId, boolean hidden) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá."));
        review.setHiddenFromPublic(hidden);
        reviewRepository.save(review);
        recalcCarRating(review);
        return new SuccessResult(hidden ? "Đã ẩn đánh giá khỏi trang công khai." : "Đã hiển thị lại đánh giá.");
    }

    @Override
    @Transactional
    public Result delete(int reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá."));
        reviewRepository.delete(review);
        recalcCarRating(review);
        return new SuccessResult("Đã xóa đánh giá.");
    }

    private void recalcCarRating(Review review) {
        Car car = null;
        if (review.getRental() != null && review.getRental().getCar() != null) {
            car = review.getRental().getCar();
        } else if (review.getSaleOrder() != null && review.getSaleOrder().getCar() != null) {
            car = review.getSaleOrder().getCar();
        }
        if (car == null) return;
        List<Review> carReviews = reviewRepository.findByCarIdOrderByCreatedDateDesc(car.getId());
        if (carReviews.isEmpty()) {
            car.setAverageRating(null);
            car.setReviewCount(0);
        } else {
            double avg = carReviews.stream().mapToInt(Review::getRating).average().orElse(0);
            car.setAverageRating(Math.round(avg * 10.0) / 10.0);
            car.setReviewCount(carReviews.size());
        }
        carRepository.save(car);
    }

    private ReviewResponse toResponse(Review r) {
        ReviewResponse dto = new ReviewResponse();
        dto.setId(r.getId());
        if (r.getRental() != null) {
            dto.setRentalId(r.getRental().getId());
            dto.setSourceType("RENTAL");
            if (r.getRental().getCar() != null) {
                String brandName = null;
                String modelName = null;
                if (r.getRental().getCar().getModel() != null) {
                    modelName = r.getRental().getCar().getModel().getName();
                    if (r.getRental().getCar().getModel().getBrand() != null) {
                        brandName = r.getRental().getCar().getModel().getBrand().getName();
                    }
                }
                dto.setCarId(r.getRental().getCar().getId());
                dto.setCarLabel(buildCarLabel(
                        brandName,
                        modelName,
                        r.getRental().getCar().getPlate()));
            }
        }
        if (r.getSaleOrder() != null) {
            dto.setSaleOrderId(r.getSaleOrder().getId());
            dto.setSourceType("SALE_ORDER");
            if (r.getSaleOrder().getCar() != null) {
                String brandName = null;
                String modelName = null;
                if (r.getSaleOrder().getCar().getModel() != null) {
                    modelName = r.getSaleOrder().getCar().getModel().getName();
                    if (r.getSaleOrder().getCar().getModel().getBrand() != null) {
                        brandName = r.getSaleOrder().getCar().getModel().getBrand().getName();
                    }
                }
                dto.setCarId(r.getSaleOrder().getCar().getId());
                dto.setCarLabel(buildCarLabel(
                        brandName,
                        modelName,
                        r.getSaleOrder().getCar().getPlate()));
            }
        }
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setAdminReply(r.getAdminReply());
        dto.setHiddenFromPublic(Boolean.TRUE.equals(r.getHiddenFromPublic()));
        dto.setCreatedDate(r.getCreatedDate());
        dto.setAuthorLabel(maskEmail(r.getUser() != null ? r.getUser().getEmail() : null));
        return dto;
    }

    private static String buildCarLabel(String brandName, String modelName, String plate) {
        String left = ((brandName != null ? brandName : "") + " " + (modelName != null ? modelName : "")).trim();
        if (left.isBlank()) {
            return plate != null && !plate.isBlank() ? plate : "Xe không xác định";
        }
        return plate != null && !plate.isBlank() ? left + " • " + plate : left;
    }

    private static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "Khách hàng";
        }
        int at = email.indexOf('@');
        String local = email.substring(0, at);
        String domain = email.substring(at);
        if (local.length() <= 2) {
            return "***" + domain;
        }
        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + domain;
    }
}
