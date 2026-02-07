import { Box, Button, Heading, Link, Text, VStack } from "@chakra-ui/react";
import { LuExternalLink } from "react-icons/lu";

interface ConfirmacaoSucessoProps {
  nome?: string;
}

export function ConfirmacaoSucesso({ nome }: ConfirmacaoSucessoProps) {
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
          Ficamos muito felizes em saber da sua resposta. Sua presença (ou
          carinho) significa muito para nós ❤️
        </Text>
        <Text color="brand.primary" fontSize="sm">
          Caso deseje nos presentear, por favor visite a nossa
        </Text>
        <Link fontWeight={600} color={"brand.primary"} href="#">
          Lista de Presentes <LuExternalLink />
        </Link>
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
