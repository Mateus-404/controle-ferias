import { formatDate } from '../utils/date'
import { type Request, type RequestStatus } from '../types/requests'
import editIcon from '../assets/ferramenta-lapis.png'
import deleteIcon from '../assets/lata-de-lixo.png'
import { deleteUserRequest } from '../services/api'

type RequestType = "ferias" | "day-off"

type Props = {
  request: Request
  onClose: () => void
  onDelete: () => void
  onEdit: () => void
  onSubmit: () => void
  role: string
}

const user = JSON.parse(localStorage.getItem('@biud-time:user') || '{}')
const role = user.role

const typeLabels: Record<RequestType, string> = {
  "ferias": "⛱️ Férias",
  "day-off": "💆🏻‍♂️ Day Off",
};

const statusLabels: Record<RequestStatus, string> = {
  "DRAFT": "Rascunho",
  "PENDING": "Pendente",
  "APPROVED": "Aprovado",
  "REJECTED": "Reprovado",
};

const showApproveButton = (status: RequestStatus, role: string) => {
  return status === 'PENDING' && role === 'admin' || role === 'gestor'
}

const showRejectButton = (status: RequestStatus, role: string) => {
  return status === 'PENDING' && role === 'admin' || role === 'gestor'
}

export function RequestModal({ request, onClose, onDelete, onEdit, onSubmit }: Props) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteUserRequest(request.id)
      onDelete()
    } catch (error: any) {
      console.error("Failed to delete request:", error)
      const errDetails = {
        message: error.message,
        name: error.name,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      };
      alert(`Debug: ${JSON.stringify(errDetails, null, 2)}`);
    }
  }

  return (

    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <p className="close-button" onClick={onClose}>
          ✕
        </p>
        <h2>Detalhes da solicitação</h2>

        <p>
          <strong>Tipo:</strong> {typeLabels[request.type]}
        </p>

        <p>
          <strong>Status:</strong> {statusLabels[request.status]}
        </p>

        <p>
          <strong>Período:</strong>{" "}
          {formatDate(request.start_date)} → {formatDate(request.end_date)}
        </p>
        <div className="modal-actions-overlay">
          <button className="edit-btn" title="Editar Solicitação" onClick={onEdit}><img src={editIcon} alt="edit" /></button>
          <button className="delete-btn" title="Excluir Solicitação" onClick={handleDelete}><img src={deleteIcon} alt="delete" /></button>
          {request.status === 'DRAFT' && (
            <button className="submit-btn" title="Enviar Solicitação" onClick={onSubmit}>Enviar</button>
          )}

          {showRejectButton(request.status, role) && (
            <button className="btn-secondary" title="Reprovar Solicitação" onClick={onSubmit}>Reprovar</button>
          )}

          {showApproveButton(request.status, role) && (
            <button className="submit-btn" title="Aprovar Solicitação" onClick={onSubmit}>Aprovar</button>
          )}

        </div>
      </div>
    </div>
  )
}