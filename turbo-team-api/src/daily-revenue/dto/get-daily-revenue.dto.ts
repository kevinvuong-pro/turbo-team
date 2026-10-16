import { Matches, IsNotEmpty, IsString } from 'class-validator';

export class GetDailyRevenueDto {
  @IsString({ message: 'Date must be a string' })
  @IsNotEmpty({ message: 'Date is required' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  date: string;
}
