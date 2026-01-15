import { useState } from "react";
import type { FormEvent } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  HStack,
  Text,
} from "@chakra-ui/react";
import { supabase } from "../supabase";

export default function RSVPForm() {
  const [nome, setNome] = useState("");
  const [presenca, setPresenca] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function enviarRSVP(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);

    const { error } = await supabase.from("rsvp").insert({
      nome,
      presenca,
    });

    setLoading(false);

    if (error) {
      setMensagem("Erro ao enviar confirmação. Tente novamente.");
      return;
    }

    setMensagem("Presença confirmada ❤️");
    setNome("");
    setPresenca(true);
  }

  return (
    <Box bg="bg.card" borderWidth="1px" borderRadius="lg" p={6}>
      <Heading size="lg" mb={4} textAlign="center" color={"brand.primary"}>
        Confirmação de Presença 💍
      </Heading>

      <form onSubmit={enviarRSVP}>
        <Stack gap={4}>
          <Input
            placeholder="Seu nome"
            color={"brand.primary"}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <HStack gap={3}>
            <Button
              flex={1}
              variant={presenca ? "solid" : "outline"}
              colorScheme="green"
              onClick={() => setPresenca(true)}
            >
              Estarei presente
            </Button>

            <Button
              flex={1}
              variant={!presenca ? "solid" : "outline"}
              colorScheme="red"
              onClick={() => setPresenca(false)}
            >
              Não poderei ir
            </Button>
          </HStack>

          <Button type="submit" colorScheme="pink" loading={loading}>
            Confirmar
          </Button>

          {mensagem && (
            <Text
              textAlign="center"
              color={mensagem.includes("Erro") ? "red.500" : "green.600"}
            >
              {mensagem}
            </Text>
          )}
        </Stack>
      </form>
    </Box>
  );
}
