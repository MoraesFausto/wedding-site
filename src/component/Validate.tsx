import { useEffect, useState } from "react";
import { Box, Heading, Text, Spinner, Button } from "@chakra-ui/react";
import { supabase } from "../supabase";
import bg from "../casamento-bg.png";

type Status = "loading" | "success" | "error";

export default function Validate() {
  const [status, setStatus] = useState<Status>("loading");
  const [nome, setNome] = useState<string | null>(null);

  const validar = async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      return;
    }
    console.log("Validando token: " + token);

    try {
      // busca o convidado
      const { data, error } = await supabase
        .from("rsvp")
        .select("nome,token_used")
        .eq("token", token)
        .single();

      if (error || !data) {
        setStatus("error");
        return;
      }

      if (data.token_used) {
        setStatus("error");
        return;
      }

      // marca como usado
      await supabase
        .from("rsvp")
        .update({ token_used: true })
        .eq("token", token);

      setNome(data.nome);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    const chamar = () => validar();
    chamar();
  }, []);

  return (
    <Box
      as="main"
      minH="100svh" // mais confiável no mobile que 100vh
      w="100vw"
      bgImage={`url(${bg})`}
      bgSize="cover" // escala pra cobrir TODO o container
      position="center" // centraliza a imagem
      bgRepeat="no-repeat"
      overflowX="hidden" // evita scroll horizontal por causa de 100vw
    >
      <Box
        minH="100svh"
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="rgba(255,255,255,0.15)"
      >
        <Box
          minH="100svh"
          bg="transparent"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
        >
          <Box
            h={"25vh"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDir="column"
            gap={6}
            textAlign="center"
            bg="bg.card"
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={"bg.border"}
          >
            {status === "loading" && (
              <>
                <Spinner size="xl" />
                <Text color={"brand.primary"}>Validando convite...</Text>
              </>
            )}

            {status === "success" && (
              <>
                <Heading color="brand.primary">Convite validado ☑️</Heading>
                {nome && <Text color="brand.primary">Bem-vindo, {nome}!</Text>}
              </>
            )}

            {status === "error" && (
              <>
                <Heading color="red.500">Falha na validação ❌</Heading>
                <Text color="brand.primary">
                  Este QR Code é inválido ou já foi utilizado.
                </Text>

                <Button
                  bg={"brand.primary"}
                  color="white"
                  onClick={() => window.location.reload()}
                >
                  Tentar novamente
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
