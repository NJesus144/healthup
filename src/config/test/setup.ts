/* eslint-disable no-undef */
jest.mock('@/modules/notifications/jobs/emailQueue', () => ({
  __esModule: true,
  default: {
    addNewDoctorJob: jest.fn().mockResolvedValue(undefined),
    addNewAppointmentJob: jest.fn().mockResolvedValue(undefined),
    addCancelledAppointmentJob: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  },
}))
