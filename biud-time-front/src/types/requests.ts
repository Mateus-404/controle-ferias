export type Request = {
  id: string
  type: "ferias" | "day-off"
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
  start_date: string
  end_date: string
}

export type loginInput = {
  email: string
  password: string
}

export type loginResponse = {
  token: string
  user: {
    id: string
    nome: string
    email: string
    role: string
  }
}

export type RequestStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"

export type RequestType = "ferias" | "day-off"