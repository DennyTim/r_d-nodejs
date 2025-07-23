import React, { useState } from "react";
import { ChatProvider } from "../contexts/ChatContext";
import { ChatLayout } from "./ChatLayout";
import { LoginDialog } from "./LoginDialog";

export const App = () => {
    const [userName, setUserName] = useState(
        localStorage.getItem("userName") || ""
    );

    if (!userName) {
        return <LoginDialog
            onLogin={(u) => {
                localStorage.setItem("userName", u);
                setUserName(u);
            }}
        />;
    }

    return (
        <ChatProvider userName={userName}>
            <ChatLayout userName={userName}/>
        </ChatProvider>
    );
};
