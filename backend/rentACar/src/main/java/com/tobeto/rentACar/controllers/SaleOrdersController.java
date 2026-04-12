package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.services.JwtService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.abstracts.SaleOrderService;
import com.tobeto.rentACar.services.dtos.rental.request.CancelRentalRequest;
import com.tobeto.rentACar.services.dtos.saleorder.request.AddSaleOrderRequest;
import com.tobeto.rentACar.services.dtos.saleorder.response.AddSaleOrderResponse;
import com.tobeto.rentACar.services.dtos.saleorder.response.GetAllSaleOrdersResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/sale-orders")
@AllArgsConstructor
@CrossOrigin
public class SaleOrdersController {

    private final SaleOrderService saleOrderService;
    private final JwtService jwtService;

    @PostMapping("/add")
    public AddSaleOrderResponse add(@RequestBody @Valid AddSaleOrderRequest request, HttpServletRequest httpRequest) {
        String tokenWithPrefix = httpRequest.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        int userId = jwtService.extractUserId(token);
        return saleOrderService.add(request, userId);
    }

    @GetMapping("/getAll")
    public List<GetAllSaleOrdersResponse> getAll() {
        return saleOrderService.getAll();
    }

    @GetMapping("/getById/{id}")
    public GetAllSaleOrdersResponse getById(@PathVariable int id) {
        return saleOrderService.getById(id);
    }

    @GetMapping("/getByUserId")
    public List<GetAllSaleOrdersResponse> getByUserId(HttpServletRequest request) {
        String tokenWithPrefix = request.getHeader("Authorization");
        String token = tokenWithPrefix.replace("Bearer ", "");
        int userId = jwtService.extractUserId(token);
        return saleOrderService.getByUserId(userId);
    }

    @PutMapping("/submitTransfer/{id}")
    public Result submitTransfer(@PathVariable int id, HttpServletRequest request) {
        String tokenWithPrefix = request.getHeader("Authorization");
        String token = tokenWithPrefix.replace("Bearer ", "");
        int userId = jwtService.extractUserId(token);
        return saleOrderService.submitTransfer(id, userId);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/confirm/{id}")
    public Result confirmByAdmin(@PathVariable int id) {
        return saleOrderService.confirmByAdmin(id);
    }

    @PutMapping("/cancel/{id}")
    public Result cancel(
            @PathVariable int id,
            @RequestBody(required = false) CancelRentalRequest body,
            HttpServletRequest request) {
        String tokenWithPrefix = request.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        int userId = jwtService.extractUserId(token);
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> "ROLE_admin".equals(a.getAuthority()) || "admin".equals(a.getAuthority()));
        String reason = body != null ? body.getReason() : null;
        return saleOrderService.cancel(id, userId, isAdmin, reason);
    }
}
