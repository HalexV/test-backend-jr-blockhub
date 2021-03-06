import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project, ProjectSchema } from './entities/project.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsMongoRepository } from './repositories/projects.mongo.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsMongoRepository],
  exports: [ProjectsMongoRepository],
})
export class ProjectsModule {}
