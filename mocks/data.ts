import { AppUsage, Break, FocusMetrics, UserProfile, WorkSchedule, WorkSession } from '@/types';

// Mock work schedule
export const mockWorkSchedule: WorkSchedule = {
  workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  workHours: {
    start: '09:00',
    end: '17:00',
  },
  breakSchedule: [
    {
      type: 'lunch',
      duration: 60,
      startTime: '12:00',
    },
    {
      type: 'coffee',
      duration: 15,
      startTime: '10:30',
    },
    {
      type: 'coffee',
      duration: 15,
      startTime: '15:30',
    },
  ],
};

// Mock user profile
export const mockUserProfile: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@company.com',
  role: 'Software Developer',
  department: 'Engineering',
  workSchedule: mockWorkSchedule,
  allowedApps: [
    'Slack',
    'Microsoft Teams',
    'VS Code',
    'GitHub',
    'Gmail',
    'Google Calendar',
    'Notion',
    'Figma',
  ],
};

// Mock work sessions
export const mockWorkSessions: WorkSession[] = [
  {
    id: '1',
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(17, 0, 0, 0)),
    duration: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    isActive: false,
    breaks: [
      {
        id: '1',
        startTime: new Date(new Date().setHours(12, 0, 0, 0)),
        endTime: new Date(new Date().setHours(13, 0, 0, 0)),
        duration: 60 * 60 * 1000, // 1 hour in milliseconds
        isActive: false,
        type: 'lunch',
      },
      {
        id: '2',
        startTime: new Date(new Date().setHours(10, 30, 0, 0)),
        endTime: new Date(new Date().setHours(10, 45, 0, 0)),
        duration: 15 * 60 * 1000, // 15 minutes in milliseconds
        isActive: false,
        type: 'coffee',
      },
      {
        id: '3',
        startTime: new Date(new Date().setHours(15, 30, 0, 0)),
        endTime: new Date(new Date().setHours(15, 45, 0, 0)),
        duration: 15 * 60 * 1000, // 15 minutes in milliseconds
        isActive: false,
        type: 'coffee',
      },
    ],
  },
  {
    id: '2',
    startTime: new Date(new Date().setDate(new Date().getDate() - 1)),
    endTime: new Date(new Date().setDate(new Date().getDate() - 1)),
    duration: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    isActive: false,
    breaks: [
      {
        id: '4',
        startTime: new Date(new Date().setDate(new Date().getDate() - 1)),
        endTime: new Date(new Date().setDate(new Date().getDate() - 1)),
        duration: 60 * 60 * 1000, // 1 hour in milliseconds
        isActive: false,
        type: 'lunch',
      },
    ],
  },
];

// Mock app usage data
export const mockAppUsage: AppUsage[] = [
  {
    id: '1',
    appName: 'Slack',
    appCategory: 'communication',
    usageTime: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    isWorkApp: true,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png',
  },
  {
    id: '2',
    appName: 'VS Code',
    appCategory: 'productivity',
    usageTime: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
    isWorkApp: true,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/2048px-Visual_Studio_Code_1.35_icon.svg.png',
  },
  {
    id: '3',
    appName: 'GitHub',
    appCategory: 'productivity',
    usageTime: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
    isWorkApp: true,
    iconUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
  },
  {
    id: '4',
    appName: 'Instagram',
    appCategory: 'social',
    usageTime: 30 * 60 * 1000, // 30 minutes in milliseconds
    isWorkApp: false,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png',
  },
  {
    id: '5',
    appName: 'Twitter',
    appCategory: 'social',
    usageTime: 15 * 60 * 1000, // 15 minutes in milliseconds
    isWorkApp: false,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/2491px-Logo_of_Twitter.svg.png',
  },
];

// Mock focus metrics
export const mockFocusMetrics: FocusMetrics = {
  focusScore: 85,
  productiveTime: 7 * 60 * 60 * 1000, // 7 hours in milliseconds
  distractedTime: 45 * 60 * 1000, // 45 minutes in milliseconds
  breakTime: 1.5 * 60 * 60 * 1000, // 1.5 hours in milliseconds
  totalWorkTime: 9 * 60 * 60 * 1000, // 9 hours in milliseconds
  appUsage: mockAppUsage,
};

// Mock breaks
export const mockBreaks: Break[] = [
  {
    id: '1',
    startTime: new Date(new Date().setHours(12, 0, 0, 0)),
    endTime: new Date(new Date().setHours(13, 0, 0, 0)),
    duration: 60 * 60 * 1000, // 1 hour in milliseconds
    isActive: false,
    type: 'lunch',
  },
  {
    id: '2',
    startTime: new Date(new Date().setHours(10, 30, 0, 0)),
    endTime: new Date(new Date().setHours(10, 45, 0, 0)),
    duration: 15 * 60 * 1000, // 15 minutes in milliseconds
    isActive: false,
    type: 'coffee',
  },
  {
    id: '3',
    startTime: new Date(new Date().setHours(15, 30, 0, 0)),
    endTime: new Date(new Date().setHours(15, 45, 0, 0)),
    duration: 15 * 60 * 1000, // 15 minutes in milliseconds
    isActive: false,
    type: 'coffee',
  },
];