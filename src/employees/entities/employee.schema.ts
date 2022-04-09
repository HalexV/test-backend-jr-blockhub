import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Project } from 'src/projects/entities/project.schema';

export type EmployeeDocument = Employee & Document;

@Schema()
export class Employee {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  post: string;

  @Prop({
    required: true,
  })
  admission: Date;

  @Prop({
    default: true,
  })
  active: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    default: [],
  })
  projects: Project[];
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
