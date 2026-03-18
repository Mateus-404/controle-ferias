import { formatDate } from "../utils/date";

type RequestType = "ferias" | "day-off";

type Request = {
  id: string;
  type: RequestType;
  status: string;
  start_date: string;
  end_date: string;
};

type Props = {
  request: Request;
  onClick: () => void;
}

const typeLabels: Record<RequestType, string> = {
  "ferias": "⛱️ Férias",
  "day-off": "💆🏻‍♂️ Day Off",
};

export function RequestCard({ request, onClick }: Props) {
  return (
    <div className="card" onClick={onClick}>
      <h3 className="card-title">
        {typeLabels[request.type]}
      </h3>

      <span className={`status status-${request.status.toLowerCase()}`}>
        {request.status}
      </span>

      <p className="period">
        📆 {formatDate(request.start_date)} → {formatDate(request.end_date)}
      </p>
    </div>
  );
}