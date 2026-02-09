import { Box, Heading, Text, VStack } from "@chakra-ui/react";

interface ConfirmacaoPresenteProps {
  nome?: string;
  id?: string;
}

export function ConfirmacaoPresente({ nome }: ConfirmacaoPresenteProps) {
  return (
    <Box
      maxW="420px"
      w="100%"
      mx="auto"
      mt={10}
      p={8}
      borderRadius="2xl"
      bg="whiteAlpha.900"
      boxShadow="xl"
      textAlign="center"
    >
      <VStack gap={4}>
        <Text fontSize="5xl">💍</Text>
        <Heading size="lg" color="brand.primary">
          Confirmação recebida!
        </Heading>
        <Text color="brand.primary">
          {nome ? `Obrigado, ${nome}!` : "Obrigado!"}
        </Text>

        <Text color="brand.primary" fontSize="sm">
          Agradecemos imensamente o carinho ❤️
        </Text>
        <Text color="brand.primary" fontSize="sm">
          Em breve entraremos em contato para combinar a entrega do presente.
        </Text>

        <Text color="brand.primary" fontSize="sm">
          Que Deus abençoe muito!
        </Text>
        <Text fontSize="sm" color="gray.500">
          Eclesiastes 4, 9-10
        </Text>
      </VStack>
    </Box>
  );
}
