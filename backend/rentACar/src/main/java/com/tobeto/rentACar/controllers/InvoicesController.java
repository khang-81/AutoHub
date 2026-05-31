package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.exceptions.types.UnauthorizedException;
import com.tobeto.rentACar.core.services.JwtService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.abstracts.InvoiceService;
import com.tobeto.rentACar.services.dtos.invoice.request.AddInvoiceRequest;
import com.tobeto.rentACar.services.dtos.invoice.request.DeleteInvoiceRequest;
import com.tobeto.rentACar.services.dtos.invoice.request.UpdateInvoiceRequest;
import com.tobeto.rentACar.services.dtos.invoice.response.GetAllInvoicesResponse;
import com.tobeto.rentACar.services.dtos.invoice.response.GetInvoiceByIdResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/invoices")
@AllArgsConstructor
@CrossOrigin
public class InvoicesController {
    private final InvoiceService invoiceService;
    private final JwtService jwtService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/add")
    public Result add(@RequestBody @Valid AddInvoiceRequest request){
        return invoiceService.add(request);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public Result update(@RequestBody @Valid UpdateInvoiceRequest request){
        return invoiceService.update(request);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete")
    public Result delete(@RequestBody @Valid DeleteInvoiceRequest request){
        return invoiceService.delete(request);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public List<GetAllInvoicesResponse> getAll(){
        return invoiceService.getAll();
    }

    @GetMapping("/getMyInvoices")
    public List<GetAllInvoicesResponse> getMyInvoices(jakarta.servlet.http.HttpServletRequest request){
        String tokenWithPrefix = request.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new UnauthorizedException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.substring(7);
        Integer userId = jwtService.extractUserId(token);
        if (userId == null) {
            throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn.");
        }
        return invoiceService.getByUserId(userId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    public GetInvoiceByIdResponse getById(@PathVariable int id){
        return invoiceService.getById(id);
    }
}
