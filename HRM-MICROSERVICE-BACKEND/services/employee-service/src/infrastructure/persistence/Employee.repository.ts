import { injectable } from 'inversify';
import { Employee } from '../../domain/models/employee.model';
import { IEmployeeRepository } from '../../domain/repositories/employee.repository';
import { Logger } from '../../shared/utils/logger.util';
import * as mongoose from 'mongoose';

const logger = new Logger('EmployeeRepository');

@injectable()
export class EmployeeRepository implements IEmployeeRepository {
  async create(data: any): Promise<any> {
    const employee = new Employee(data);
    return await employee.save();
  }

  async findById(id: string): Promise<any | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn(`Invalid ObjectId format: ${id}`);
      return null;
    }
    return await Employee.findById(id);
  }

  async findAll(filter: any = {}): Promise<any[]> {
    return await Employee.find(filter);
  }

  async findByEmail(email: string): Promise<any | null> {
    return await Employee.findOne({ email });
  }

  async update(id: string, data: any): Promise<any> {
    return await Employee.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Employee.findByIdAndDelete(id);
    return !!result;
  }
}
