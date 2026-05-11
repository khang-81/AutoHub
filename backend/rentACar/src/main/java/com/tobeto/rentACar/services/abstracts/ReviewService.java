package com.tobeto.rentACar.services.abstracts;

import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.dtos.review.request.AdminReplyRequest;
import com.tobeto.rentACar.services.dtos.review.request.CreateReviewRequest;
import com.tobeto.rentACar.services.dtos.review.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    Result add(CreateReviewRequest request, int userId);

    List<ReviewResponse> getByCarId(int carId, Integer minRating);

    List<ReviewResponse> getAll();

    Result adminReply(int reviewId, AdminReplyRequest request);

    Result delete(int reviewId);
}
