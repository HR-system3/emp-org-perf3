// ./src/employee-profile/dto/self-service-update-profile.dto.ts
import {
  IsOptional,
  IsString,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';


export class AddressDto {
   @IsOptional()
   @IsString()
   city?: string;

   @IsOptional()
   @IsString()
   streetAddress?: string;

   @IsOptional()
   @IsString()
   country?: string;
  }
  
  /**
   * Fields that employees can update directly (no approval).
   * Maps to BR 2g, 2n, 2o and US-E2-05 / US-E2-12.
   */
  export class SelfServiceUpdateProfileDto {
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @IsOptional()
  @IsString()
  homePhone?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
  }
  