import {
    Avatar,
    ListItemAvatar,
    ListItemButton,
    ListItemText
} from "@mui/material";
import React from "react";
import { ChatDTO } from "../lib/types";

interface Props {
    chat: ChatDTO;
    selected: boolean;
    you: string;
    onSelect: (c: ChatDTO) => void;
}

export const ChatItem = ({ chat, selected, onSelect, you }: Props) => (
    <ListItemButton
        selected={selected}
        onClick={() => onSelect(chat)}
    >
        <ListItemAvatar>
            <Avatar>{chat.name.replace("&", "").replace(you, "").trim()[0]?.toUpperCase()}</Avatar>
        </ListItemAvatar>
        <ListItemText
            primary={chat.name}
            secondary={`${chat.members.length} members`}
        />
    </ListItemButton>
);
