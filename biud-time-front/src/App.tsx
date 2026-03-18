import { useEffect, useState } from "react"
import { getRequests, type Request, getUserBalance, type UserBalance } from "./services/api"
import { RequestCard } from "./components/RequestCard"
import { RequestModal } from "./components/RequestModal"
import "./App.css"
import { CreateRequestModal } from "./components/CreateRequestModal"

function App() {
  const [requests, setRequests] = useState<Request[]>([])
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [requestToEdit, setRequestToEdit] = useState<Request | null>(null)
  const [balance, setBalance] = useState<UserBalance | null>(null)

  const loadData = async () => {
    try {
      const [requestsData, balanceData] = await Promise.all([
        getRequests(),
        getUserBalance()
      ])
      setRequests(requestsData.data)
      setBalance(balanceData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedRequest(null)
        setCreateOpen(false)
        setRequestToEdit(null)
      }
    }

    window.addEventListener("keydown", handleEsc)

    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  if (loading) return <p className="loading">Carregando...</p>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Minhas solicitações</h1>
        <button
          className="new-request-btn"
          style={{ margin: 0 }}
          onClick={() => {
            setRequestToEdit(null)
            setCreateOpen(true)
          }}>
          Nova solicitação
        </button>
      </div>

      <div className="balance-container">
        <div className="balance-card">
          <span className="balance-title">Saldo de Férias</span>
          <span className="balance-value">{balance?.vacation_balance ?? 0} dias</span>
        </div>
        <div className="balance-card">
          <span className="balance-title">Day-off Disponível</span>
          <span className="balance-value">{balance?.day_off_balance ?? 0} dias</span>
        </div>
      </div>

      <div className="grid">
        {requests.map((req) => (
          <RequestCard
            key={req.id}
            request={req}
            onClick={() => setSelectedRequest(req)}
          />
        ))}
      </div>

      {selectedRequest && (
        <RequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDelete={() => {
            setSelectedRequest(null)
            loadData()
          }}
          onEdit={() => {
            setRequestToEdit(selectedRequest)
            setSelectedRequest(null)
            setCreateOpen(true)
          }}
        />
      )}

      {(createOpen || requestToEdit) && (
        <CreateRequestModal
          requestToEdit={requestToEdit}
          onClose={() => {
            setCreateOpen(false)
            setRequestToEdit(null)
          }}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}

export default App