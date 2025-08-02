import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Box,
    Divider,
    IconButton,
    List,
    Menu,
    MenuItem,
    Typography
} from "@mui/material";
import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import { ChatItem } from "../components/ChatItem";
import { ManageMembersModal } from "../components/ManageMembersModal";
import { MessageInput } from "../components/MessageInput";
import { MessageList } from "../components/MessageList";
import { NewChatModal } from "../components/NewChatModal";
import { TypingIndicator } from "../components/TypingIndicator";
import { useChatSvc } from "../contexts/ChatContext";

import {
    ChatDTO,
    MessageDTO,
    UserDTO
} from "../lib/types";

type TypingState = {
    isTyping: boolean;
    name?: string;
}

export const ChatLayout = ({ userName }: { userName: string }) => {
        const svc = useChatSvc();

        /* ----------------------- state ----------------------- */
        const [chats, setChats] = useState<ChatDTO[]>([]);
        const [current, setCurrent] = useState<ChatDTO | null>(null);
        const [messages, setMessages] = useState<MessageDTO[]>([]);
        const [typing, setTyping] = useState<TypingState>({ isTyping: false });
        const [users, setUsers] = useState<Record<string, UserDTO>>({});

        const [openNewChat, setOpenNewChat] = useState(false);
        const [anchor, setAnchor] = useState<null | HTMLElement>(null);
        const [manageOpen, setManageOpen] = useState(false);

        /* ------------------- live references ----------------- */
        const currentIdRef = useRef<string | null>(null);
        useEffect(() => {
            if (currentIdRef.current) {
                onTyping(false); // stop typing when switching chats
                svc.leaveChat(currentIdRef.current);
            }
            currentIdRef.current = current?.id ?? null;
        }, [current]);

        /* ---------------- initial load ----------------------- */
        useEffect(() => {
            svc.listChats().then(setChats);
        }, []);

        useEffect(() => {
            svc.listUsers().then((arr) => {
                setUsers(Object.fromEntries(arr.map((u) => [u.name, u])));
            });
        }, []);

        /* ---------------- message stream --------------------- */
        useEffect(() => {
            const sub = svc.onMessage().subscribe(async (m) => {
                if (!users[m.author]) {
                    const list = await svc.listUsers();
                    setUsers(Object.fromEntries(list.map(u => [u.name, u])));
                }
                if (m.chatId === currentIdRef.current) {
                    setMessages((prev) => [...prev, m]);
                }
            });
            return () => sub.unsubscribe();
        }, []);

        /* ---------------- typing stream ---------------------- */
        useEffect(() => {
            const sub = svc.onTyping().subscribe((t) => {
                const sameChat = t.chatId === currentIdRef.current;
                const notMe = t.user !== userName;

                if (sameChat && notMe) {
                    setTyping({
                        isTyping: t.isTyping,
                        name: t.user
                    });
                } else {
                    setTyping({ isTyping: false });
                }
            });
            return () => sub.unsubscribe();
        }, []);

        /* ---------------- chat + members events -------------- */
        useEffect(() => {
            const c1 = svc.onChatCreated().subscribe((c) => {
                return setChats((p) => [...p, c]);
            });
            const c2 = svc.onMembersUpdated().subscribe((u) =>
                setChats((p) => {
                    const result = p.map((c) =>
                        c.id === u.chatId ? { ...c, members: u.members } : c
                    ).filter(
                        (c) => c.members.includes(userName)
                    );

                    console.log("Updated chats:", result);
                    const isBanned = !u.members.includes(userName);
                    console.log({
                        isBanned,
                        currentId: currentIdRef.current,
                        chatId: u.chatId
                    });

                    if (isBanned && currentIdRef.current === u.chatId) {
                        leaveCurrentChat();
                    }

                    return result;
                })
            );
            return () => {
                c1.unsubscribe();
                c2.unsubscribe();
            };
        }, []);

        /* ---------------- helpers ---------------------------- */
        const selectChat = async (chat: ChatDTO) => {
            setCurrent(chat);
            svc.joinChat(chat.id);
            const list = await svc.listMessages(chat.id);
            setMessages(list.reverse());
        };

        function leaveCurrentChat() {
            if (!currentIdRef.current) {
                return;
            }
            svc.leaveChat(currentIdRef.current);
            setCurrent(null);
            setMessages([]);
            currentIdRef.current = null;
            console.log("Left chat:", currentIdRef.current);
        }

        const onSend = useCallback(
            (txt: string) => currentIdRef.current && svc.wsSend(currentIdRef.current, txt),
            [svc]
        );

        const onTyping = useCallback(
            (flag: boolean) =>
                currentIdRef.current && svc.wsTyping(currentIdRef.current, flag),
            [svc]
        );

        /* ===================================================== */
        return (
            <Box
                display="flex"
                height="100vh"
            >
                {/* ───── Left sidebar ───── */}
                <Box
                    width={280}
                    borderRight="1px solid #ddd"
                    display="flex"
                    flexDirection="column"
                >
                    <Box
                        p={2}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Typography variant="h6">Chats</Typography>
                        <IconButton
                            size="small"
                            onClick={() => setOpenNewChat(true)}
                        >
                            <AddIcon/>
                        </IconButton>
                    </Box>
                    <Divider/>
                    <List sx={{ flexGrow: 1, overflowY: "auto" }}>
                        {
                            chats
                                .toReversed()
                                .map((c) => {
                                    return (
                                        <ChatItem
                                            key={c.id}
                                            chat={c}
                                            selected={c.id === current?.id}
                                            onSelect={selectChat}
                                            you={userName}
                                        />
                                    );
                                })
                        }
                    </List>
                </Box>

                {/* ───── Main area ───── */}
                <Box
                    flexGrow={1}
                    display="flex"
                    flexDirection="column"
                >
                    {current ? (
                        <>
                            {/* header */}
                            <Box
                                p={2}
                                borderBottom="1px solid #ddd"
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Typography variant="h6">{current.name}</Typography>
                                <IconButton
                                    size="small"
                                    onClick={(e) => setAnchor(e.currentTarget)}
                                >
                                    <MoreVertIcon/>
                                </IconButton>
                            </Box>

                            {/* messages */}
                            <MessageList
                                messages={messages}
                                you={userName}
                                users={users}
                            />
                            {typing.isTyping && <TypingIndicator user={typing.name}/>}

                            {/* input */}
                            <MessageInput
                                disabled={!current}
                                onSend={onSend}
                                onTyping={onTyping}
                            />
                        </>
                    ) : (
                        <Box m="auto">
                            <Typography
                                variant="h5"
                                color="text.secondary"
                            >
                                Select a chat
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* ───── context menu ───── */}
                <Menu
                    anchorEl={anchor}
                    open={Boolean(anchor)}
                    onClose={() => setAnchor(null)}
                >
                    <MenuItem
                        onClick={() => {
                            setManageOpen(true);
                            setAnchor(null);
                        }}
                    >
                        Members…
                    </MenuItem>
                    <MenuItem
                        onClick={async () => {
                            if (!current) {
                                return;
                            }
                            await svc.updateMembers(current.id, [], [userName]);
                            setCurrent(null); // leave UI
                            setAnchor(null);
                        }}
                    >
                        Leave chat
                    </MenuItem>
                </Menu>

                {/* ───── manage members modal ───── */}
                {manageOpen && current && (
                    <ManageMembersModal
                        members={current.members}
                        me={userName}
                        onClose={() => setManageOpen(false)}
                        onSave={async (next) => {
                            const add = next.filter((u) => !current.members.includes(u));
                            const remove = current.members.filter((u) => !next.includes(u));
                            await svc.updateMembers(current.id, add, remove);
                            setManageOpen(false);
                        }}
                    />
                )}

                {/* ───── new chat modal ───── */}
                {openNewChat && (
                    <NewChatModal
                        onClose={() => setOpenNewChat(false)}
                        onCreate={async (members, name) => {
                            await svc.createChat(members, name);
                            setOpenNewChat(false);
                        }}
                    />
                )}
            </Box>
        );
    }
;
