import { useEffect, useState } from "react"
import { getRequests, type Request, getUserBalance, type UserBalance, updateRequestStatus, getTeamRequests } from "./services/api"
import { RequestCard } from "./components/RequestCard"
import { RequestModal } from "./components/RequestModal"
import "./App.css"
import { CreateRequestModal } from "./components/CreateRequestModal"
import { Login } from "./components/Login"
import { Register } from "./components/Register"
import logoutIcon from "./assets/logout.png"

function App() {
  const [requests, setRequests] = useState<Request[]>([])
  const [teamRequests, setTeamRequests] = useState<Request[]>([])
  const [activeTab, setActiveTab] = useState<'minhas' | 'equipe'>('minhas')
  const [isRegistering, setIsRegistering] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [requestToEdit, setRequestToEdit] = useState<Request | null>(null)
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('@biud-time:token'))

  const user = JSON.parse(localStorage.getItem('@biud-time:user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('@biud-time:token')
    localStorage.removeItem('@biud-time:user')
    setIsAuthenticated(false)
  }

  const loadData = async () => {
    try {
      const u = JSON.parse(localStorage.getItem('@biud-time:user') || '{}')
      const isAdminOrGestor = u?.role === 'admin' || u?.role === 'gestor'

      const promises: any[] = [getRequests(), getUserBalance()]
      if (isAdminOrGestor) {
        promises.push(getTeamRequests())
      }

      const [requestsData, balanceData, teamData] = await Promise.all(promises)

      setRequests(requestsData.data)
      setBalance(balanceData)
      if (teamData) {
        setTeamRequests(teamData.data)
      }
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

  if (!isAuthenticated) {
    if (isRegistering) {
      return (
        <Register
          onRegisterSuccess={() => {
            setIsAuthenticated(true)
            loadData()
          }}
          onSwitchToLogin={() => setIsRegistering(false)}
        />
      )
    }

    return (
      <Login
        onLoginSuccess={() => {
          setIsAuthenticated(true)
          loadData()
        }}
        onSwitchToRegister={() => setIsRegistering(true)}
      />
    )
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner"></div>
      <p style={{ color: '#555', fontWeight: 500 }}>Carregando dados...</p>
    </div>
  )

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Gestão de Ponto</h1>
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

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          className={activeTab === 'minhas' ? 'submit-btn' : 'btn-secondary'}
          style={{ margin: 0 }}
          onClick={() => setActiveTab('minhas')}>
          Minhas solicitações
        </button>

        {(user?.role === 'admin' || user?.role === 'gestor') && (
          <button
            className={activeTab === 'equipe' ? 'submit-btn' : 'btn-secondary'}
            style={{ margin: 0 }}
            onClick={() => setActiveTab('equipe')}>
            Solicitações da equipe
          </button>
        )}
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
        {(activeTab === 'minhas' ? (requests || []) : (teamRequests || [])).map((req) => (
          <RequestCard
            key={req.id}
            request={req}
            userRole={user?.role}
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
          onApprove={async () => {
            try {
              await updateRequestStatus(selectedRequest.id, "APPROVED")
              setSelectedRequest(null)
              loadData()
            } catch (error) {
              console.error("Erro ao aprovar:", error)
              alert("Erro ao aprovar a solicitação.")
            }
          }}
          onReject={async () => {
            try {
              await updateRequestStatus(selectedRequest.id, "REJECTED")
              setSelectedRequest(null)
              loadData()
            } catch (error) {
              console.error("Erro ao reprovar:", error)
              alert("Erro ao reprovar a solicitação.")
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