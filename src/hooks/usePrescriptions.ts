import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Prescription } from '../types';

// Query keys
export const prescriptionKeys = {
  all: ['prescriptions'] as const,
  lists: () => [...prescriptionKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...prescriptionKeys.lists(), filters] as const,
  details: () => [...prescriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...prescriptionKeys.details(), id] as const,
  byPatient: (patientId: string) => [...prescriptionKeys.all, 'byPatient', patientId] as const,
  pending: () => [...prescriptionKeys.all, 'pending'] as const,
};

// Get all prescriptions
export const usePrescriptions = () => {
  return useQuery({
    queryKey: prescriptionKeys.lists(),
    queryFn: () => api.prescriptions.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get prescriptions by patient
export const usePrescriptionsByPatient = (patientId: string) => {
  return useQuery({
    queryKey: prescriptionKeys.byPatient(patientId),
    queryFn: () => api.prescriptions.getByPatient(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get pending prescriptions
export const usePendingPrescriptions = () => {
  return useQuery({
    queryKey: prescriptionKeys.pending(),
    queryFn: () => api.prescriptions.getPending(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Create prescription mutation
export const useCreatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prescription: Omit<Prescription, 'id'>) =>
      api.prescriptions.create(prescription),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.pending() });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.byPatient(data.data.patient_id) });
    },
    onError: (error) => {
      console.error('Create prescription failed:', error);
    },
  });
};

// Dispense prescription mutation
export const useDispensePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.prescriptions.dispense(id),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.pending() });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.byPatient(data.data.patient_id) });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.detail(data.data.id) });
    },
    onError: (error) => {
      console.error('Dispense prescription failed:', error);
    },
  });
};

