import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Patch,
  Param,
  Get,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    try {
      return await this.employeesService.create(createEmployeeDto);
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    try {
      return await this.employeesService.update(id, updateEmployeeDto);
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      throw error;
    }
  }

  @Get('all')
  async listEmployees() {
    try {
      return await this.employeesService.listAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async listEmployee(@Param('id') id: string) {
    try {
      return await this.employeesService.findById(id);
    } catch (error) {
      throw error;
    }
  }
}
