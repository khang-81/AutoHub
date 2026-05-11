package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.entities.concretes.User;
import com.tobeto.rentACar.services.abstracts.CustomerService;
import com.tobeto.rentACar.services.dtos.customer.request.AddCustomerRequest;
import com.tobeto.rentACar.services.dtos.customer.request.DeleteCustomerRequest;
import com.tobeto.rentACar.services.dtos.customer.request.UpdateCustomerRequest;
import com.tobeto.rentACar.services.dtos.customer.response.GetAllCustomersResponse;
import com.tobeto.rentACar.services.dtos.customer.response.GetCustomerByIdResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@AllArgsConstructor
@CrossOrigin
public class CustomersController {

    private final CustomerService customerService;

    /**
     * Khách tự tạo hồ sơ — chỉ cho phép tạo cho chính mình (userId trong body phải khớp JWT).
     * Tránh lạm dụng để tạo profile cho user khác.
     */
    @PostMapping("/add")
    public Result add(@RequestBody @Valid AddCustomerRequest request,
                      @AuthenticationPrincipal User principal) {
        if (principal == null) {
            throw new BusinessException("Cần đăng nhập.");
        }
        if (request.getUserId() != principal.getId()) {
            throw new BusinessException("Không được tạo hồ sơ cho người dùng khác.");
        }
        return customerService.add(request);
    }

    @PutMapping("/update")
    public Result update(@RequestBody @Valid UpdateCustomerRequest request,
                         @AuthenticationPrincipal User principal) {
        if (principal == null) {
            throw new BusinessException("Cần đăng nhập.");
        }
        boolean isAdmin = principal.getAuthorities() != null
                && principal.getAuthorities().stream()
                .anyMatch(a -> "admin".equalsIgnoreCase(a.getAuthority()));
        if (!isAdmin && request.getUserId() != principal.getId()) {
            throw new BusinessException("Không được sửa hồ sơ của người dùng khác.");
        }
        return customerService.update(request);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete")
    public Result delete(@RequestBody @Valid DeleteCustomerRequest request) {
        return customerService.delete(request);
    }

    /** Chỉ admin được xem toàn bộ hồ sơ khách hàng (PII). */
    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public List<GetAllCustomersResponse> getAll() {
        return customerService.getAll();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    public GetCustomerByIdResponse getById(@PathVariable int id) {
        return customerService.getById(id);
    }

    /**
     * Trang "Hồ sơ của tôi": chỉ trả về Customer của user đang đăng nhập (theo JWT).
     * 204 khi user chưa tạo hồ sơ — frontend hiển thị form tạo mới.
     */
    @GetMapping("/me")
    public ResponseEntity<GetCustomerByIdResponse> getMine(@AuthenticationPrincipal User principal) {
        if (principal == null) {
            throw new BusinessException("Cần đăng nhập.");
        }
        GetCustomerByIdResponse mine = customerService.getMine(principal.getId());
        if (mine == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(mine);
    }

}
