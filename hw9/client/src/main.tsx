import {
    createTheme,
    CssBaseline,
    ThemeProvider
} from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./views/App";

const theme = createTheme({ palette: { mode: "light", primary: { main: "#1976d2" } } });

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <App/>
        </ThemeProvider>
    </React.StrictMode>
);
