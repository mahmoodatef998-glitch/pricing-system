import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  setAuthToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  clearAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  async login(username: string, password: string) {
    const response = await this.client.post('/api/auth/login', { username, password });
    if (response.data.token) {
      this.setAuthToken(response.data.token);
    }
    return response.data;
  }

  async matchProduct(criteria: {
    description: string;
    size: string;
    breakers: string;
    brand: string;
    ipEnclosure?: string;
    pole?: string;
  }) {
    const response = await this.client.post('/api/match', criteria);
    return response.data;
  }

  async getProducts(filters?: {
    page?: number;
    limit?: number;
    brand?: string;
    description?: string;
  }) {
    const response = await this.client.get('/api/products', { params: filters });
    return response.data;
  }

  async getProduct(id: number) {
    const response = await this.client.get(`/api/products/${id}`);
    return response.data;
  }

  async createProduct(
    data: {
      description: string;
      size: string;
      breakers: string;
      brand: string;
      ipEnclosure?: string;
      pole?: string;
      price?: string;
    },
    files?: File[]
  ) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await this.client.post('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateProduct(
    id: number,
    data: {
      description?: string;
      size?: string;
      breakers?: string;
      brand?: string;
      ipEnclosure?: string;
      pole?: string;
      price?: string;
    },
    files?: File[]
  ) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await this.client.put(`/api/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteProduct(id: number) {
    const response = await this.client.delete(`/api/products/${id}`);
    return response.data;
  }

  // Export
  async exportToExcel(filters?: { brand?: string; description?: string }, productIds?: number[]) {
    const params: any = { ...filters };
    if (productIds && productIds.length > 0) {
      params.ids = productIds.join(',');
    }
    const response = await this.client.get('/api/export/excel', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async exportToPDF(filters?: { brand?: string; description?: string }, productIds?: number[]) {
    const params: any = { ...filters };
    if (productIds && productIds.length > 0) {
      params.ids = productIds.join(',');
    }
    const response = await this.client.get('/api/export/pdf', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async exportSelectedExcel(productIds: number[]) {
    return this.exportToExcel(undefined, productIds);
  }

  async exportSelectedPDF(productIds: number[]) {
    return this.exportToPDF(undefined, productIds);
  }

  // Bulk Operations
  async bulkDelete(ids: number[]) {
    const response = await this.client.post('/api/bulk/delete', { ids });
    return response.data;
  }

  async bulkUpdate(ids: number[], data: { brand?: string; description?: string; price?: string }) {
    const response = await this.client.post('/api/bulk/update', { ids, data });
    return response.data;
  }

  // Analytics
  async getAnalytics() {
    const response = await this.client.get('/api/analytics');
    return response.data;
  }

  // History
  async getHistory(productId?: number, page?: number, limit?: number) {
    const response = await this.client.get('/api/history', {
      params: { productId, page, limit },
    });
    return response.data;
  }
}

export const api = new ApiClient();

