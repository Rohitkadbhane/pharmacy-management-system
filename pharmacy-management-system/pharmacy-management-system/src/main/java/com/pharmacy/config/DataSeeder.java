package com.pharmacy.config;

import com.pharmacy.model.*;
import com.pharmacy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Administrator");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("staff")) {
            User staff = new User();
            staff.setUsername("staff");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setFullName("Staff User");
            staff.setRole(Role.STAFF);
            userRepository.save(staff);
        }

        if (supplierRepository.count() == 0) {
            Supplier s1 = new Supplier(null, "MediCorp Distributors", "Rajesh Sharma", "9876543210", "contact@medicorp.com", "Nashik, MH");
            Supplier s2 = new Supplier(null, "HealthPlus Supplies", "Anita Patil", "9123456780", "sales@healthplus.com", "Pune, MH");
            supplierRepository.save(s1);
            supplierRepository.save(s2);

            if (medicineRepository.count() == 0) {
                medicineRepository.save(new Medicine(null, "Paracetamol 500mg", "Analgesic", "Cipla", "B1001", 200, 2.5, 30, LocalDate.now().plusMonths(8), s1));
                medicineRepository.save(new Medicine(null, "Amoxicillin 250mg", "Antibiotic", "Sun Pharma", "B1002", 15, 5.0, 20, LocalDate.now().plusDays(20), s1));
                medicineRepository.save(new Medicine(null, "Cetirizine 10mg", "Antihistamine", "Dr. Reddy's", "B1003", 8, 1.5, 15, LocalDate.now().plusMonths(12), s2));
                medicineRepository.save(new Medicine(null, "Ibuprofen 400mg", "Analgesic", "Cipla", "B1004", 120, 3.0, 25, LocalDate.now().plusMonths(6), s2));
            }
        }
    }
}
