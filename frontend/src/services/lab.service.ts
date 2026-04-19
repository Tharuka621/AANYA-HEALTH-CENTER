import { axiosInstance } from './api';
import { LabOrderItemWithDetails } from '../types/lab';
import { ApiResponse } from '../types';

export const labService = {
    getPendingOrders: async (): Promise<ApiResponse<LabOrderItemWithDetails[]>> => {
        try {
            const response = await axiosInstance.get('/lab/orders/pending');
            return {
                success: true,
                data: response.data.items,
                message: 'Fetched pending orders successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Failed to fetch pending orders',
            };
        }
    },

    getCompletedOrders: async (): Promise<ApiResponse<LabOrderItemWithDetails[]>> => {
        try {
            const response = await axiosInstance.get('/lab/orders/completed');
            return {
                success: true,
                data: response.data.items,
                message: 'Fetched completed orders successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Failed to fetch completed orders',
            };
        }
    },

    updateOrderStatus: async (orderId: string, status: 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED'): Promise<ApiResponse<any>> => {
        try {
            const response = await axiosInstance.put(`/lab/orders/${orderId}/status`, { status });
            return {
                success: true,
                data: response.data,
                message: 'Order status updated successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to update order status',
            };
        }
    },

    addLabResult: async (itemId: string, resultText: string | null, file: File | null): Promise<ApiResponse<any>> => {
        try {
            const formData = new FormData();
            if (resultText) formData.append('resultText', resultText);
            if (file) formData.append('file', file);

            const response = await axiosInstance.post(`/lab/orders/item/${itemId}/result`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return {
                success: true,
                data: response.data,
                message: 'Lab result added successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to add lab result',
            };
        }
    },
};
