package com.pharmacy.controller;

import com.pharmacy.model.Supplier;
import com.pharmacy.repository.SupplierRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierRepository supplierRepository;

    @GetMapping
    public List<Supplier> getAll() {
        return supplierRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getOne(@PathVariable Long id) {
        return supplierRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Supplier create(@Valid @RequestBody Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> update(@PathVariable Long id, @Valid @RequestBody Supplier updated) {
        return supplierRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setContactPerson(updated.getContactPerson());
            existing.setPhone(updated.getPhone());
            existing.setEmail(updated.getEmail());
            existing.setAddress(updated.getAddress());
            return ResponseEntity.ok(supplierRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!supplierRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        supplierRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
