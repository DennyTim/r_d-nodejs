import {
    Box,
    Typography
} from "@mui/material";
import React from "react";

export const TypingIndicator = ({ user }: { user?: string }) => (
    <Box
        px={2}
        py={0.5}
    ><Typography
        variant="caption"
        color="text.secondary"
    >{user ?? "Someone"} is typing…</Typography></Box>
);
