export interface BaseRepo {
  findAll: () => Promise<any>;
  findById: (id: string | number) => Promise<any>;
  create: (data: any) => Promise<any>;
  update: (data: any, id: string | number) => Promise<any>;
  delete: (id: string | number) => Promise<any>;
}
