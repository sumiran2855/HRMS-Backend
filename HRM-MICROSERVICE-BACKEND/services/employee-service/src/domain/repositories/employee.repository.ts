export interface IEmployeeRepository {
  create(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  findAll(filter?: any): Promise<any[]>;
  findByEmail(email: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<boolean>;
}
