import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
    default: new Date(),
  })
  admission: Date;

  @Prop({
    default: true,
  })
  active: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
