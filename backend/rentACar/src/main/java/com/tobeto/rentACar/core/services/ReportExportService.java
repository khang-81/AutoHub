package com.tobeto.rentACar.core.services;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.tobeto.rentACar.entities.concretes.Rental;
import com.tobeto.rentACar.entities.concretes.SaleOrder;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportExportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] exportRentalsExcel(List<Rental> rentals) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Doanh thu cho thuê");
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            String[] headers = {"ID", "Khách", "Xe", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái", "Tổng tiền"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Rental r : rentals) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(r.getId());
                row.createCell(1).setCellValue(r.getUser() != null ? r.getUser().getEmail() : "");
                row.createCell(2).setCellValue(carLabel(r));
                row.createCell(3).setCellValue(r.getStartDate() != null ? r.getStartDate().format(DATE_FMT) : "");
                row.createCell(4).setCellValue(r.getEndDate() != null ? r.getEndDate().format(DATE_FMT) : "");
                row.createCell(5).setCellValue(r.getRentalStatus() != null ? r.getRentalStatus() : "");
                row.createCell(6).setCellValue(r.getTotalPrice() != null ? r.getTotalPrice().doubleValue() : 0);
            }

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportRentalsPdf(List<Rental> rentals) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(doc, out);
        doc.open();

        Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
        doc.add(new Paragraph("Bao cao doanh thu cho thue xe", titleFont));
        doc.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);

        String[] headers = {"ID", "Khach", "Xe", "Bat dau", "Ket thuc", "Trang thai", "Tong tien"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, new Font(Font.HELVETICA, 10, Font.BOLD)));
            cell.setBackgroundColor(new Color(200, 200, 200));
            table.addCell(cell);
        }

        for (Rental r : rentals) {
            table.addCell(String.valueOf(r.getId()));
            table.addCell(r.getUser() != null ? r.getUser().getEmail() : "");
            table.addCell(carLabel(r));
            table.addCell(r.getStartDate() != null ? r.getStartDate().format(DATE_FMT) : "");
            table.addCell(r.getEndDate() != null ? r.getEndDate().format(DATE_FMT) : "");
            table.addCell(r.getRentalStatus() != null ? r.getRentalStatus() : "");
            table.addCell(r.getTotalPrice() != null ? String.format("%,.0f", r.getTotalPrice().doubleValue()) : "0");
        }

        doc.add(table);
        doc.close();
        return out.toByteArray();
    }

    private static String carLabel(Rental r) {
        if (r.getCar() == null) return "";
        if (r.getCar().getModel() == null) return r.getCar().getPlate();
        String brand = r.getCar().getModel().getBrand() != null ? r.getCar().getModel().getBrand().getName() : "";
        return brand + " " + r.getCar().getModel().getName();
    }
}
