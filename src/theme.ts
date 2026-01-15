import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        bg: {
          page: { value: "white" }, // fundo geral
          card: { value: "rgba(255,255,255,0.9)" },
          border: { value: "#1b4a92" },
        },
        brand: {
          primary: { value: "#1b4a92" }, // dourado suave
          secondary: { value: "#8B6F47" },
        },
      },
    },
  },
});
