import {
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField
} from "@mui/material";
import React, { useState } from "react";
import { ChatService } from "../lib/chatService";

export const LoginDialog = ({ onLogin }: { onLogin: (name: string) => void }) => {
    const [name, setName] = useState("");
    const [file, setFile] = useState<File>();
    const [preview, setPreview] = useState<string>();

    const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handle = async () => {
        await ChatService.createUser(name.trim(), file);      // створюємо / оновлюємо
        onLogin(name.trim());
    };

    return (
        <Dialog open>
            <DialogTitle>Welcome</DialogTitle>
            <DialogContent>
                <Stack
                    spacing={2}
                    sx={{ mt: 1 }}
                >
                    <TextField
                        autoFocus
                        fullWidth
                        label="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                    >
                        <Avatar
                            src={preview}
                            sx={{ width: 56, height: 56 }}
                        >
                            {name[0]?.toUpperCase()}
                        </Avatar>
                        <Button
                            variant="outlined"
                            component="label"
                        >
                            Upload icon
                            <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={pick}
                            />
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={!name.trim()}
                    onClick={handle}
                >
                    Sign in
                </Button>
            </DialogActions>
        </Dialog>
    );
};
