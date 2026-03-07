import { Box, Heading, Stack, Text, VStack } from "@chakra-ui/react";

interface ConfirmacaoSucessoProps {
  presentes?: string[];
  id?: string;
}

export function ConfirmacaoCha({ presentes }: ConfirmacaoSucessoProps) {
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
        <Text color="brand.primary">{`Obrigada!`}</Text>

        <Text color="brand.primary" fontSize="sm">
          Ficamos muito felizes em saber da sua resposta.
        </Text>
        <Text color="brand.primary" fontSize="sm">
          Essa é nossa sugestão de presentes!
        </Text>
        <Stack width="100%">
          {presentes && presentes.length > 0 && (
            <Box>
              {presentes.map((presente, index) => {
                return (
                  <Text
                    color="brand.primary"
                    textAlign="center"
                    fontSize="sm"
                    fontWeight={600}
                    key={index}
                  >
                    {presente}
                  </Text>
                );
              })}
            </Box>
          )}
        </Stack>
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
