export interface IEmployeeService {
  createEmployee(data: any): Promise<any>;
  getEmployeeById(id: string): Promise<any>;
  getAllEmployees(filter?: any): Promise<any[]>;
  updateEmployee(id: string, data: any): Promise<any>;
  deleteEmployee(id: string): Promise<boolean>;
}
