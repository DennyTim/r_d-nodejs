export interface UserDTO {
  id: string;
  name: string;
  iconUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatDTO {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface MessageDTO {
  id: string;
  chatId: string;
  author: string;
  text: string;
  sentAt: string;
}
