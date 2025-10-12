import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Medicine } from '../types';

// Query keys
export const medicineKeys = {
  all: ['medicines'] as const,
  lists: () => [...medicineKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...medicineKeys.lists(), filters] as const,
  details: () => [...medicineKeys.all, 'detail'] as const,
  detail: (id: string) => [...medicineKeys.details(), id] as const,
  lowStock: () => [...medicineKeys.all, 'lowStock'] as const,
};

// Get all medicines
export const useMedicines = () => {
  return useQuery({
    queryKey: medicineKeys.lists(),
    queryFn: () => api.medicines.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get low stock medicines
export const useLowStockMedicines = () => {
  return useQuery({
    queryKey: medicineKeys.lowStock(),
    queryFn: () => api.medicines.getLowStock(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Update medicine stock mutation
export const useUpdateMedicineStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      api.medicines.updateStock(id, quantity),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: medicineKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicineKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: medicineKeys.detail(data.data.id) });
    },
    onError: (error) => {
      console.error('Update medicine stock failed:', error);
    },
  });
};

