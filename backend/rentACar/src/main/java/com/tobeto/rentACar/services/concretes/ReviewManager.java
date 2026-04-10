package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Rental;
import com.tobeto.rentACar.entities.concretes.Review;
import com.tobeto.rentACar.entities.concretes.User;
import com.tobeto.rentACar.repositories.RentalRepository;
import com.tobeto.rentACar.repositories.ReviewRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import com.tobeto.rentACar.services.abstracts.ReviewService;
import com.tobeto.rentACar.services.constants.Messages;
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
    private final UserRepository userRepository;
    private MessageService messageService;

    @Override
    @Transactional
    public Result add(CreateReviewRequest request, int userId) {
        Rental rental = rentalRepository.findById(request.getRentalId()).orElseThrow(
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

        User user = userRepository.getReferenceById(userId);
        Review review = Review.builder()
                .rental(rental)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment() != null ? request.getComment().trim() : null)
                .build();
        reviewRepository.save(review);

        return new SuccessResult("Cảm ơn bạn đã đánh giá!");
    }

    @Override
    public List<ReviewResponse> getByCarId(int carId) {
        return reviewRepository.findByCarIdOrderByCreatedDateDesc(carId).stream()
                .map(this::toResponse)
                .toList();
    }

    private ReviewResponse toResponse(Review r) {
        ReviewResponse dto = new ReviewResponse();
        dto.setId(r.getId());
        dto.setRentalId(r.getRental().getId());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setCreatedDate(r.getCreatedDate());
        dto.setAuthorLabel(maskEmail(r.getUser() != null ? r.getUser().getEmail() : null));
        return dto;
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
