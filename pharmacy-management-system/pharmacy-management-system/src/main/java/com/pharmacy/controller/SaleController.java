package com.pharmacy.controller;

import com.pharmacy.dto.SaleRequest;
import com.pharmacy.model.*;
import com.pharmacy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleRepository saleRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<Sale> getAll() {
        return saleRepository.findAllByOrderBySaleDateDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getOne(@PathVariable Long id) {
        return saleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createSale(@RequestBody SaleRequest request, Authentication authentication) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Sale must contain at least one item");
        }

        User staff = userRepository.findByUsername(authentication.getName()).orElse(null);

        Sale sale = new Sale();
        sale.setCustomerName(request.getCustomerName());
        sale.setStaff(staff);

        double total = 0.0;

        for (SaleRequest.Item itemReq : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new RuntimeException("Medicine not found: " + itemReq.getMedicineId()));

            if (medicine.getQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + medicine.getName());
            }

            medicine.setQuantity(medicine.getQuantity() - itemReq.getQuantity());
            medicineRepository.save(medicine);

            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setMedicine(medicine);
            saleItem.setQuantity(itemReq.getQuantity());
            saleItem.setUnitPrice(medicine.getUnitPrice());
            double subtotal = medicine.getUnitPrice() * itemReq.getQuantity();
            saleItem.setSubtotal(subtotal);
            total += subtotal;

            sale.getItems().add(saleItem);
        }

        sale.setTotalAmount(total);
        Sale saved = saleRepository.save(sale);
        return ResponseEntity.ok(saved);
    }
}
