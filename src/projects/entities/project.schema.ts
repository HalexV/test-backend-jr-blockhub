import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema()
export class Project {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  description: string;

  @Prop({
    required: true,
  })
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({
    default: true,
  })
  active: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
