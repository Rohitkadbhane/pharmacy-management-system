package com.pharmacy.repository;

import com.pharmacy.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    @Query("SELECT m FROM Medicine m WHERE m.quantity <= m.reorderLevel")
    List<Medicine> findLowStock();

    @Query("SELECT m FROM Medicine m WHERE m.expiryDate <= :date")
    List<Medicine> findExpiringBefore(LocalDate date);

    List<Medicine> findByNameContainingIgnoreCase(String name);
}
