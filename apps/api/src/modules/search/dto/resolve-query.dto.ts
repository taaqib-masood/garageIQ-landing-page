import { IsString, IsNotEmpty } from 'class-validator';

export class ResolveQueryDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}
