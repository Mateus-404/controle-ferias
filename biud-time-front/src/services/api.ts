import axios from "axios"
import type { loginInput, loginResponse } from "../types/requests"
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("@biud-time:token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => {
    return Promise.reject(error)
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

//Criar solicitação
export async function createRequest(data: CreateRequestInput) {
    const response = await api.post("/requests", data)
    return response.data
}

//Saldo do usuário
export type UserBalance = {
    vacation_balance: number
    day_off_balance: number
}

//Buscar saldo do usuário
export async function getUserBalance(): Promise<UserBalance> {
    const response = await api.get<UserBalance>("/users/balance")
    return response.data
}

//Deletar solicitação
export async function deleteUserRequest(id: string) {
    const response = await api.delete(`/requests/${id}`)
    return response.data
}

//Deletar usuário
export async function deleteUser(id: string) {
    const response = await api.delete(`/users/${id}`)
    return response.data
}

//Atualizar solicitação
export async function updateRequest(id: string, data: CreateRequestInput) {
    const response = await api.put(`/requests/${id}`, data)
    return response.data
}

//Atualizar status da solicitação
export async function updateRequestStatus(id: string, status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED") {
    const response = await api.put(`/requests/${id}`, { status })
    return response.data
}

//Login
export async function login(data: loginInput) {
    const response = await api.post<loginResponse>("/auth/login", data)
    return response.data
}