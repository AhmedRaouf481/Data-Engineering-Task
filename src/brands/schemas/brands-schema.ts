import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CaBrandDocument = HydratedDocument<Brand>;

@Schema({ timestamps: true })
export class Brand {
	@Prop({
		type: String,
		required: [true, 'Brand name is required'],
		trim: true,
	})
	brandName: string;

	@Prop({
		type: Number,
		required: [true, 'Year founded is required'],
		min: [1600, 'Year founded seems too old'],
		max: [new Date().getFullYear(), 'Year founded cannot be in the future'],
	})
	yearFounded: number;

	@Prop({
		type: String,
		required: [true, 'Headquarters location is required'],
		trim: true,
	})
	headquarters: string;

	@Prop({
		type: Number,
		required: [true, 'Number of locations is required'],
		min: [1, 'There should be at least one location'],
	})
	numberOfLocations: number;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);