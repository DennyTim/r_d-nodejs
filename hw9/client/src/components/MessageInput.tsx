import SendIcon from "@mui/icons-material/Send";
import {
  IconButton,
  Paper,
  TextField
} from "@mui/material";
import React, {
  useEffect,
  useRef,
  useState
} from "react";
import {
  fromEvent,
  merge
} from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  map
} from "rxjs/operators";

interface Props {
    disabled?: boolean;
    onSend: (text: string) => void;
    onTyping: (isTyping: boolean) => void;
}

export const MessageInput = ({ disabled, onSend, onTyping }: Props) => {
    const [text, setText] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    // typing indicator debounce
    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const keyup$ = fromEvent<KeyboardEvent>(ref.current, "keydown")
            .pipe(map(() => true));

        const blur$ = fromEvent<FocusEvent>(ref.current, "blur")
            .pipe(map(() => false));

        const typing$ = merge(keyup$, blur$)
            .pipe(distinctUntilChanged(), debounceTime(300));

        const sub = typing$.subscribe(onTyping);

        return () => sub.unsubscribe();
    }, []);

    const handleSend = () => {
        if (!text.trim()) {
            return;
        }
        onSend(text.trim());
        setText("");
    };

    return (
        <Paper
            square
            sx={{ p: 1, display: "flex", gap: 1 }}
        >
            <TextField
                fullWidth
                multiline
                minRows={1}
                maxRows={4}
                inputRef={ref}
                placeholder="Type a message…"
                value={text}
                disabled={disabled}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
            />
            <IconButton
                color="primary"
                disabled={!text.trim() || disabled}
                onClick={handleSend}
            >
                <SendIcon/>
            </IconButton>
        </Paper>
    );
};
