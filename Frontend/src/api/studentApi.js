import api from './axios';

export const getStudentsApi = (year, token) => api.get('/students', {
    params: { year },
    headers: { Authorization: `Bearer ${token}` }
});

export const createStudentApi = (data, token) => api.post('/students', data, {
    headers: { Authorization: `Bearer ${token}` }
});

export const updateStudentApi = (id, data, token) => api.put(`/students/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
});

export const deleteStudentApi = (id, token) => api.delete(`/students/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
});

export const exportExcelApi = (year, token) => api.get('/students/export/excel', {
    params: { year },
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
});

export const exportPDFApi = (year, token) => api.get('/students/export/pdf', {
    params: { year },
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
});

export const exportWordApi = (year, token) => api.get('/students/export/word', {
    params: { year },
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
});
