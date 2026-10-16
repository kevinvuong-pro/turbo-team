import { Type } from 'class-transformer';
import { Matches, IsNotEmpty, IsString, IsNumber, IsInt, Min } from 'class-validator';

export class UpsertDailyRevenueDto {
  @IsString({ message: 'Date must be a string' })
  @IsNotEmpty({ message: 'Date is required' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'POS Revenue must be a number' })
  @Min(0, {
    message: 'POS Revenue must be greater than or equal to 0',
  })
  posRevenue: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Eatclub Revenue must be a number' })
  @Min(0, {
    message: 'Eatclub Revenue must be greater than or equal to 0',
  })
  eatclubRevenue: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Labour Costs must be a number' })
  @Min(0, {
    message: 'Labour Costs must be greater than or equal to 0',
  })
  labourCosts: number;

  @Type(() => Number)
  @IsInt({ message: 'Covers must be an integer' })
  @Min(0, {
    message: 'Covers must be greater than or equal to 0',
  })
  covers: number;
}
