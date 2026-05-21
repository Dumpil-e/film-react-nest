import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FilmDocument = HydratedDocument<Film>;

@Schema({ collection: 'films' })
export class Film {
  @Prop({ required: true, unique: true })
  id: string;
  @Prop({ required: true, min: 1, max: 10 })
  rating: number;
  @Prop({ required: true })
  director: string;
  @Prop({ type: [String], default: [] })
  tags: string[];
  @Prop({ required: true })
  image: string;
  @Prop({ required: true })
  cover: string;
  @Prop({ required: true, index: true })
  title: string;
  @Prop({ required: true })
  about: string;
  @Prop({ required: true })
  description: string;
  @Prop({
    type: [
      {
        id: { type: String, required: true }, // UUID сеанса
        daytime: { type: Date, required: true },
        hall: { type: Number, required: true },
        rows: { type: Number, required: true },
        seats: { type: Number, required: true },
        price: { type: Number, required: true },
        taken: { type: [String], default: [] }, // массив UUID занятых мест
      },
    ],
    default: [],
    _id: false, // чтобы не создавались лишние _id у каждого элемента schedule
  })
  schedule: Array<{
    id: string;
    daytime: Date;
    hall: number;
    rows: number;
    seats: number;
    price: number;
    taken: string[];
  }>;
}

export const FilmSchema = SchemaFactory.createForClass(Film);
