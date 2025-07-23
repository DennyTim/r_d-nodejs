import React, {
    createContext,
    useContext,
    useMemo
} from "react";
import { ChatService } from "../lib/chatService";

interface Props {
    userName: string;
    children: React.ReactNode;
}

const ChatCtx = createContext<ChatService | null>(null);

export const ChatProvider = ({ userName, children }: Props) => {
    const svc = useMemo(() => {
        const s = new ChatService(userName);
        s.connectSocket();
        return s;
    }, [userName]);

    return <ChatCtx.Provider value={svc}>{children}</ChatCtx.Provider>;
};

export const useChatSvc = () => {
    const ctx = useContext(ChatCtx);
    if (!ctx) {
        throw new Error("ChatProvider missing");
    }
    return ctx;
};
