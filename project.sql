1.  users
2.  user_menu_rights
3.  api_users
4.  branches
5.  development_offices
6.  agents
7.  clients
8.  couriers
9.  cities
10. call_us_data
11. business_regions
12. igis_makes
13. igis_sub_makes
14. motor_quote
15. plan
16. product_category
17. product
18. product_option
19. product_type
20. relation_mapping
21. magento_webapp_mapper
22. menus 
23. countries 
24. departments 




25. lead_info
26. lead_motor_info
27. api_user_products
28. coupons
29. coupon_plan_product
30. premium_range_protection
31. payment_modes


32. orders
33. policies
34. policy_details
35. policy_travel_data
36. policy_purchase_protection_data
37. policy_homecare_data
38. coupon_customer_usage
Total Tables: 38


CREATE TABLE `lead_info` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) DEFAULT,
  `dob` DATE DEFAULT NULL,
  `age` INT DEFAULT NULL,
  `mobile_num` VARCHAR(20) DEFAULT NULL,
  `email_address` VARCHAR(255) DEFAULT NULL,
  `spouse_dob` DATE DEFAULT NULL,
  `spouse_age` INT DEFAULT NULL,
  `kids` INT DEFAULT NULL,
  `family_kid1_dob` DATE DEFAULT NULL,
  `family_kid2_dob` DATE DEFAULT NULL,
  `family_kid3_dob` DATE DEFAULT NULL,
  `family_kid4_dob` DATE DEFAULT NULL,
  `product_type` VARCHAR(255) DEFAULT NULL,       
  `product_data` VARCHAR(255) DEFAULT NULL,  
  `product_sku` VARCHAR(255) DEFAULT NULL,
  `travel_from` VARCHAR(255) DEFAULT NULL,
  `travel_to` VARCHAR(255) DEFAULT NULL,
  `travel_go` VARCHAR(100) DEFAULT NULL,
  `travel_with` VARCHAR(100) DEFAULT NULL,
  `travel_country` VARCHAR(255) DEFAULT NULL,
  `from_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `duration` INT DEFAULT NULL,                    
  `insure_against` VARCHAR(255) DEFAULT NULL,
  `insure_house` VARCHAR(255) DEFAULT NULL,
  `insure_for` VARCHAR(255) DEFAULT NULL,
  `insure_live` VARCHAR(255) DEFAULT NULL,
  `insure_my` VARCHAR(255) DEFAULT NULL,
  `insure_area` VARCHAR(255) DEFAULT NULL,
  `insure_live_in` VARCHAR(255) DEFAULT NULL,
  `parent_insurance` VARCHAR(255) DEFAULT NULL,
  `parents_or_inlaw` VARCHAR(100) DEFAULT NULL,
  `parents_mother_dob` DATE DEFAULT NULL,
  `parents_father_dob` DATE DEFAULT NULL,
  `status` ENUM('pending','waiting','interested','not_interested', 'callback_scheduled','cancelled') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_deleted` TINYINT(1) DEFAULT 0,
);

CREATE TABLE `lead_motor_info` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `policy_type` VARCHAR(255) DEFAULT NULL, 
  `full_name` VARCHAR(255) DEFAULT NULL,
  `mobile` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `vehicle_make` VARCHAR(100) DEFAULT NULL,  
  `vehicle_submake` VARCHAR(100) DEFAULT NULL, 
  `vehicle_model` VARCHAR(50) DEFAULT NULL,   
  `vehicle_value` DECIMAL(15,2) DEFAULT NULL, 
  `vehicle_track_yesno` ENUM('yes', 'no') DEFAULT NULL,
  `vehicle_track` VARCHAR(50) DEFAULT NULL, 
  `premium` DECIMAL(15,2) DEFAULT NULL,  
  `status` ENUM('pending','waiting','interested','not_interested', 'callback_scheduled','cancelled') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_deleted` TINYINT(1) DEFAULT 0,
);

CREATE TABLE `api_user_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `api_user_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `deleted_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
);

CREATE TABLE `coupons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL UNIQUE,        
  `campaign_name` VARCHAR(150) DEFAULT NULL,
  `expiry_date` DATE NOT NULL,
  `application_date` DATE DEFAULT NULL,
  `quantity` INT UNSIGNED DEFAULT 0,
  `coupon_type` ENUM('percentage','flat','other') NOT NULL DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) DEFAULT 0.00,
  `use_per_customer` INT UNSIGNED DEFAULT 1,
  `remaining` INT UNSIGNED DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `deleted_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
) ;

CREATE TABLE `coupon_product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `coupon_id` BIGINT UNSIGNED NOT NULL,
  `product_id` INT DEFAULT NULL,
  `all_products` TINYINT(1) NOT NULL DEFAULT 0
);

CREATE TABLE `premium_range_protection` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `premium_start` DECIMAL(15,2) NOT NULL,   
  `premium_end` DECIMAL(15,2) NOT NULL,  
  `net_premium` DECIMAL(15,2) NOT NULL,   
  `api_user_id` BIGINT UNSIGNED NOT NULL,  
  `duration` INT UNSIGNED NOT NULL,     
  `duration_type` ENUM('days','months','years') NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `deleted_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
) ;

CREATE TABLE `payment_modes` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `deleted_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
) ;



-- ================= ORDERS =================
CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_code` VARCHAR(100) NOT NULL UNIQUE,
  `create_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `customer_first_name` VARCHAR(100) NOT NULL,
  `customer_last_name` VARCHAR(100) DEFAULT NULL,
  `customer_middle_name` VARCHAR(100) DEFAULT NULL,
  `customer_cnic` VARCHAR(20) DEFAULT NULL,
  `customer_dob` DATE DEFAULT NULL,
  `customer_email` VARCHAR(150) DEFAULT NULL,
  `customer_contact` VARCHAR(50) DEFAULT NULL,
  `customer_address` VARCHAR(255) DEFAULT NULL,
  `customer_city` VARCHAR(100) DEFAULT NULL,
  `customer_occupation` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('accepted','cancelled','pendingCOD','rejected','unverified','verified') NOT NULL DEFAULT 'pending',
  `payment_method_id` BIGINT UNSIGNED NOT NULL,
  `payment` DECIMAL(15,2) DEFAULT 0.00,
  `coupon_id` BIGINT UNSIGNED DEFAULT NULL,
  `discount_amount` DECIMAL(15,2) DEFAULT 0.00,
  `received_premium` DECIMAL(15,2) DEFAULT 0.00,
  `branch_id` BIGINT UNSIGNED DEFAULT NULL,
  `branch_name` VARCHAR(150) DEFAULT NULL,
  `agent_id` BIGINT UNSIGNED DEFAULT NULL,
  `agent_name` VARCHAR(150) DEFAULT NULL,
  `client_id` BIGINT UNSIGNED DEFAULT NULL,
  `development_office_id` BIGINT UNSIGNED DEFAULT NULL,
  `shipping_method` VARCHAR(100) DEFAULT NULL,
  `shipping_charges` DECIMAL(15,2) DEFAULT 0.00,
  `shipping_name` VARCHAR(150) DEFAULT NULL,
  `shipping_address` VARCHAR(255) DEFAULT NULL,
  `shipping_email` VARCHAR(150) DEFAULT NULL,
  `shipping_phone` VARCHAR(50) DEFAULT NULL,
  `tracking_number` VARCHAR(100) DEFAULT NULL,
  `courier_status` VARCHAR(50) DEFAULT NULL,
  `delivery_date` DATE DEFAULT NULL,
  `refunded` TINYINT(1) DEFAULT 0,
  `staff_comments` TEXT DEFAULT NULL,
  `parent_id` BIGINT UNSIGNED DEFAULT NULL,
  `cc_transaction_id` VARCHAR(100) DEFAULT NULL,
  `cc_approval_code` VARCHAR(100) DEFAULT NULL,
  `jazzcash_date_time` DATETIME DEFAULT NULL,
  `channel` VARCHAR(100) DEFAULT NULL,
  `idev` VARCHAR(100) DEFAULT NULL,
  `referred_by` VARCHAR(100) DEFAULT NULL,
  `kiosk_pin` VARCHAR(20) DEFAULT NULL,
  `kiosk_last_digit` VARCHAR(5) DEFAULT NULL,
  `test_book` TINYINT(1) DEFAULT 0,
  `api_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `in_patient_amount` DECIMAL(15,2) DEFAULT 0.00,
  `out_patient_amount` DECIMAL(15,2) DEFAULT 0.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `deleted_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
);

-- ================= POLICIES =================
CREATE TABLE `policies` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `policy_code` VARCHAR(100) NOT NULL UNIQUE,
  `igis_policy_code` VARCHAR(100) DEFAULT NULL,
  `order_id` BIGINT UNSIGNED DEFAULT NULL,
  `parent_id` BIGINT UNSIGNED DEFAULT NULL,
  `plan_id` BIGINT UNSIGNED DEFAULT NULL,
  `product_id` BIGINT UNSIGNED DEFAULT NULL,
  `product_option_id` BIGINT UNSIGNED DEFAULT NULL,
  `extended_warranty_id` BIGINT UNSIGNED DEFAULT NULL,
  `api_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `issue_date` DATE NOT NULL,
  `start_date` DATE DEFAULT NULL,
  `expiry_date` DATE DEFAULT NULL,
  `item_price` DECIMAL(15,2) DEFAULT 0.00,
  `received_premium` DECIMAL(15,2) DEFAULT 0.00,
  `discount` DECIMAL(15,2) DEFAULT 0.00,
  `sum_insured` DECIMAL(15,2) DEFAULT 0.00,
  `filer_tax_per_item` DECIMAL(15,2) DEFAULT 0.00,
  `filer_tax_total` DECIMAL(15,2) DEFAULT 0.00,
  `filer_tax_status` TINYINT(1) DEFAULT 0,
  `status` ENUM('cancelled','HISposted','IGISposted','pendingIGIS','unverified','pending') NOT NULL DEFAULT 'pending',
  `type` VARCHAR(50) DEFAULT NULL,
  `product_type` VARCHAR(50) DEFAULT NULL,
  `takaful_policy` TINYINT(1) DEFAULT 0,
  `is_renewed` TINYINT(1) DEFAULT 0,
  `refunded` TINYINT(1) DEFAULT 0,
  `quantity` INT DEFAULT 1,
  `qr_doc_url` VARCHAR(255) DEFAULT NULL,
  `pmdc_no` VARCHAR(50) DEFAULT NULL,
  `schengen` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `deleted_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
);

-- ================= POLICY DETAILS =================
CREATE TABLE `policy_details` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `policy_id` BIGINT UNSIGNED NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) DEFAULT NULL,
  `dob` DATE DEFAULT NULL,
  `cnic` VARCHAR(20) DEFAULT NULL,
  `occupation` VARCHAR(100) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `contact_number` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `gender` ENUM('male','female') DEFAULT NULL,
  `age` INT DEFAULT NULL,
  `relation` VARCHAR(50) DEFAULT NULL,
  `passport_no` VARCHAR(50) DEFAULT NULL,
  `poc` VARCHAR(50) DEFAULT NULL,
  `nicop` VARCHAR(50) DEFAULT NULL,
  `relative_name` VARCHAR(100) DEFAULT NULL,
  `relative_mobile` VARCHAR(20) DEFAULT NULL,
  `relative_address` VARCHAR(255) DEFAULT NULL,
  `relative_city` VARCHAR(100) DEFAULT NULL,
  `relative_email` VARCHAR(150) DEFAULT NULL,
  `parents_or_inlaw` ENUM('parents','inlaws') DEFAULT NULL,
  `parents_mother_dob` DATE DEFAULT NULL,
  `parents_father_dob` DATE DEFAULT NULL,
  `parents_mother_cnic` VARCHAR(20) DEFAULT NULL,
  `parents_father_cnic` VARCHAR(20) DEFAULT NULL,
  `parents_address` VARCHAR(255) DEFAULT NULL,
  `parents_contact` VARCHAR(20) DEFAULT NULL,
  `parents_mother_name` VARCHAR(100) DEFAULT NULL,
  `parents_father_name` VARCHAR(100) DEFAULT NULL,
  `parents_self_dob` DATE DEFAULT NULL,
  `insurance_cnic_issue_date` DATE DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `deleted_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
);

-- ================= TRAVEL DATA =================
CREATE TABLE `policy_travel_data` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `policy_id` BIGINT UNSIGNED NOT NULL,
  `sponsor` VARCHAR(150) DEFAULT NULL,
  `sponsor_address` VARCHAR(255) DEFAULT NULL,
  `sponsor_contact` VARCHAR(50) DEFAULT NULL,
  `institute` VARCHAR(150) DEFAULT NULL,
  `travel_from` VARCHAR(150) DEFAULT NULL,
  `travelling_dates` VARCHAR(255) DEFAULT NULL,
  `program` VARCHAR(150) DEFAULT NULL,
  `offer_letter_ref_no` VARCHAR(100) DEFAULT NULL,
  `no_of_days` VARCHAR(50) DEFAULT NULL,
  `travel_purpose` VARCHAR(255) DEFAULT NULL,
  `destination` VARCHAR(150) DEFAULT NULL,
  `tution_fee` TINYINT(1) DEFAULT 0,
  `type` VARCHAR(100) DEFAULT NULL,
  `travel_end_date` DATETIME DEFAULT NULL,
  `travel_start_date` DATETIME DEFAULT NULL,
  `program_duration` VARCHAR(100) DEFAULT NULL,
  `travel_type` VARCHAR(100) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `deleted_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
);

-- ================= PURCHASE PROTECTION =================
CREATE TABLE `policy_purchase_protection_data` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `policy_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `imei` VARCHAR(50) DEFAULT NULL,
  `serial_number` VARCHAR(100) DEFAULT NULL,
  `retailer_sku` VARCHAR(100) DEFAULT NULL,
  `price` DECIMAL(15,2) NOT NULL,
  `premium` DECIMAL(15,2) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `sum_insured` DECIMAL(15,2) NOT NULL,
  `total_price` DECIMAL(15,2) NOT NULL,
  `total_premium` DECIMAL(15,2) NOT NULL,
  `duration` INT UNSIGNED NOT NULL,
  `duration_type` ENUM('days','months','years') NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `deleted_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
);
-- ================= HOMECARE DATA =================
CREATE TABLE `policy_homecare_data` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `policy_id` BIGINT UNSIGNED NOT NULL,
  `ownership_status` VARCHAR(100) DEFAULT NULL,
  `structure_type` VARCHAR(100) DEFAULT NULL,
  `plot_area` VARCHAR(100) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `building` VARCHAR(100) DEFAULT NULL,
  `rent` DECIMAL(12,2) DEFAULT NULL,
  `content` DECIMAL(12,2) DEFAULT NULL,
  `jewelry` DECIMAL(12,2) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `deleted_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
);


CREATE TABLE `coupon_customer_usage` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `coupon_id` BIGINT UNSIGNED NOT NULL,      
  `customer_cnic` VARCHAR(25) NOT NULL,      
  `coupon_use` INT UNSIGNED DEFAULT 1,    
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,    
) ;