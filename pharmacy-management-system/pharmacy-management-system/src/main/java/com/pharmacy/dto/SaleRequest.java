package com.pharmacy.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SaleRequest {
    private String customerName;
    private List<Item> items;

    @Getter
    @Setter
    public static class Item {
        private Long medicineId;
        private Integer quantity;
    }
}
