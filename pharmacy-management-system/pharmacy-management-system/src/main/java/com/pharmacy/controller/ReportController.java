package com.pharmacy.controller;

import com.pharmacy.model.Medicine;
import com.pharmacy.model.Sale;
import com.pharmacy.repository.MedicineRepository;
import com.pharmacy.repository.SaleItemRepository;
import com.pharmacy.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final SaleRepository saleRepository;
    private final MedicineRepository medicineRepository;
    private final SaleItemRepository saleItemRepository;

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        List<Medicine> allMedicines = medicineRepository.findAll();
        List<Medicine> lowStock = medicineRepository.findLowStock();
        List<Medicine> expiringSoon = medicineRepository.findExpiringBefore(LocalDate.now().plusDays(30));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        List<Sale> todaySales = saleRepository.findBetweenDates(startOfDay, endOfDay);

        double todayRevenue = todaySales.stream().mapToDouble(Sale::getTotalAmount).sum();
        double inventoryValue = allMedicines.stream()
                .mapToDouble(m -> m.getUnitPrice() * m.getQuantity())
                .sum();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalMedicines", allMedicines.size());
        result.put("lowStockCount", lowStock.size());
        result.put("expiringSoonCount", expiringSoon.size());
        result.put("todaySalesCount", todaySales.size());
        result.put("todayRevenue", todayRevenue);
        result.put("inventoryValue", inventoryValue);
        return result;
    }

    @GetMapping("/sales-summary")
    public Map<String, Object> salesSummary(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        LocalDateTime fromDate = (from != null) ? LocalDate.parse(from).atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime toDate = (to != null) ? LocalDate.parse(to).atTime(23, 59, 59) : LocalDateTime.now();

        List<Sale> sales = saleRepository.findBetweenDates(fromDate, toDate);

        Map<String, Double> revenueByDay = new TreeMap<>();
        for (Sale s : sales) {
            String day = s.getSaleDate().toLocalDate().toString();
            revenueByDay.merge(day, s.getTotalAmount(), Double::sum);
        }

        double totalRevenue = sales.stream().mapToDouble(Sale::getTotalAmount).sum();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalSales", sales.size());
        result.put("totalRevenue", totalRevenue);
        result.put("revenueByDay", revenueByDay);
        return result;
    }

    @GetMapping("/top-medicines")
    public List<Map<String, Object>> topMedicines(@RequestParam(defaultValue = "5") int limit) {
        List<Object[]> raw = saleItemRepository.findTopMedicinesRaw();
        return raw.stream().limit(limit).map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("medicineName", row[0]);
            m.put("totalQuantitySold", row[1]);
            m.put("totalRevenue", row[2]);
            return m;
        }).collect(Collectors.toList());
    }

    @GetMapping("/low-stock")
    public List<Medicine> lowStockReport() {
        return medicineRepository.findLowStock();
    }

    @GetMapping("/expiring")
    public List<Medicine> expiringReport(@RequestParam(defaultValue = "30") int days) {
        return medicineRepository.findExpiringBefore(LocalDate.now().plusDays(days));
    }
}
