import { formatDate } from '../utils/date'
import { type Request } from '../types/requests'
import editIcon from '../assets/ferramenta-lapis.png'
import deleteIcon from '../assets/lata-de-lixo.png'
import { deleteUserRequest } from '../services/api'

type RequestType = "ferias" | "day-off"

type Props = {
  request: Request
  onClose: () => void
  onDelete: () => void
  onEdit: () => void
}

const typeLabels: Record<RequestType, string> = {
  "ferias": "⛱️ Férias",
  "day-off": "💆🏻‍♂️ Day Off",
};

export function RequestModal({ request, onClose, onDelete, onEdit }: Props) {
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
          <strong>Status:</strong> {request.status}
        </p>

        <p>
          <strong>Período:</strong>{" "}
          {formatDate(request.start_date)} → {formatDate(request.end_date)}
        </p>
        <div className="modal-actions-overlay">
          <button className="edit-btn" title="Editar Solicitação" onClick={onEdit}><img src={editIcon} alt="edit" /></button>
          <button className="delete-btn" title="Excluir Solicitação" onClick={handleDelete}><img src={deleteIcon} alt="delete" /></button>
        </div>
      </div>
    </div>
  )
}