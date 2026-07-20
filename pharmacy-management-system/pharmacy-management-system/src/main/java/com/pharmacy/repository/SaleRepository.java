package com.pharmacy.repository;

import com.pharmacy.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    @Query("SELECT s FROM Sale s WHERE s.saleDate BETWEEN :from AND :to ORDER BY s.saleDate DESC")
    List<Sale> findBetweenDates(LocalDateTime from, LocalDateTime to);

    List<Sale> findAllByOrderBySaleDateDesc();
}
