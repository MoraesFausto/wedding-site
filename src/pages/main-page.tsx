import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Stack, Heading, Button, Text } from "@chakra-ui/react";
import bg from "../casamento-bg.png";
import { supabase } from "../supabase";
import { CustomCheckbox } from "../component/CustomCheckbox";
import { FullScreenLoading } from "../component/FullScreenLoading";
import { ConfirmacaoSucesso } from "../component/ConfirmacaoSucesso";
import { LuQrCode } from "react-icons/lu";
import QRModal from "../component/QRCode";

interface Acompanhante {
  nome: string;
  vai: boolean;
  id: number;
}

interface Convidado {
  nome: string;
  acompanhantes: Acompanhante[];
  id: string;
  token: string;
}

export default function MainPage() {
  const { id } = useParams();
  const [convidado, setConvidado] = useState<Convidado | null>(null);
  const [presenca, setPresenca] = useState<boolean | null>(true);
  const [acompanhantesConvidado, setAcompanhantesConvidado] = useState<
    number[]
  >([]);
  const [presentesSelecionados, setPresentesSelecionados] = useState<string[]>(
    []
  );
  const [open, setOpen] = useState<boolean>(false);
  const [confirmado, setConfirmado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmarLoading, setConfirmarLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function carregarConvidado() {
    if (id === undefined) return;
    const { data } = await supabase
      .from("rsvp")
      .select("id,nome,token,acompanhantes_rsvp_id_fkey!left (id,nome,vai)")
      .eq("id", id)
      .single();

    const acompanhantesCarregados =
      data?.acompanhantes_rsvp_id_fkey as Acompanhante[];
    const ids = acompanhantesCarregados.map((a) => a.id);

    setConvidado({
      id: data!.id,
      nome: data!.nome,
      acompanhantes: acompanhantesCarregados || [],
      token: data!.token,
    });
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
          .from("rsvp")
          .update({
            nome: convidado?.nome,
            vai: presenca,
          })
          .eq("id", convidado?.id);

        if (error) {
          console.error("Erro RSVP:", error);
          throw error;
        }
      }

      if (acompanhantesConvidado !== null) {
        const { error } = await supabase
          .from("acompanhantes")
          .update({ vai: true })
          .in("id", acompanhantesConvidado)
          .eq("rsvp_id", convidado?.id);
        if (error) throw error;
      }

      const acompanhantesQueNaoVao = convidado?.acompanhantes
        .map((a) => a.id)
        .filter((id) => !acompanhantesConvidado.includes(id));

      if (acompanhantesQueNaoVao && acompanhantesQueNaoVao.length > 0) {
        const { error } = await supabase
          .from("acompanhantes")
          .update({ vai: false })
          .in("id", acompanhantesQueNaoVao)
          .eq("rsvp_id", convidado?.id);
        if (error) throw error;
      }

      // Presente
      if (presentesSelecionados !== null && presentesSelecionados.length > 0) {
        const { error } = await supabase
          .from("presentes")
          .update({ reservado: true, reservado_por: convidado?.id })
          .eq("id", presentesSelecionados)
          .eq("reservado", false);

        if (error) throw error;
      }

      setAcompanhantesConvidado([]);
      setPresenca(null);
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
            <ConfirmacaoSucesso nome={convidado?.nome} id={id} />
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
                Confirmação 💍
              </Heading>
              <Text color="brand.primary" textAlign="center" fontSize="sm">
                Olá {convidado?.nome ?? ""}!
              </Text>
              <Text color="brand.primary" textAlign="justify" fontSize="sm">
                É com muito carinho que gostaríamos de te convidar para o nosso
                casamento! A cerimônia acontecerá no dia 12/04/2026 às 11:30h,
                as demais informações podem ser encontradas no convite
                disponível abaixo.
              </Text>

              <CustomCheckbox
                key={"presenca-check"}
                label={"Estarei presente!"}
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
                        Acompanhantes
                      </Heading>
                      {convidado?.acompanhantes.map((p) => {
                        const checked = acompanhantesConvidado.includes(p.id);

                        return (
                          <CustomCheckbox
                            key={p.id}
                            label={p.nome}
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
                    </div>
                  )}
              </Stack>
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
