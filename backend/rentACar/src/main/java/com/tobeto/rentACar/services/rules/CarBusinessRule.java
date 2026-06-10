package com.tobeto.rentACar.services.rules;

import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.repositories.CarRepository;
import com.tobeto.rentACar.services.constants.Messages;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CarBusinessRule {
    private final CarRepository carRepository;
    private final MessageService messageService;

    public void existsCarByPlate(String plate) {
        if (carRepository.existsCarByPlate(plate)) {
            throw new BusinessException(messageService.getMessage(Messages.Car.getSameCarPlateMessage));
        }
    }

    /** Khi sửa xe: cho phép giữ biển số hiện tại, chỉ chặn trùng xe khác. */
    public void assertPlateNotUsedByOtherCar(int carId, String plate) {
        if (carRepository.existsByPlateAndIdNot(plate, carId)) {
            throw new BusinessException(messageService.getMessage(Messages.Car.getSameCarPlateMessage));
        }
    }
    public void existsCarById(int id) {
        if (!carRepository.existsById(id)) {
            throw new BusinessException(messageService.getMessage(Messages.Car.getCarNotFoundMessage));
        }
    }

}
