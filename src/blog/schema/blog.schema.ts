import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Comment { 
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,index: true })
  author!: Types.ObjectId;

  @Prop({ required: true })
  content!: string;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;


  @Prop({type: String, ref: 'User'})
  logo?: string;

  @Prop({ type: String, ref: 'User' })
  banner?: string;
  
  @Prop({ type: [String], default: [] })
  media?: string[]; 


  @Prop({ type: Types.ObjectId, ref: 'User', required: true ,index: true})
  author!: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes!: Types.ObjectId[];

  @Prop({ type: [CommentSchema], default: [] })
  comments!: Comment[];
}

export const BlogSchema = SchemaFactory.createForClass(Blog);