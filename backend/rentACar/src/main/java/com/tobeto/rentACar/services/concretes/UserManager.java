package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.utilities.mappers.ModelMapperService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessDataResult;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.CorporateCustomer;
import com.tobeto.rentACar.entities.concretes.Customer;
import com.tobeto.rentACar.entities.concretes.Role;
import com.tobeto.rentACar.entities.concretes.User;
import com.tobeto.rentACar.repositories.CorporateCustomerRepository;
import com.tobeto.rentACar.repositories.CustomerRepository;
import com.tobeto.rentACar.repositories.RentalRepository;
import com.tobeto.rentACar.repositories.SaleOrderRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import com.tobeto.rentACar.services.abstracts.RoleService;
import com.tobeto.rentACar.services.abstracts.UserService;
import com.tobeto.rentACar.services.constants.Messages;
import com.tobeto.rentACar.services.dtos.role.RoleDto;
import com.tobeto.rentACar.services.dtos.user.request.*;
import com.tobeto.rentACar.services.dtos.user.response.GetAllUsersResponse;
import com.tobeto.rentACar.services.dtos.user.response.GetUserByIdResponse;
import com.tobeto.rentACar.services.dtos.user.response.GetUserByNameResponse;
import com.tobeto.rentACar.services.rules.UserBusinessRule;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tobeto.rentACar.services.dtos.user.response.AuthorityItemResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserManager implements UserService {

    private final UserRepository userRepository;
    private final RentalRepository rentalRepository;
    private final SaleOrderRepository saleOrderRepository;
    private final CustomerRepository customerRepository;
    private final CorporateCustomerRepository corporateCustomerRepository;
    private final ModelMapperService modelMapperService;
    private final UserBusinessRule userBusinessRule;
    private final PasswordEncoder passwordEncoder;
    private MessageService messageService;

    @Override
    public Result add(AddUserRequest request) {

        userBusinessRule.existsUserByEmail(request.getEmail());

        User user = modelMapperService.forRequest().map(request, User.class);

        userRepository.save(user);

        return new SuccessResult(messageService.getMessage(Messages.User.userAddSuccess));

    }

    @Override
    public Result add(User user) {
        String email = user.getEmail() != null ? user.getEmail().trim() : "";
        if (email.isEmpty()) {
            throw new BusinessException("Email không hợp lệ.");
        }
        user.setEmail(email);
        userBusinessRule.existsUserByEmail(email);
        userRepository.save(user);
        return new SuccessResult(messageService.getMessage(Messages.User.userRegisterSuccess));
    }

    @Override
    public Result update(UpdateUserRequest request) {

        userBusinessRule.existsUserByEmail(request.getEmail());
        userBusinessRule.existsUserById(request.getId());

        User user = modelMapperService.forRequest().map(request, User.class);

        userRepository.save(user);

        return new SuccessDataResult(messageService.getMessage(Messages.User.userUpdateSuccess));
    }

    public GetUserByNameResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() ->
                new NotFoundException(messageService.getMessage(Messages.User.getUserNotFoundMessage)));

        modelMapperService.forRequest().map(request, user);

        userRepository.save(user);

        return toProfileResponse(user);
    }

    @Override
    public Result changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() ->
                new NotFoundException(messageService.getMessage(Messages.User.getUserNotFoundMessage)));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Mật khẩu hiện tại không đúng.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new SuccessResult("Password changed successfully.");
    }

    @Override
    public List<RoleDto> getRolesByUserId(Integer id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException(messageService.getMessage(Messages.User.getUserNotFoundMessage)));
        Set<Role> roles = user.getAuthorities();
        return roles.stream().map(role -> this.modelMapperService.forResponse().map(role, RoleDto.class)).toList();
    }

    @Override
    public Result delete(DeleteUserRequest request) {

        userBusinessRule.existsUserById(request.getId());

        User toDelete = userRepository.findById(request.getId()).orElseThrow(() ->
                new NotFoundException(messageService.getMessage(Messages.User.getUserNotFoundMessage)));
        if (toDelete.getAuthorities() != null && toDelete.getAuthorities().stream()
                .anyMatch(r -> r != null && r.getName() != null && "admin".equalsIgnoreCase(r.getName().trim()))) {
            throw new BusinessException("Không thể xóa tài khoản admin.");
        }

        if (rentalRepository.existsActiveByUserId(request.getId())) {
            throw new BusinessException("Không thể xóa/khóa tài khoản — người dùng còn đơn thuê đang hoạt động.");
        }
        if (saleOrderRepository.existsActiveByUserId(request.getId())) {
            throw new BusinessException("Không thể xóa/khóa tài khoản — người dùng còn đơn mua đang hoạt động.");
        }

        userRepository.deleteById(request.getId());

        return new SuccessResult(messageService.getMessage(Messages.User.userDeleteSuccess));
    }

    @Override
    public List<GetAllUsersResponse> getAll() {
        List<User> users = userRepository.findAll();
        return users.stream().map(user -> {
            GetAllUsersResponse dto = this.modelMapperService.forResponse().map(user, GetAllUsersResponse.class);
            dto.setPassword(null);
            List<AuthorityItemResponse> authorities = new ArrayList<>();
            if (user.getAuthorities() != null) {
                for (Role r : user.getAuthorities()) {
                    if (r != null && r.getName() != null) {
                        authorities.add(new AuthorityItemResponse(r.getName()));
                    }
                }
            }
            dto.setAuthorities(authorities);
            return dto;
        }).toList();
    }

    @Override
    public GetUserByIdResponse getById(int id) {

        User user = userRepository.findById(id).orElseThrow(() ->
                new NotFoundException(messageService.getMessage(Messages.User.getUserNotFoundMessage)));

        GetUserByIdResponse dto = this.modelMapperService.forResponse().map(user, GetUserByIdResponse.class);

        customerRepository.findFirstByUserIdOrderByIdDesc(id).ifPresent((Customer c) -> {
            dto.setCustomerFirstName(c.getFirstName());
            dto.setCustomerLastName(c.getLastName());
            dto.setCustomerBirthdate(c.getBirthdate());
            dto.setCustomerInternationalId(c.getInternationalId());
            dto.setCustomerLicenceIssueDate(c.getLicenceIssueDate());
            dto.setProfileKind("INDIVIDUAL");
        });
        corporateCustomerRepository.findFirstByUserIdOrderByIdDesc(id).ifPresent((CorporateCustomer cc) -> {
            dto.setCompanyName(cc.getCompanyName());
            dto.setCompanyTaxNo(cc.getTaxNo());
            dto.setProfileKind("CORPORATE");
        });

        return dto;
    }

    @Override
    public GetUserByNameResponse getByName(String email) {

        User user = userRepository.findByEmail(email).orElseThrow(() ->
                new NotFoundException(messageService.getMessage(Messages.User.getUserNotFoundMessage)));

        return modelMapperService.forResponse()
                .map(user, GetUserByNameResponse.class);
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("No user found!"));
    }

    private static GetUserByNameResponse toProfileResponse(User user) {
        return new GetUserByNameResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getBirthDate(),
                user.getKycStatus(),
                user.getTokenVersion(),
                user.isEnabled()
        );
    }
}
