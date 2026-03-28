export type WorkSession = {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null; // in milliseconds
  isActive: boolean;
  breaks: Break[];
};

export type Break = {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null; // in milliseconds
  isActive: boolean;
  type: 'lunch' | 'coffee' | 'personal';
  isPaid: boolean;
  pausesClock: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
};

export type AppUsage = {
  id: string;
  appName: string;
  appCategory: AppCategory;
  usageTime: number; // in milliseconds
  isWorkApp: boolean;
  iconUrl?: string;
};

export type AppCategory = 
  | 'productivity'
  | 'communication'
  | 'social'
  | 'entertainment'
  | 'games'
  | 'utilities'
  | 'other';

export type FocusMetrics = {
  focusScore: number; // 0-100
  productiveTime: number; // in milliseconds
  distractedTime: number; // in milliseconds
  breakTime: number; // in milliseconds
  totalWorkTime: number; // in milliseconds
  appUsage: AppUsage[];
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  profileType: 'employer' | 'employee';
  role: string;
  department: string;
  companyId: string;
  workSchedule: WorkSchedule;
  allowedApps: string[];
  geofencing?: GeofenceSettings;
  createdAt: Date;
  updatedAt: Date;
};

export type EmployerProfile = UserProfile & {
  profileType: 'employer';
  companySettings: CompanySettings;
  managedEmployees: string[]; // employee IDs
  permissions: EmployerPermissions;
};

export type EmployeeProfile = UserProfile & {
  profileType: 'employee';
  managerId: string;
  employeeSettings: EmployeeSettings;
};

export type CompanySettings = {
  companyName: string;
  timezone: string;
  workPolicies: WorkPolicies;
  appCategories: AppCategorySettings[];
  geofencing: GeofenceSettings;
  notifications: NotificationSettings;
};

export type WorkPolicies = {
  defaultWorkHours: {
    start: string;
    end: string;
  };
  breakPolicies: BreakPolicy[];
  overtimeRules: {
    enabled: boolean;
    maxHoursPerDay: number;
    requireApproval: boolean;
  };
  clockInGracePeriod: number; // minutes
  autoClockOut: {
    enabled: boolean;
    afterHours: number; // hours of inactivity
  };
};

export type BreakPolicy = {
  id: string;
  type: 'lunch' | 'coffee' | 'personal';
  duration: number; // in minutes
  isPaid: boolean;
  pausesClock: boolean;
  isRequired: boolean;
  scheduledTime?: string; // format: "HH:MM"
  maxPerDay: number;
};

export type AppCategorySettings = {
  category: AppCategory;
  isAllowed: boolean;
  timeRestrictions?: {
    maxDailyUsage: number; // minutes
    allowedHours: {
      start: string;
      end: string;
    };
  };
  specificApps: {
    appName: string;
    isAllowed: boolean;
  }[];
};

export type GeofenceSettings = {
  enabled: boolean;
  workLocations: WorkLocation[];
  autoClockIn: boolean;
  autoClockOut: boolean;
  radius: number; // meters
  requireLocationPermission: boolean;
};

export type WorkLocation = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  isActive: boolean;
};

export type NotificationSettings = {
  clockReminders: boolean;
  breakReminders: boolean;
  focusAlerts: boolean;
  productivityReports: boolean;
  scheduleChanges: boolean;
};

export type EmployerPermissions = {
  canManageEmployees: boolean;
  canViewReports: boolean;
  canModifyPolicies: boolean;
  canManageApps: boolean;
  canSetSchedules: boolean;
  canViewRealTimeData: boolean;
};

export type EmployeeSettings = {
  notifications: NotificationSettings;
  privacy: {
    shareDetailedReports: boolean;
    allowRealTimeMonitoring: boolean;
  };
  personalGoals: {
    dailyFocusTarget: number; // minutes
    weeklyProductivityGoal: number; // percentage
  };
};

export type WorkSchedule = {
  workDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  workHours: {
    start: string; // format: "HH:MM"
    end: string; // format: "HH:MM"
  };
  breakSchedule: BreakPolicy[];
  isFlexible: boolean;
  timezone: string;
};

export type ClockEvent = {
  id: string;
  employeeId: string;
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  method: 'manual' | 'geofence' | 'scheduled';
  notes?: string;
};