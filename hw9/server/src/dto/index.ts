export interface UserDTO {
  id: string;
  name: string;
  iconUrl: string;
}

export interface ChatDTO {
  id: string;
  name: string;
  members: string[];
  updatedAt: string;
}

export interface MessageDTO {
  id: string;
  chatId: string;
  author: string;
  text: string;
  sentAt: string;
}
