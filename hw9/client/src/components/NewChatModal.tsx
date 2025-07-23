import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@mui/material";
import React, { useState } from "react";
import { SelectUsersModal } from "./SelectUsersModal";

interface NewChatModalProps {
    onClose: () => void;
    onCreate: (members: string[], name?: string) => void;
}

export const NewChatModal = (data: NewChatModalProps) => {
    const { onClose, onCreate } = data;
    const [name, setName] = useState("");
    const [members, setMembers] = useState<string[]>([]);
    const [picker, setPicker] = useState(false);

    return (
        <>
            <Dialog
                open
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Create chat</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setPicker(true)}
                    >
                        {members.length ? `Members (${members.length})` : "Choose members"}
                    </Button>
                    <TextField
                        label="Chat name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => onCreate(members, name || undefined)}
                        disabled={members.length === 0}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* picker */}
            {picker && (
                <SelectUsersModal
                    open
                    initial={members}
                    onDone={(sel) => {
                        setMembers(sel);
                        setPicker(false);
                    }}
                    onClose={() => setPicker(false)}
                />
            )}
        </>
    );
};
