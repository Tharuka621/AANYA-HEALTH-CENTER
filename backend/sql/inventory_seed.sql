INSERT INTO medicines (id, name, unit, description, low_stock_threshold, manufacturer, category) VALUES
(1, 'Paracetamol', '500mg', 'Fever and pain relief', 50, 'GlaxoSmithKline', 'Analgesic'),
(2, 'Amoxicillin', '250mg', 'Antibiotic', 20, 'Pfizer', 'Antibiotic'),
(3, 'Vitamin C', '100mg', 'Dietary supplement', 30, 'Bayer', 'Supplement'),
(4, 'Ibuprofen', '400mg', 'Pain relief', 40, 'Advil', 'Analgesic'),
(5, 'Cetirizine', '10mg', 'Allergy relief', 20, 'Zyrtec', 'Antihistamine'),
(6, 'Omeprazole', '20mg', 'Stomach acid reducer', 30, 'Prilosec', 'Antacid'),
(7, 'Loratedine', '10mg', 'Allergy relief', 20, 'Claritin', 'Antihistamine'),
(8, 'Metformin', '500mg', 'Diabetes management', 50, 'Glucophage', 'Antidiabetic'),
(9, 'Amlodipine', '5mg', 'Blood pressure', 30, 'Norvasc', 'Antihypertensive'),
(10, 'Losartan', '50mg', 'Blood pressure', 30, 'Cozaar', 'Antihypertensive')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO inventory_batches (medicine_id, batch_no, expiry_date, qty_available, buy_price, sell_price) VALUES
(1, 'BATCH-001', '2027-01-01', 500, 2.00, 3.50),
(2, 'BATCH-002', '2026-12-31', 300, 5.00, 8.50),
(3, 'BATCH-003', '2028-06-15', 1000, 1.00, 2.00),
(4, 'BATCH-004', '2027-05-20', 400, 3.00, 5.00),
(5, 'BATCH-005', '2027-08-10', 250, 4.00, 6.00),
(6, 'BATCH-006', '2027-11-01', 350, 6.00, 9.00),
(7, 'BATCH-007', '2026-10-15', 200, 5.00, 7.50),
(8, 'BATCH-008', '2028-01-20', 600, 3.50, 5.50),
(9, 'BATCH-009', '2027-04-30', 450, 4.50, 7.00),
(10, 'BATCH-010', '2027-09-15', 500, 5.50, 8.50);
