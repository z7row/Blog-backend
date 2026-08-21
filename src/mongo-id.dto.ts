import { IsMongoId } from 'class-validator';

export class MongoIdDto {
  @IsMongoId({ message: 'Invalid MongoDB ID format' })
  id!: string;
}