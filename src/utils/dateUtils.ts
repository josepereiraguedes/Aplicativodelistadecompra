export function format(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? 'Agora' : `${minutes} min atrás`;
    }
    return hours === 1 ? '1 hora atrás' : `${hours} horas atrás`;
  }
  
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days} dias atrás`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 semana atrás' : `${weeks} semanas atrás`;
  }
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatShort(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  });
}
