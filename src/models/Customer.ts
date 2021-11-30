import { Address } from '.';

export interface Customer {
  email: string;
  mobileNumber: string;
  address: Address;
  personalNumber: string;
  organizationNumber: string;
}
