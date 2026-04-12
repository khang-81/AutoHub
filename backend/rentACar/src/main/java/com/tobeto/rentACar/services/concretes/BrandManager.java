package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.utilities.mappers.ModelMapperService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Brand;
import com.tobeto.rentACar.repositories.BrandRepository;
import com.tobeto.rentACar.services.abstracts.BrandService;
import com.tobeto.rentACar.services.constants.Messages;
import com.tobeto.rentACar.services.dtos.brand.request.AddBrandRequest;
import com.tobeto.rentACar.services.dtos.brand.request.DeleteBrandRequest;
import com.tobeto.rentACar.services.dtos.brand.request.UpdateBrandRequest;
import com.tobeto.rentACar.services.dtos.brand.response.GetAllBrandsResponse;
import com.tobeto.rentACar.services.dtos.brand.response.GetBrandByIdResponse;
import com.tobeto.rentACar.core.configurations.CacheConfig;
import com.tobeto.rentACar.services.rules.BrandBusinessRule;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class BrandManager implements BrandService {
    private final BrandRepository brandRepository;
    private final ModelMapperService modelMapperService;
    private final BrandBusinessRule brandBusinessRule;
    private MessageService messageService;

    @Override
    public GetBrandByIdResponse getById(int id) {

        Brand brand = brandRepository.findById(id).orElseThrow(() ->
                new NotFoundException(messageService.getMessage(Messages.Brand.getBrandNotFoundMessage)));

        //Mapping the object to the response object
        return this.modelMapperService.forResponse()
                .map(brand, GetBrandByIdResponse.class);
    }

    @Override
    @Cacheable(cacheNames = CacheConfig.BRANDS, key = "'names'")
    public List<String> getAllName() {
        return brandRepository.findAll().stream()
                .map(Brand::getName)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(cacheNames = CacheConfig.BRANDS, key = "'all'")
    public List<GetAllBrandsResponse> getAll() {
        List<Brand> brands = brandRepository.findAll();
        return brands
                .stream()
                .map(brand -> this.modelMapperService
                        .forResponse()
                        .map(brand, GetAllBrandsResponse.class))
                .toList();
    }


    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConfig.BRANDS, allEntries = true),
            @CacheEvict(cacheNames = CacheConfig.MODELS, allEntries = true)
    })
    public Result add(AddBrandRequest request) {

        brandBusinessRule.existsBrandByName(request.getName());

        Brand brand = this.modelMapperService.forRequest().map(request, Brand.class);
        brandRepository.save(brand);

        return new SuccessResult(messageService.getMessage(Messages.Brand.brandAddSuccess));
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConfig.BRANDS, allEntries = true),
            @CacheEvict(cacheNames = CacheConfig.MODELS, allEntries = true)
    })
    public Result update(UpdateBrandRequest request) {

        brandBusinessRule.existsBrandByName(request.getName());

        Brand brand = this.modelMapperService.forRequest().map(request, Brand.class);
        brandRepository.save(brand);

        return new SuccessResult(messageService.getMessage(Messages.Brand.brandUpdateSuccess));
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConfig.BRANDS, allEntries = true),
            @CacheEvict(cacheNames = CacheConfig.MODELS, allEntries = true)
    })
    public Result delete(DeleteBrandRequest request){

        brandBusinessRule.existsBrandById(request.getId());

        brandRepository.deleteById(request.getId());

        return new SuccessResult(messageService.getMessage(Messages.Brand.brandDeleteSuccess));
    }
}