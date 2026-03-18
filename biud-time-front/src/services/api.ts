const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
import axios from "axios"


export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
        "x-user-id": "00000000-0000-0000-0000-000000000001", // temporário até implementar autenticação real
    },
})

//Tipos da Request
export type Request = {
    id: string
    type: "ferias" | "day-off"
    status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
    start_date: string
    end_date: string
}

//Resposta padrão do GET /requests
export type GetRequestsResponse = {
    total: number
    data: Request[]
}

//Buscar solicitações
export async function getRequests(): Promise<GetRequestsResponse> {
    const response = await api.get<GetRequestsResponse>("/requests")
    return response.data
}

// Criar solicitação
export type CreateRequestInput = {
    type: "ferias" | "day-off"
    startDate: string
    endDate: string
}

export async function createRequest(data: CreateRequestInput) {
    const response = await api.post("/requests", data)
    return response.data
}

export type UserBalance = {
    vacation_balance: number
    day_off_balance: number
}

export async function getUserBalance(): Promise<UserBalance> {
    const response = await api.get<UserBalance>("/users/balance")
    return response.data
}

export async function deleteUserRequest(id: string) {
    const response = await api.delete(`/requests/${id}`)
    return response.data
}

export async function updateRequest(id: string, data: CreateRequestInput) {
    const response = await api.put(`/requests/${id}`, data)
    return response.data
}
