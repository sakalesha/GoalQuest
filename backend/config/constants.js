// server/config/constants.js

export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin'
};

export const PHASES = {
  GOAL_SETTING: 'GOAL_SETTING',
  Q1: 'Q1',
  Q2: 'Q2',
  Q3: 'Q3',
  Q4: 'Q4'
};

export const CYCLE_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED'
};

export const GOAL_SHEET_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  LOCKED: 'LOCKED'
};

export const UOM_TYPES = {
  MIN: 'MIN',
  MAX: 'MAX',
  TIMELINE: 'TIMELINE',
  ZERO: 'ZERO'
};

export const GOAL_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  ON_TRACK: 'ON_TRACK',
  COMPLETED: 'COMPLETED'
};

export const ENTITY_TYPES = {
  GOAL: 'goal',
  GOAL_SHEET: 'goalSheet',
  CHECK_IN: 'checkIn'
};
