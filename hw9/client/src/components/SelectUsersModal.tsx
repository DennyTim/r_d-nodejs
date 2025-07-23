import {
    Autocomplete,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@mui/material";
import React, {
    useEffect,
    useState
} from "react";
import { useChatSvc } from "../contexts/ChatContext";
import { UserDTO } from "../lib/types";

interface Props {
    open: boolean;
    initial: string[];
    onDone: (selected: string[]) => void;
    onClose: () => void;
}

export const SelectUsersModal = (data: Props) => {
    const { open, initial, onDone, onClose } = data;
    const svc = useChatSvc();
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState<UserDTO[]>([]);

    useEffect(() => {
        svc
            .listUsers()
            .then((all) => {
                setUsers(all.filter((u) => u.name !== svc.userName));
                setLoading(false);
                setValue(all.filter((u) => initial.includes(u.name)));
            });
    }, [open]);

    console.log("Users loaded:", users);

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="sm"
            onClose={onClose}
        >
            <DialogTitle>Select users</DialogTitle>
            <DialogContent sx={{ mt: 1 }}>
                {loading ? (
                    <CircularProgress/>
                ) : (
                    <Autocomplete
                        multiple
                        options={users}
                        getOptionLabel={(o) => o.name}
                        value={value}
                        onChange={(_, v) => setValue(v)}
                        renderTags={(tagValue, getTagProps) =>
                            tagValue.map((option, index) => (
                                <Chip
                                    label={option.name}
                                    {...getTagProps({ index })}
                                    key={option.id}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Users"
                                       placeholder="Type name…"
                            />
                        )}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={() => onDone(value.map((u) => u.name))}
                    disabled={!value.length}
                >
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};
