package com.pharmacy.controller;

import com.pharmacy.model.Medicine;
import com.pharmacy.repository.MedicineRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineRepository medicineRepository;

    @GetMapping
    public List<Medicine> getAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return medicineRepository.findByNameContainingIgnoreCase(search);
        }
        return medicineRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getOne(@PathVariable Long id) {
        return medicineRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/low-stock")
    public List<Medicine> lowStock() {
        return medicineRepository.findLowStock();
    }

    @GetMapping("/expiring")
    public List<Medicine> expiring(@RequestParam(defaultValue = "30") int days) {
        return medicineRepository.findExpiringBefore(LocalDate.now().plusDays(days));
    }

    @PostMapping
    public Medicine create(@Valid @RequestBody Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicine> update(@PathVariable Long id, @Valid @RequestBody Medicine updated) {
        return medicineRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setCategory(updated.getCategory());
            existing.setManufacturer(updated.getManufacturer());
            existing.setBatchNumber(updated.getBatchNumber());
            existing.setQuantity(updated.getQuantity());
            existing.setUnitPrice(updated.getUnitPrice());
            existing.setReorderLevel(updated.getReorderLevel());
            existing.setExpiryDate(updated.getExpiryDate());
            existing.setSupplier(updated.getSupplier());
            return ResponseEntity.ok(medicineRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!medicineRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        medicineRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
