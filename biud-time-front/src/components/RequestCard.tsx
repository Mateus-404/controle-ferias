import { formatDate } from "../utils/date";
import { type Request, type RequestStatus, type RequestType } from "../types/requests";

type Props = {
  request: Request;
  onClick: () => void;
}

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

export function RequestCard({ request, onClick }: Props) {
  return (
    <div className="card" onClick={onClick}>
      <h3 className="card-title">
        {typeLabels[request.type]}
      </h3>

      <span className={`status status-${request.status.toLowerCase()}`}>
        {statusLabels[request.status]}
      </span>

      <p className="period">
        📆 {formatDate(request.start_date)} → {formatDate(request.end_date)}
      </p>
    </div>
  );
}