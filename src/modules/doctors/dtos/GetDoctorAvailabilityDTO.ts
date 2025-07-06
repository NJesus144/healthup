export interface GetDoctorAvailabilityDTO {
  doctorId: string
  period: {
    startDate: Date
    endDate: Date
  }
  availability: Array<{
    date: Date
    times: Array<{
      time: string
      available: boolean
    }>
  }>
}
