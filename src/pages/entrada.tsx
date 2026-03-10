import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Stack, Heading, Button, Text } from "@chakra-ui/react";
import bg from "../casamento-bg.png";
import { supabase } from "../supabase";
import { FullScreenLoading } from "../component/FullScreenLoading";
import { LuQrCode } from "react-icons/lu";
import QRModal from "../component/QRCode";

interface Convidado {
  nome: string;
  id: string;
  token: string;
}

export default function Entrada() {
  const { id } = useParams();
  const [convidado, setConvidado] = useState<Convidado | null>(null);

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  async function carregarConvidado() {
    if (id === undefined) return;
    const { data } = await supabase
      .from("rsvp")
      .select("id,nome,token")
      .eq("id", id)
      .single();

    setConvidado({
      id: data!.id,
      nome: data!.nome,
      token: data!.token,
    });
    setLoading(false);
  }

  useEffect(() => {
    carregarConvidado();
  }, []);

  return loading ? (
    FullScreenLoading()
  ) : (
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
          <Stack
            gap={6}
            maxW="520px"
            w="100%"
            bg="bg.card"
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={"bg.border"}
          >
            <Heading size="lg" textAlign="center" color="brand.primary">
              Validação 💍
            </Heading>
            <Text color="brand.primary" textAlign="center" fontSize="sm">
              Olá {convidado?.nome ?? ""}!
            </Text>
            <Text color="brand.primary" textAlign="center" fontSize="sm">
              Esta é a tela que você irá exibir na entrada da nossa festa!.
            </Text>
            <Text color="brand.primary" textAlign="center" fontSize="sm">
              Basta clicar no botão abaixo e apresentar o código para o
              responsável na entrada do evento.
            </Text>
            <Text color="brand.primary" textAlign="center" fontSize="sm">
              Te aguardamos lá!
            </Text>
            <>
              <Button
                color={"white"}
                bg={"brand.primary"}
                onClick={() => setOpen(true)}
              >
                Mostrar código do convite <LuQrCode />
              </Button>

              <QRModal
                inviteId={convidado?.id ?? ""}
                token={convidado?.token ?? ""}
                isOpen={open}
                onClose={() => setOpen(false)}
              />
            </>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
