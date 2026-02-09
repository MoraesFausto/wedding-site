import { Stack, Heading, Text, Button, Box } from "@chakra-ui/react";
import { CustomCheckbox } from "./CustomCheckbox";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";
import { FullScreenLoading } from "./FullScreenLoading";
import { useParams } from "react-router-dom";
import bg from "../casamento-bg.png";
import { ConfirmacaoPresente } from "./ConfirmacaoPresente";

export type Presente = {
  id: string;
  nome: string;
  reservado_por: string;
  reservado: boolean;
  unico: boolean;
};

export default function ListaPresentes() {
  const { id } = useParams();
  const [nome, setNome] = useState<string | null>(null);
  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [loadingPresentes, setLoadingPresentes] = useState<boolean>(true);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [confirmado, setConfirmado] = useState(false);
  const [presentesSelecionados, setPresentesSelecionados] = useState<string[]>(
    []
  );

  async function carregarNome() {
    const { data } = await supabase
      .from("rsvp")
      .select("nome")
      .eq("id", id)
      .single();
    setNome(data?.nome || null);
  }

  async function carregarPresentes() {
    setLoadingPresentes(true);
    const { data } = await supabase
      .from("presentes")
      .select("*")
      .eq("reservado", false);
    data?.sort((a, b) => a.nome.localeCompare(b.nome));
    setPresentes(data || []);
    setLoadingPresentes(false);
  }

  useEffect(() => {
    const carregar = async () => {
      await carregarPresentes();
      await carregarNome();
    };

    carregar();
  }, []);

  async function confirmar() {
    setEnviando(true);
    if (presentesSelecionados !== null) {
      const { error } = await supabase
        .from("presentes")
        .update({ reservado: true, reservado_por: id || null })
        .in("id", presentesSelecionados)
        .eq("reservado", false);

      if (error) throw error;
    }
    setEnviando(false);
    setConfirmado(true);
  }

  return loadingPresentes ? (
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
          py={4}
        >
          {confirmado ? (
            <ConfirmacaoPresente nome={nome ?? ""} id={id} />
          ) : (
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
                Lista de presentes
              </Heading>
              <Text textAlign="center" color={"brand.primary"} fontSize={"sm"}>
                Caso deseje nos presentear, segue a lista com algumas opções:
              </Text>
              {presentes.map((p) => {
                const checked = presentesSelecionados.includes(p.id);

                return (
                  <CustomCheckbox
                    key={p.id}
                    label={p.nome}
                    checked={presentesSelecionados.includes(p.id)}
                    onChange={() => {
                      if (checked) {
                        setPresentesSelecionados(
                          presentesSelecionados.filter((id) => id !== p.id)
                        );
                      } else {
                        setPresentesSelecionados([
                          ...presentesSelecionados,
                          p.id,
                        ]);
                      }
                    }}
                  />
                );
              })}
              <Button
                onClick={confirmar}
                loading={enviando}
                bg="brand.primary"
                color="white"
                _hover={{ opacity: 0.9 }}
              >
                Enviar resposta
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
