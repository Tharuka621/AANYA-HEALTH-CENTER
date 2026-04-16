import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Appointment } from '../types';

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  byDate: (date: string) => [...appointmentKeys.all, 'byDate', date] as const,
  byPatient: (patientId: string) => [...appointmentKeys.all, 'byPatient', patientId] as const,
  byDoctor: (doctorId: string) => [...appointmentKeys.all, 'byDoctor', doctorId] as const,
};

// Get all appointments with pagination
export const useAppointments = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: appointmentKeys.list({ page, limit }),
    queryFn: () => api.appointments.getAll(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get appointments by date
export const useAppointmentsByDate = (date: string) => {
  return useQuery({
    queryKey: appointmentKeys.byDate(date),
    queryFn: () => api.appointments.getByDate(date),
    enabled: !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get appointments by patient
export const useAppointmentsByPatient = (patientId: string) => {
  return useQuery({
    queryKey: appointmentKeys.byPatient(patientId),
    queryFn: () => api.appointments.getByPatient(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get appointments by doctor
export const useAppointmentsByDoctor = (doctorId: string) => {
  return useQuery({
    queryKey: appointmentKeys.byDoctor(doctorId),
    queryFn: () => api.appointments.getByDoctor(doctorId),
    enabled: !!doctorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create appointment mutation
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointment: Omit<Appointment, 'id' | 'created_at'>) =>
      api.appointments.create(appointment),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byDate(data.data.appointment_date) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byPatient(data.data.patient_id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byDoctor(data.data.doctor_id) });
    },
    onError: (error) => {
      console.error('Create appointment failed:', error);
    },
  });
};

// Update appointment mutation
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Appointment> }) =>
      api.appointments.update(id, updates),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: (error) => {
      console.error('Update appointment failed:', error);
    },
  });
};

// Cancel appointment mutation
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.appointments.update(id, { status: 'cancelled' }),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: (error) => {
      console.error('Cancel appointment failed:', error);
    },
  });
};

// Complete appointment mutation
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.appointments.update(id, { status: 'completed' }),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: (error) => {
      console.error('Complete appointment failed:', error);
    },
  });
};

// Check-in appointment mutation
export const useCheckInAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.appointments.update(id, { status: 'checked_in' }),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: (error) => {
      console.error('Check-in appointment failed:', error);
    },
  });
};

