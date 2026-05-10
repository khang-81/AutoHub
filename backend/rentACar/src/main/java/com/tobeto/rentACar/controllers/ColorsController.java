package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.abstracts.ColorService;
import com.tobeto.rentACar.services.dtos.color.request.AddColorRequest;
import com.tobeto.rentACar.services.dtos.color.request.DeleteColorRequest;
import com.tobeto.rentACar.services.dtos.color.request.UpdateColorRequest;
import com.tobeto.rentACar.services.dtos.color.response.GetAllColorsResponse;
import com.tobeto.rentACar.services.dtos.color.response.GetColorByIdResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colors")
@AllArgsConstructor
@CrossOrigin
public class ColorsController {
	private final ColorService colorService;

	@PreAuthorize("hasRole('admin')")
	@PostMapping("/add")
	public Result add(@RequestBody @Valid AddColorRequest request) {
		return colorService.add(request);
	}

	@PreAuthorize("hasRole('admin')")
	@PutMapping("/update")
	public Result update(@RequestBody @Valid UpdateColorRequest request) {
		return colorService.update(request);
	}

	@GetMapping("/getAll")
	public List<GetAllColorsResponse> getAll() {
		return colorService.getAll();
	}

	@GetMapping("/getById/{id}")
	public GetColorByIdResponse getById(@PathVariable int id) {
		return colorService.getById(id);
	}

	/**
	 * DELETE chuẩn REST: nhận id ở path, không lấy body.
	 * Frontend đã update sang DELETE /api/colors/delete/{id}.
	 */
	@PreAuthorize("hasRole('admin')")
	@DeleteMapping("/delete/{id}")
	public Result delete(@PathVariable int id) {
		return colorService.delete(new DeleteColorRequest(id));
	}

}
