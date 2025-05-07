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
    return this.resource.service.get(this.resource.path,  {params} );
  }

  public get(id: string | number, params?: object) {
    return this.resource.service.get(`${this.resource.path}/${id}`, { params });
  }

  public create(data: object) {
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
