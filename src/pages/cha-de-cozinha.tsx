import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Stack, Heading, Button, Text } from "@chakra-ui/react";
import bg from "../fundo-cha.png";
import { supabase } from "../supabase";
import { CustomCheckbox } from "../component/CustomCheckbox";
import { FullScreenLoading } from "../component/FullScreenLoading";
import { ConfirmacaoCha } from "../component/ConfirmacaoCha";

interface Acompanhante {
  nome: string;
  presente: string;
  confirmado: boolean;
  id: number;
}

interface Convidado {
  nome: string;
  presente: string;
  acompanhantes: Acompanhante[];
  familia: number;
  id: number;
}

export default function ChaDeCozinha() {
  const { id } = useParams();
  const [convidado, setConvidado] = useState<Convidado | null>(null);
  const [presenca, setPresenca] = useState<boolean>(true);
  const [presentes, setPresentes] = useState<string[]>([]);
  const [acompanhantesConvidado, setAcompanhantesConvidado] = useState<
    number[]
  >([]);
  const [presentesSelecionados, setPresentesSelecionados] = useState<string[]>(
    []
  );

  const [confirmado, setConfirmado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmarLoading, setConfirmarLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function carregarConvidado() {
    const ps = [];
    if (id === undefined) return;
    const acompanhantes = [] as Acompanhante[];
    const { data } = await supabase
      .from("cha_de_cozinha")
      .select("id,nome,presente,familia")
      .eq("id", id)
      .single();
    ps.push(data!.presente);

    if (data?.familia !== 0) {
      const { data: acompanhantesData } = await supabase
        .from("cha_de_cozinha")
        .select("id,nome,confirmado,presente")
        .eq("familia", data?.familia);

      acompanhantesData
        ?.filter((a) => a.id !== data?.id)
        .forEach((a) => {
          acompanhantes.push({
            id: a.id,
            nome: a.nome,
            presente: a.presente,
            confirmado: a.confirmado,
          });
          ps.push(a.presente);
        });
    }
    setConvidado({
      id: data!.id,
      nome: data!.nome,
      acompanhantes: acompanhantes,
      presente: data!.presente,
      familia: data!.familia,
    });

    setPresentes(ps);

    const ids = acompanhantes.map((a) => a.id);

    setAcompanhantesConvidado([...ids]);
    setLoading(false);
  }

  async function carregarPresentes() {
    // const { data } = await supabase
    //   .from("presentes")
    //   .select("*")
    //   .eq("reservado", false);
    // setPresentes(data || []);
  }

  async function confirmarTudo() {
    if (presenca === null && presentesSelecionados === null) {
      setMensagem("Selecione presença ou um presente.");
      return;
    }

    if (convidado?.nome.trim() === "") {
      return;
    }

    setMensagem(null);

    try {
      setConfirmarLoading(true);
      // RSVP
      if (presenca !== null) {
        const { error } = await supabase
          .from("cha_de_cozinha")
          .update({
            nome: convidado?.nome,
            confirmado: presenca,
          })
          .eq("id", convidado?.id);

        if (error) {
          console.error("Erro RSVP:", error);
          throw error;
        }
      }

      if (acompanhantesConvidado !== null) {
        const { error } = await supabase
          .from("cha_de_cozinha")
          .update({ confirmado: true })
          .in("id", acompanhantesConvidado);
        if (error) throw error;
      }

      const acompanhantesQueNaoVao = convidado?.acompanhantes
        .map((a) => a.id)
        .filter((id) => !acompanhantesConvidado.includes(id));

      if (acompanhantesQueNaoVao && acompanhantesQueNaoVao.length > 0) {
        const { error } = await supabase
          .from("cha_de_cozinha")
          .update({ confirmado: false })
          .in("id", acompanhantesQueNaoVao);
        if (error) throw error;
      }

      setAcompanhantesConvidado([]);
      setPresenca(true);
      setPresentesSelecionados([]);
      carregarPresentes();
      setConvidado({} as Convidado);
    } catch (e) {
      console.log(e);
      setMensagem("Erro ao confirmar. Tente novamente.");
    } finally {
      setConfirmarLoading(false);
      setConfirmado(true);
    }
  }

  useEffect(() => {
    carregarConvidado();
    carregarPresentes();
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
          {confirmado ? (
            <ConfirmacaoCha presentes={presentes} />
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
                Chá de cozinha 🩵
              </Heading>

              <Text color="brand.primary" textAlign="center" fontSize="sm">
                Olá {convidado?.nome ?? ""}!
              </Text>
              <Text color="brand.primary" textAlign="justify" fontSize="sm">
                É com muito carinho que te convido para o meu chá de cozinha! O
                chá acontecerá no dia 21/03/2026 às 15:00h.
              </Text>

              <CustomCheckbox
                key={"presenca-check"}
                label={"Confirmo a presença!"}
                checked={presenca === true}
                onChange={() => {
                  if (presenca) {
                    setPresenca(false);
                  } else {
                    setPresenca(true);
                  }
                }}
              />

              <Stack width="100%">
                {convidado?.acompanhantes &&
                  convidado.acompanhantes.length > 0 && (
                    <div>
                      <Heading
                        size="md"
                        textAlign="center"
                        color="brand.primary"
                      >
                        Quem vem também?
                      </Heading>
                      <Box pt={5}>
                        {convidado?.acompanhantes.map((p) => {
                          const checked = acompanhantesConvidado.includes(p.id);

                          return (
                            <CustomCheckbox
                              key={p.id}
                              label={p.nome + ` (${p.presente})`}
                              checked={acompanhantesConvidado.includes(p.id)}
                              onChange={() => {
                                if (checked) {
                                  setAcompanhantesConvidado(
                                    acompanhantesConvidado.filter(
                                      (id) => id !== p.id
                                    )
                                  );
                                } else {
                                  setAcompanhantesConvidado([
                                    ...acompanhantesConvidado,
                                    p.id,
                                  ]);
                                }
                              }}
                            />
                          );
                        })}
                      </Box>
                    </div>
                  )}
              </Stack>

              <Button
                onClick={confirmarTudo}
                loading={confirmarLoading}
                bg="brand.primary"
                color="white"
                _hover={{ opacity: 0.9 }}
              >
                Enviar resposta
              </Button>

              {mensagem && (
                <Text textAlign="center" color={"brand.primary"}>
                  {mensagem}
                </Text>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
