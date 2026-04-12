package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.utilities.mappers.ModelMapperService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Invoice;
import com.tobeto.rentACar.repositories.InvoiceRepository;
import com.tobeto.rentACar.repositories.RentalRepository;
import com.tobeto.rentACar.repositories.SaleOrderRepository;
import com.tobeto.rentACar.services.abstracts.InvoiceService;
import com.tobeto.rentACar.services.constants.Messages;
import com.tobeto.rentACar.services.dtos.invoice.request.AddInvoiceRequest;
import com.tobeto.rentACar.services.dtos.invoice.request.DeleteInvoiceRequest;
import com.tobeto.rentACar.services.dtos.invoice.request.UpdateInvoiceRequest;
import com.tobeto.rentACar.services.dtos.invoice.response.GetAllInvoicesResponse;
import com.tobeto.rentACar.services.dtos.invoice.response.GetInvoiceByIdResponse;
import com.tobeto.rentACar.services.rules.InvoiceBusinessRule;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class InvoiceManager implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final RentalRepository rentalRepository;
    private final SaleOrderRepository saleOrderRepository;
    private final ModelMapperService modelMapperService;
    private final InvoiceBusinessRule invoiceBusinessRule;
    private MessageService messageService;

    @Override
    public Result add(AddInvoiceRequest request) {
        boolean hasRental = request.getRentalId() != null;
        boolean hasSale = request.getSaleOrderId() != null;
        if (hasRental == hasSale) {
            throw new BusinessException("Hóa đơn phải gắn đúng một đơn thuê hoặc một đơn mua.");
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNo(request.getInvoiceNo());
        invoice.setTotalPrice(request.getTotalPrice());
        invoice.setDiscountRate(request.getDiscountRate());
        invoice.setTaxRate(request.getTaxRate());
        if (hasRental) {
            invoice.setRental(rentalRepository.getReferenceById(request.getRentalId()));
            invoice.setSaleOrder(null);
        } else {
            invoice.setSaleOrder(saleOrderRepository.getReferenceById(request.getSaleOrderId()));
            invoice.setRental(null);
        }

        invoiceRepository.save(invoice);

        return new SuccessResult(messageService.getMessage(Messages.Invoice.invoiceAddSuccess));

    }

    @Override
    public Result update(UpdateInvoiceRequest request) {
        invoiceBusinessRule.existsInvoiceById(request.getId());
        Invoice existing = invoiceRepository.findById(request.getId()).orElseThrow();

        boolean hasRental = request.getRentalId() != null;
        boolean hasSale = request.getSaleOrderId() != null;
        if (hasRental && hasSale) {
            throw new BusinessException("Hóa đơn chỉ được gắn một trong hai: đơn thuê hoặc đơn mua.");
        }

        existing.setInvoiceNo(request.getInvoiceNo());
        existing.setTotalPrice(request.getTotalPrice());
        existing.setDiscountRate(request.getDiscountRate());
        existing.setTaxRate(request.getTaxRate());
        if (hasRental) {
            existing.setRental(rentalRepository.getReferenceById(request.getRentalId()));
            existing.setSaleOrder(null);
        } else if (hasSale) {
            existing.setSaleOrder(saleOrderRepository.getReferenceById(request.getSaleOrderId()));
            existing.setRental(null);
        }
        // Nếu không gửi rentalId/saleOrderId: giữ nguyên liên kết hiện có

        invoiceRepository.save(existing);

        return new SuccessResult(messageService.getMessage(Messages.Invoice.invoiceUpdateSuccess));

    }

    @Override
    public Result delete(DeleteInvoiceRequest request) {

        invoiceBusinessRule.existsInvoiceById(request.getId());

        //Deleting
        invoiceRepository.deleteById(request.getId());

        return new SuccessResult(messageService.getMessage(Messages.Invoice.invoiceDeleteSuccess));

    }

    @Override
    public List<GetAllInvoicesResponse> getAll() {

        List<Invoice> invoices = invoiceRepository.findAll();
        List<GetAllInvoicesResponse> invoicesResponses = invoices.stream()
                .map(invoice -> this.modelMapperService.forResponse()
                        .map(invoice, GetAllInvoicesResponse.class)).toList();
        return invoicesResponses;
    }

    @Override
    public List<GetAllInvoicesResponse> getByUserId(int userId) {
        List<Invoice> invoices = invoiceRepository.findAllByUserLinked(userId);
        return invoices.stream()
                .map(invoice -> this.modelMapperService.forResponse()
                        .map(invoice, GetAllInvoicesResponse.class))
                .toList();
    }

    @Override
    public GetInvoiceByIdResponse getById(int id) {

        Invoice invoice = invoiceRepository.findById(id).orElseThrow(() ->
                new NotFoundException(messageService.getMessage(Messages.Invoice.getInvoiceNotFoundMessage)));

        //Mapping the object to the response object
        return this.modelMapperService.forResponse()
                .map(invoice, GetInvoiceByIdResponse.class);
    }
}
