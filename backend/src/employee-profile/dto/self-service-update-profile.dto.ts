// ./src/employee-profile/dto/self-service-update-profile.dto.ts

export class AddressDto {
    city?: string;
    streetAddress?: string;
    country?: string;
  }
  
  /**
   * Fields that employees can update directly (no approval).
   * Maps to BR 2g, 2n, 2o and US-E2-05 / US-E2-12.
   */
  export class SelfServiceUpdateProfileDto {
    personalEmail?: string;
    mobilePhone?: string;
    homePhone?: string;
    biography?: string;
    profilePictureUrl?: string;
    address?: AddressDto;
  }
  