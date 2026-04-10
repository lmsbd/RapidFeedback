import styles from './DefaultAvatar.module.less';

const PALETTE = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
  '#6366f1', '#14b8a6', '#e11d48', '#0ea5e9',
];

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export default function DefaultAvatar({ name, size = 72 }) {
  const initials = getInitials(name);
  const bgColor = PALETTE[hashName(name || '?') % PALETTE.length];
  const fontSize = size * 0.4;

  return (
    <div
      className={styles.defaultAvatar}
      style={{ width: size, height: size, backgroundColor: bgColor, fontSize }}
    >
      {initials}
    </div>
  );
}
