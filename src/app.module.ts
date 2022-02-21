import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmployeesModule } from './employees/employees.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb/projects-manager'),
    EmployeesModule,
    ProjectsModule,
  ],
})
export class AppModule {}
