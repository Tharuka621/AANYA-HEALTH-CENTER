import { InventoryBatch, BatchDeduction, BatchDeductionPlan } from '../types/pharmacy';

/**
 * Calculate total available quantity for a specific medicine across all batches
 */
export const getTotalAvailable = (
  batches: InventoryBatch[],
  medicineId: string,
  dosage: string
): number => {
  return batches
    .filter(batch => String(batch.medicine_id) === String(medicineId) && String(batch.dosage).toLowerCase() === String(dosage).toLowerCase())
    .reduce((sum, batch) => sum + batch.qty_available, 0);
};

/**
 * Plan batch deductions using FEFO (First Expiry, First Out) logic
 * Returns a plan with batches to deduct from, or an error if insufficient stock
 */
export const planBatchDeductionsFEFO = (
  batches: InventoryBatch[],
  medicineId: string,
  dosage: string,
  qtyNeeded: number
): BatchDeductionPlan => {
  // Filter batches for this specific medicine and dosage
  const relevantBatches = batches.filter(
    batch => String(batch.medicine_id) === String(medicineId) && String(batch.dosage).toLowerCase() === String(dosage).toLowerCase()
  );

  // Sort by expiry date (FEFO): earliest expiry first, null expiry goes last
  const sortedBatches = [...relevantBatches].sort((a, b) => {
    if (a.expiry_date === null) return 1;
    if (b.expiry_date === null) return -1;
    return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
  });

  const totalAvailable = sortedBatches.reduce((sum, b) => sum + b.qty_available, 0);

  // Check if we have enough total stock
  if (totalAvailable < qtyNeeded) {
    return {
      medicine_name: sortedBatches[0]?.medicine_name || 'Unknown',
      dosage,
      batches: [],
      total_deducted: 0,
      remaining_needed: qtyNeeded,
      error: `Insufficient stock. Required: ${qtyNeeded}, Available: ${totalAvailable}`,
    };
  }

  // Plan deductions from batches
  const deductions: BatchDeduction[] = [];
  let remaining = qtyNeeded;

  for (const batch of sortedBatches) {
    if (remaining <= 0) break;

    const qtyToTake = Math.min(batch.qty_available, remaining);
    deductions.push({
      batch_id: batch.id,
      batch_no: batch.batch_no,
      qty_to_deduct: qtyToTake,
      unit_price: batch.sell_price,
    });

    remaining -= qtyToTake;
  }

  return {
    medicine_name: sortedBatches[0].medicine_name,
    dosage,
    batches: deductions,
    total_deducted: qtyNeeded,
    remaining_needed: 0,
  };
};

/**
 * Apply planned batch deductions to the inventory
 * Returns updated batches array
 */
export const applyBatchDeductions = (
  batches: InventoryBatch[],
  plans: BatchDeductionPlan[]
): InventoryBatch[] => {
  const updatedBatches = [...batches];

  // Create a map of all deductions
  const deductionMap = new Map<string, number>();
  plans.forEach(plan => {
    plan.batches.forEach(deduction => {
      deductionMap.set(deduction.batch_id, deduction.qty_to_deduct);
    });
  });

  // Apply deductions
  return updatedBatches.map(batch => {
    const deductQty = deductionMap.get(batch.id);
    if (deductQty) {
      return {
        ...batch,
        qty_available: batch.qty_available - deductQty,
      };
    }
    return batch;
  });
};

/**
 * Calculate total amount from batch deduction plans
 */
export const calculateTotalAmount = (plans: BatchDeductionPlan[]): number => {
  return plans.reduce((total, plan) => {
    const planTotal = plan.batches.reduce(
      (sum, batch) => sum + batch.qty_to_deduct * batch.unit_price,
      0
    );
    return total + planTotal;
  }, 0);
};

/**
 * Get low stock medicines based on threshold
 */
export const getLowStockMedicines = (
  batches: InventoryBatch[],
  medicineThresholds: Map<string, number>
): Array<{ id: string; name: string; dosage: string; total_available: number; threshold: number }> => {
  const medicineStockMap = new Map<
    string,
    { id: string; name: string; dosage: string; total: number; threshold: number }
  >();

  // Aggregate stock by medicine_id + dosage
  batches.forEach(batch => {
    const key = `${batch.medicine_id}-${batch.dosage}`;
    const existing = medicineStockMap.get(key);
    const threshold = medicineThresholds.get(batch.medicine_id) || 50;

    if (existing) {
      existing.total += batch.qty_available;
    } else {
      medicineStockMap.set(key, {
        id: batch.medicine_id,
        name: batch.medicine_name,
        dosage: batch.dosage,
        total: batch.qty_available,
        threshold,
      });
    }
  });

  // Filter for low stock
  return Array.from(medicineStockMap.values())
    .filter(med => med.total <= med.threshold)
    .map(med => ({
      id: med.id,
      name: med.name,
      dosage: med.dosage,
      total_available: med.total,
      threshold: med.threshold,
    }));
};

/**
 * Calculate invoice totals from invoice items
 */
export const calculateInvoiceTotals = (items: Array<{ qty: number; unit_price: number }>): number => {
  return items.reduce((total, item) => total + (item.qty * item.unit_price), 0);
};
