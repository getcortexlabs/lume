export interface LumeNotification {
  id: string;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
  read: boolean;
}
export interface NotificationsRepository {
  list(): Promise<LumeNotification[]>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
  subscribe(listener: () => void): () => void;
}
