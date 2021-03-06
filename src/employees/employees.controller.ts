import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Patch,
  Param,
  Get,
  Delete,
  HttpCode,
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
      const { name, post, admission, active, projects } = updateEmployeeDto;
      return await this.employeesService.update(id, {
        name,
        post,
        admission,
        active,
        projects,
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      if (error.name === 'NotFoundError') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    try {
      return await this.employeesService.delete(id);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw error;
    }
  }

  @Get('all')
  async listEmployees() {
    try {
      return await this.employeesService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async listEmployee(@Param('id') id: string) {
    try {
      return await this.employeesService.findOne(id);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw error;
    }
  }
}
