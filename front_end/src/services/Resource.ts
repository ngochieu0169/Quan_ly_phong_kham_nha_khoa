import type { AxiosInstance } from "axios";

interface APIResource {
  service: AxiosInstance;
  path: string;
}

export default class Resource {
  constructor(protected resource: APIResource) {
    //
  }

  public all(params?: object) {
    return this.resource.service.get(this.resource.path, { params });
  }

  public get(id: string | number, params?: object) {
    return this.resource.service.get(`${this.resource.path}/${id}`, { params });
  }

  public create(data: object) {
    console.log('=== DEBUG Resource create ===');
    console.log('Path:', this.resource.path);
    console.log('Data before send:', data);
    console.log('Data stringified:', JSON.stringify(data));

    // Check for date fields specifically
    if (this.resource.path.includes('lichkham') && data && typeof data === 'object') {
      const dataObj = data as any;
      if (dataObj.ngayDatLich) {
        console.log('ngayDatLich before axios:', dataObj.ngayDatLich);
        console.log('ngayDatLich type:', typeof dataObj.ngayDatLich);

        // Force ensure YYYY-MM-DD format
        if (typeof dataObj.ngayDatLich === 'string' && !dataObj.ngayDatLich.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.warn('Invalid date format detected, attempting to fix...');
          const dateObj = new Date(dataObj.ngayDatLich);
          if (!isNaN(dateObj.getTime())) {
            dataObj.ngayDatLich = dateObj.toISOString().split('T')[0];
            console.log('Fixed ngayDatLich:', dataObj.ngayDatLich);
          }
        }
      }
    }

    return this.resource.service.post(this.resource.path, data);
  }

  public update(id: string | number, data: object) {
    return this.resource.service.put(`${this.resource.path}/${id}`, data);
  }

  public delete(id: string | number, params?: object) {
    return this.resource.service.delete(`${this.resource.path}/${id}`, {
      params,
    });
  }
}
