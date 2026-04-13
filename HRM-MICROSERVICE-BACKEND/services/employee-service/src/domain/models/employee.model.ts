import { Schema, Document, model } from 'mongoose';

export interface IEducation {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  cgpa?: number;
}

export interface IExperience {
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface IEmployee extends Document {
  _id: string;

  firstName: string;
  lastName: string;
  userName?: string;
  email: string;
  contactNumber?: string;
  address?: string;
  employeeId?: string;
  employeeDesignation?: string;
  joiningDate?: Date;
  birthday?: Date;
  gender?: string;
  employeePhoto?: string;

  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
    hireDate?: Date;
    userName?: string;
  };

  socialProfile?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };

  emergencyContact?: {
    primary: {
      name?: string;
      relationship?: string;
      phone?: string;
      email?: string;
      address?: string;
    };
    secondary: {
      name?: string;
      relationship?: string;
      phone?: string;
      email?: string;
      address?: string;
    };
  };

  education?: IEducation[];

  experience?: IExperience[];

  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    bankName?: string;
    branchName?: string;
    bicCode?: string;
    salary?: number;
  };

  passport?: {
    passportNumber?: string;
    nationality?: string;
    issueDate?: Date;
    expiryDate?: Date;
    scanCopy?: string;
  };

  phone?: string;
  departmentId?: string;
  position?: string;
  salary?: number;
  hireDate?: Date;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema({
  institution: { type: String, trim: true },
  degree: { type: String, trim: true },
  fieldOfStudy: { type: String, trim: true },
  startDate: { type: String },
  endDate: { type: String },
  cgpa: { type: Number, min: 0, max: 10 },
});

const ExperienceSchema = new Schema({
  company: { type: String, trim: true },
  position: { type: String, trim: true },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String, trim: true },
});

const employeeSchema = new Schema<IEmployee>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    employeeDesignation: {
      type: String,
      trim: true,
    },
    joiningDate: {
      type: Date,
    },
    birthday: {
      type: Date,
    },
    gender: {
      type: String,
      trim: true,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    employeePhoto: {
      type: String,
      trim: true,
    },

    contactInfo: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      address: { type: String, trim: true },
      hireDate: { type: Date },
      userName: { type: String, trim: true },
    },

    socialProfile: {
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
    },

    emergencyContact: {
      primary: {
        name: { type: String, trim: true },
        relationship: { type: String, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        address: { type: String, trim: true },
      },
      secondary: {
        name: { type: String, trim: true },
        relationship: { type: String, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        address: { type: String, trim: true },
      },
    },

    education: [EducationSchema],

    experience: [ExperienceSchema],

    bankDetails: {
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      bankName: { type: String, trim: true },
      branchName: { type: String, trim: true },
      bicCode: { type: String, trim: true },
      salary: { type: Number, min: 0 },
    },

    passport: {
      passportNumber: { type: String, trim: true },
      nationality: { type: String, trim: true },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      scanCopy: { type: String, trim: true },
    },

    phone: {
      type: String,
      trim: true,
    },
    departmentId: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    salary: {
      type: Number,
      min: 0,
    },
    hireDate: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Employee = model<IEmployee>('Employee', employeeSchema);
