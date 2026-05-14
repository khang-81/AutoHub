package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.services.JwtService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.abstracts.UserService;
import com.tobeto.rentACar.services.dtos.role.RoleDto;
import com.tobeto.rentACar.services.dtos.user.request.*;
import com.tobeto.rentACar.services.dtos.user.response.GetAllUsersResponse;
import com.tobeto.rentACar.services.dtos.user.response.GetUserByIdResponse;
import com.tobeto.rentACar.services.dtos.user.response.GetUserByNameResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/users")
@AllArgsConstructor
@CrossOrigin
public class UsersController {

    private final UserService userService;
    private final JwtService jwtService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/add")
    public Result add(@RequestBody @Valid AddUserRequest request){
        return userService.add(request);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public Result update(@RequestBody @Valid UpdateUserRequest request){

        return userService.update(request);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete")
    public Result delete(@RequestBody @Valid DeleteUserRequest request){
        return userService.delete(request);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public List<GetAllUsersResponse> getAll(){
        return userService.getAll();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    public GetUserByIdResponse getById(@PathVariable int id){
        return  userService.getById(id);
    }

    @GetMapping("/getProfile")
    public GetUserByNameResponse getProfile(HttpServletRequest request) {
        String tokenWithPrefix = request.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        String username = jwtService.extractUser(token);
        return userService.getByName(username);
    }

    @PutMapping("/updateProfile")
    public GetUserByNameResponse updateProfile(@RequestBody UpdateProfileRequest request, HttpServletRequest httpRequest) {
        String tokenWithPrefix = httpRequest.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        String username = jwtService.extractUser(token);

        request.setEmail(request.getEmail());
        request.setPassword(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()));

        return userService.updateProfile(username, request);
    }

    @PutMapping("/changePassword")
    public Result changePassword(@RequestBody @Valid ChangePasswordRequest request, HttpServletRequest httpRequest) {
        String tokenWithPrefix = httpRequest.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        String username = jwtService.extractUser(token);

        return userService.changePassword(username, request);
    }

    @GetMapping("/{userId}/roles")
    public List<RoleDto> getUserRoles(@PathVariable Integer userId, HttpServletRequest request) {
        String tokenWithPrefix = request.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        int tokenUserId = jwtService.requireUserId(token);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .map(a -> a.getAuthority() != null ? a.getAuthority().toLowerCase() : "")
                .anyMatch(a -> a.equals("role_admin") || a.equals("admin") || a.contains("admin"));
        if (!isAdmin && tokenUserId != userId) {
            throw new BusinessException("Bạn không có quyền xem vai trò tài khoản này.");
        }
        return userService.getRolesByUserId(userId);
    }
}
