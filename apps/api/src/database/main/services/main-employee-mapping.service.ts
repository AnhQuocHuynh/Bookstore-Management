import { EmployeeMapping } from '@/database/main/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MainEmployeeMappingService {
  constructor(
    @InjectRepository(EmployeeMapping)
    private readonly employeeMappingRepo: Repository<EmployeeMapping>,
  ) {}

  async findBookStoresOfEmployee(email: string) {
    return this.employeeMappingRepo.find({
      where: {
        email,
      },
      relations: {
        bookstore: true,
      },
    });
  }

  async createNewEmployeeMapping(data: Partial<EmployeeMapping>) {
    const newRecord = this.employeeMappingRepo.create(data);
    return this.employeeMappingRepo.save(newRecord);
  }
}
