import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb/projects-manager'),
    EmployeesModule,
  ],
})
export class AppModule {}
