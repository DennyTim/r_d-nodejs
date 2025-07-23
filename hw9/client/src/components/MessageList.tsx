import {
    Box,
    List
} from "@mui/material";
import React, {
    useEffect,
    useRef
} from "react";
import {
    MessageDTO,
    UserDTO
} from "../lib/types";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
    messages: MessageDTO[];
    you: string,
    users: Record<string, UserDTO>;
}

export const MessageList = (data: MessageListProps) => {
    const { messages, you, users } = data;
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <Box
            flexGrow={1}
            overflow="auto"
            px={2}
            py={1}
        >
            <List>
                {messages.map((m) => <MessageItem
                    key={m.id}
                    msg={m}
                    you={you}
                    users={users}
                />)}
            </List>
            <div ref={endRef}/>
        </Box>
    );
};
