package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.services.ReportExportService;
import com.tobeto.rentACar.entities.concretes.Rental;
import com.tobeto.rentACar.repositories.RentalRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@AllArgsConstructor
@CrossOrigin
public class ReportsController {

    private final RentalRepository rentalRepository;
    private final ReportExportService reportExportService;

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/rentals/excel")
    public ResponseEntity<byte[]> exportRentalsExcel() throws IOException {
        List<Rental> rentals = rentalRepository.findAll();
        byte[] data = reportExportService.exportRentalsExcel(rentals);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bao-cao-thue-xe.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/rentals/pdf")
    public ResponseEntity<byte[]> exportRentalsPdf() {
        List<Rental> rentals = rentalRepository.findAll();
        byte[] data = reportExportService.exportRentalsPdf(rentals);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bao-cao-thue-xe.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
