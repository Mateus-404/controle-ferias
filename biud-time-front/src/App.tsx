import { useEffect, useState } from "react"
import { getRequests, type Request, getUserBalance, type UserBalance, updateRequestStatus } from "./services/api"
import { RequestCard } from "./components/RequestCard"
import { RequestModal } from "./components/RequestModal"
import "./App.css"
import { CreateRequestModal } from "./components/CreateRequestModal"
import { Login } from "./components/Login"
import logoutIcon from "./assets/logout.png"

function App() {
  const [requests, setRequests] = useState<Request[]>([])
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [requestToEdit, setRequestToEdit] = useState<Request | null>(null)
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('@biud-time:token'))

  const handleLogout = () => {
    localStorage.removeItem('@biud-time:token')
    localStorage.removeItem('@biud-time:user')
    setIsAuthenticated(false)
  }

  const loadData = async () => {
    try {
      const [requestsData, balanceData] = await Promise.all([
        getRequests(),
        getUserBalance()
      ])
      setRequests(requestsData.data)
      setBalance(balanceData)
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error)
      if (error.response?.status === 401) {
        localStorage.removeItem('@biud-time:token')
        localStorage.removeItem('@biud-time:user')
        setIsAuthenticated(false)
      }
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

  if (!isAuthenticated) return <Login onLoginSuccess={() => {
    setIsAuthenticated(true)
    loadData()
  }} />

  if (loading) return <p className="loading">Carregando...</p>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Minhas solicitações</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="new-request-btn"
            style={{ margin: 0 }}
            onClick={() => {
              setRequestToEdit(null)
              setCreateOpen(true)
            }}>
            Nova solicitação
          </button>
          <button
            className="logout-btn"
            style={{ margin: 0 }}
            onClick={handleLogout}>
            <img src={logoutIcon} alt="Logout" className="logout-icon" />
          </button>
        </div>
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
          onSubmit={async () => {
            try {
              await updateRequestStatus(selectedRequest.id, "PENDING")
              setSelectedRequest(null)
              loadData()
            } catch (error) {
              console.error("Erro ao enviar:", error)
              alert("Erro ao enviar a solicitação.")
            }
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