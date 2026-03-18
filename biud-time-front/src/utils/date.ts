import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(dateString: string) {
  return format(parseISO(dateString), "dd/MM/yyyy", {
    locale: ptBR,
  });
}