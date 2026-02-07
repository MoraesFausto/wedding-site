import { Box, Spinner, Text } from "@chakra-ui/react";

export function FullScreenLoading() {
  return (
    <Box
      position="fixed"
      inset={0}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="rgba(255, 255, 255, 0.6)"
      zIndex={9999}
    >
      <Spinner size="xl" color="brand.primary" />
      <Text mt={4} color="brand.primary" fontSize="md">
        Carregando…
      </Text>
    </Box>
  );
}
