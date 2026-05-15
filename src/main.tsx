import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { FloatingButton } from "./components/FloatingButton";
import { initStickyHeaderScroll } from "./sticky-header-scroll";
import "./figma-color-variables.css";
import "../styles.css";

const muiTheme = createTheme({
  components: {
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: "var(--shadow-fab, var(--occam-elevation-2dp))",
        },
      },
    },
  },
});

initStickyHeaderScroll();

function mountStickyHeaderFab(
  mount: HTMLElement | null,
  node: ReactNode,
) {
  if (!mount) return;
  createRoot(mount).render(
    <StrictMode>
      <ThemeProvider theme={muiTheme}>{node}</ThemeProvider>
    </StrictMode>,
  );
}

mountStickyHeaderFab(
  document.getElementById("sticky-header-configure-root"),
  <FloatingButton
    variant="secondary"
    shape="circular"
    size="small"
    theme="light"
    aria-label="Configure homepage"
    icon={
      <img
        src="/assets/configure-homepage.svg"
        alt=""
        width={20}
        height={20}
        style={{ display: "block", objectFit: "contain" }}
      />
    }
    sx={{ flexShrink: 0 }}
  />,
);

mountStickyHeaderFab(
  document.getElementById("sticky-header-add-root"),
  <FloatingButton
    variant="primary"
    shape="circular"
    size="small"
    theme="light"
    aria-label="Add"
    sx={{ flexShrink: 0 }}
  />,
);
