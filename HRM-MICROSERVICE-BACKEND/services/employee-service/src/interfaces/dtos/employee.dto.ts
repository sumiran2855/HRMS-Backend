export interface Education {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  cgpa?: number;
}

export interface Experience {
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  hireDate?: string;
  userName?: string;
}

export interface SocialProfile {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
}

export interface EmergencyContactPerson {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface EmergencyContact {
  primary: EmergencyContactPerson;
  secondary: EmergencyContactPerson;
}

export interface BankDetails {
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  branchName?: string;
  bicCode?: string;
  salary?: number;
}

export interface Passport {
  passportNumber?: string;
  nationality?: string;
  issueDate?: string;
  expiryDate?: string;
  scanCopy?: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  userName?: string;
  contactNumber?: string;
  address?: string;
  employeeId?: string;
  employeeDesignation?: string;
  joiningDate?: string;
  birthday?: string;
  gender?: string;
  employeePhoto?: string;
  contactInfo?: ContactInfo;
  socialProfile?: SocialProfile;
  emergencyContact?: EmergencyContact;
  education?: Education[];
  experience?: Experience[];
  bankDetails?: BankDetails;
  passport?: Passport;
  phone?: string;
  departmentId?: string;
  position?: string;
  salary?: number;
  hireDate?: string;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
  contactNumber?: string;
  address?: string;
  employeeId?: string;
  employeeDesignation?: string;
  joiningDate?: string;
  birthday?: string;
  gender?: string;
  employeePhoto?: string;
  contactInfo?: ContactInfo;
  socialProfile?: SocialProfile;
  emergencyContact?: EmergencyContact;
  education?: Education[];
  experience?: Experience[];
  bankDetails?: BankDetails;
  passport?: Passport;
  phone?: string;
  departmentId?: string;
  position?: string;
  salary?: number;
  hireDate?: string;
  isActive?: boolean;
}
