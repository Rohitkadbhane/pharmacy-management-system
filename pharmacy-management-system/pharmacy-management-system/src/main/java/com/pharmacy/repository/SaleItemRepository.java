package com.pharmacy.repository;

import com.pharmacy.model.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    @Query("SELECT si.medicine.name AS medicineName, SUM(si.quantity) AS totalQty, SUM(si.subtotal) AS totalRevenue " +
           "FROM SaleItem si GROUP BY si.medicine.name ORDER BY SUM(si.quantity) DESC")
    List<Object[]> findTopMedicinesRaw();
}
