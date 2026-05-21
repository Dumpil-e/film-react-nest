import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema({ _id: false })
export class Schedule {
  @Prop({ required: true })
  id: string; // UUID сеанса

  @Prop({ required: true })
  daytime: Date;

  @Prop({ required: true, min: 0 })
  hall: number;

  @Prop({ required: true, min: 1 })
  rows: number;

  @Prop({ required: true, min: 1 })
  seats: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: [String], default: [] })
  taken: string[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
