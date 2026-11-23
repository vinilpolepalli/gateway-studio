export const money = (n: number) => (Math.abs(n) < 10 ? '$' + n.toFixed(2) : '$' + Math.round(n).toLocaleString('en-US'));
export const pct = (n: number) => `${Math.round(n * 100)}%`;
export const num = (n: number) => n.toLocaleString('en-US');
export function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
