import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { LabTest } from '../types';

// Query keys
export const labTestKeys = {
  all: ['labTests'] as const,
  lists: () => [...labTestKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...labTestKeys.lists(), filters] as const,
  details: () => [...labTestKeys.all, 'detail'] as const,
  detail: (id: string) => [...labTestKeys.details(), id] as const,
  byPatient: (patientId: string) => [...labTestKeys.all, 'byPatient', patientId] as const,
  pending: () => [...labTestKeys.all, 'pending'] as const,
};

// Get all lab tests
export const useLabTests = () => {
  return useQuery({
    queryKey: labTestKeys.lists(),
    queryFn: () => api.labTests.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get lab tests by patient
export const useLabTestsByPatient = (patientId: string) => {
  return useQuery({
    queryKey: labTestKeys.byPatient(patientId),
    queryFn: () => api.labTests.getByPatient(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get pending lab tests
export const usePendingLabTests = () => {
  return useQuery({
    queryKey: labTestKeys.pending(),
    queryFn: () => api.labTests.getPending(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Create lab test mutation
export const useCreateLabTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (test: Omit<LabTest, 'id'>) =>
      api.labTests.create(test),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: labTestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: labTestKeys.pending() });
      queryClient.invalidateQueries({ queryKey: labTestKeys.byPatient(data.data.patient_id) });
    },
    onError: (error) => {
      console.error('Create lab test failed:', error);
    },
  });
};

// Upload lab test result mutation
export const useUploadLabTestResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reportUrl }: { id: string; reportUrl: string }) =>
      api.labTests.uploadResult(id, reportUrl),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: labTestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: labTestKeys.pending() });
      queryClient.invalidateQueries({ queryKey: labTestKeys.byPatient(data.data.patient_id) });
      queryClient.invalidateQueries({ queryKey: labTestKeys.detail(data.data.id) });
    },
    onError: (error) => {
      console.error('Upload lab test result failed:', error);
    },
  });
};

