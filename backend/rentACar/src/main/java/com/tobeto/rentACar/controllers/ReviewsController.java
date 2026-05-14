package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.services.JwtService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.abstracts.ReviewService;
import com.tobeto.rentACar.services.dtos.review.request.AdminReplyRequest;
import com.tobeto.rentACar.services.dtos.review.request.CreateReviewRequest;
import com.tobeto.rentACar.services.dtos.review.response.ReviewResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@AllArgsConstructor
@CrossOrigin
public class ReviewsController {

    private final ReviewService reviewService;
    private final JwtService jwtService;

    @GetMapping("/car/{carId}")
    public List<ReviewResponse> getByCar(@PathVariable int carId,
                                         @RequestParam(required = false) Integer minRating) {
        return reviewService.getByCarId(carId, minRating);
    }

    @PostMapping("/add")
    public Result add(@RequestBody @Valid CreateReviewRequest request, HttpServletRequest httpRequest) {
        String tokenWithPrefix = httpRequest.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        int userId = jwtService.requireUserId(token);
        return reviewService.add(request, userId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/admin/getAll")
    public List<ReviewResponse> getAllForAdmin() {
        return reviewService.getAll();
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/admin/{id}/reply")
    public Result adminReply(@PathVariable int id, @RequestBody @Valid AdminReplyRequest request) {
        return reviewService.adminReply(id, request);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/admin/delete/{id}")
    public Result deleteForAdmin(@PathVariable int id) {
        return reviewService.delete(id);
    }
}
