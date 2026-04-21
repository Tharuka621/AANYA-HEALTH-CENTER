import { axiosInstance } from './api';
import { ApiResponse, LabTestCatalogItem } from '../types';

export const adminService = {
  getLabTestCatalog: async (): Promise<ApiResponse<LabTestCatalogItem[]>> => {
    try {
      const response = await axiosInstance.get('/admin/lab-tests/catalog');
      return {
        success: true,
        data: response.data.catalog,
        message: 'Fetched lab test catalog successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch lab test catalog',
      };
    }
  },

  updateLabTestPrice: async (id: number, data: Partial<LabTestCatalogItem>): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosInstance.put(`/admin/lab-tests/catalog/${id}`, data);
      return {
        success: true,
        data: response.data,
        message: 'Lab test updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update lab test',
      };
    }
  },

  createLabTest: async (data: Omit<LabTestCatalogItem, 'id'>): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosInstance.post('/admin/lab-tests/catalog', data);
      return {
        success: true,
        data: response.data,
        message: 'Lab test created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to create lab test',
      };
    }
  },

  deleteLabTest: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosInstance.delete(`/admin/lab-tests/catalog/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Lab test deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to delete lab test',
      };
    }
  },
};
