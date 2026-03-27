import { useState } from "react"
import { DayPicker, type DateRange } from "react-day-picker"
import { createRequest, updateRequest, type Request } from "../services/api"
import { format } from "date-fns"

type Props = {
  onClose: () => void
  onSuccess: () => void
  requestToEdit?: Request | null
}

export function CreateRequestModal({ onClose, onSuccess, requestToEdit }: Props) {
  const parseDate = (dateStr: string) => {
    const finalStr = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`
    const date = new Date(finalStr)
    return isNaN(date.getTime()) ? new Date(dateStr) : date
  }

  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (requestToEdit) {
      try {
        const from = parseDate(requestToEdit.start_date)
        const to = parseDate(requestToEdit.end_date)

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
          console.error("Datas inválidas recebidas:", requestToEdit.start_date, requestToEdit.end_date)
          return undefined
        }

        return { from, to }

      } catch (e) {
        console.error("Erro ao processar datas:", e)
        return undefined
      }
    }
    return undefined
  })

  const [requestType, setRequestType] = useState<"ferias" | "day-off">(requestToEdit?.type || "ferias")
  const [isLoading, setIsLoading] = useState(false)

  const calculateDays = () => {
    if (!range?.from || !range?.to) return 0
    // Diferença em milissegundos dividida por ms em um dia, arredondada e somada 1 para ser inclusiva
    const diffTime = Math.abs(range.to.getTime() - range.from.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const daysCount = calculateDays()

  const handleSubmit = async () => {
    if (!range?.from || !range?.to) return

    try {
      setIsLoading(true)
      const data = {
        type: requestType,
        startDate: format(range.from, "yyyy-MM-dd"),
        endDate: format(range.to, "yyyy-MM-dd")
      }

      if (requestToEdit) {
        await updateRequest(requestToEdit.id, data)
      } else {
        await createRequest(data)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Erro ao processar solicitação:", error)
      const message = error.response?.data?.message || error.message || "Erro desconhecido"
      alert(`Erro ao processar solicitação: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{requestToEdit ? "Editar solicitação" : "Nova solicitação"}</h2>

        <div className="form-group">
          <label style={{ fontWeight: 500 }}>Tipo de Solicitação:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="ferias"
                checked={requestType === "ferias"}
                onChange={() => setRequestType("ferias")}
              />
              Férias
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="day-off"
                checked={requestType === "day-off"}
                onChange={() => setRequestType("day-off")}
              />
              Day-off
            </label>
          </div>
        </div>

        <div className="form-group">
          <label style={{ fontWeight: 500 }}>Selecione o período:</label>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              modifiers={{
                disabled: (date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  return date < today
                }
              }}
            />
          </div>
        </div>

        {daysCount > 0 && (
          <div className="request-summary" style={{
            backgroundColor: "#f8f9fa",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #e9ecef"
          }}>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#495057" }}>
              <strong>Resumo:</strong> {daysCount} {daysCount === 1 ? "dia" : "dias"} de <strong>{requestType === "ferias" ? "Férias" : "Day-off"}</strong>
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#6c757d" }}>
              Período: {format(range!.from!, "dd/MM/yyyy")} até {format(range!.to!, "dd/MM/yyyy")}
            </p>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!range?.from || !range?.to || isLoading}
          >
            {isLoading ? <div className="spinner spinner-small spinner-white"></div> : (requestToEdit ? "Salvar alterações" : "Criar solicitação")}
          </button>
        </div>
      </div>
    </div>
  )
}