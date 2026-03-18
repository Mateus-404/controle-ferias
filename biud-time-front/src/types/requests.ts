export type Request = {
  id: string
  type: "ferias" | "day-off"
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
  start_date: string
  end_date: string
}