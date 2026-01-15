import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Box,
  Stack,
  Heading,
  Input,
  Button,
  HStack,
  Text,
} from "@chakra-ui/react";
import bg from "../casamento-bg.png";
import { supabase } from "../supabase";
import ListaPresentes from "../component/ListaDePresentes";
import { CustomCheckbox } from "../component/CustomCheckbox";

interface Acompanhante {
  nome: string;
  vai: boolean;
  id: number;
}

interface Convidado {
  nome: string;
  acompanhantes: Acompanhante[];
  id: number;
}

interface Presente {
  id: string;
  nome: string;
  reservado: boolean;
}

export default function MainPage() {
  const { id } = useParams();
  console.log("id:", id);

  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  console.log("tab:", tab);

  const [nome, setNome] = useState("");
  const [convidado, setConvidado] = useState<Convidado | null>(null);
  const [acompanhantes, setAcompanhantes] = useState<number | null>(null);
  const [presenca, setPresenca] = useState<boolean | null>(true);
  const [acompanhantesConvidado, setAcompanhantesConvidado] = useState<
    number[]
  >([]);
  const [presentesSelecionados, setPresentesSelecionados] = useState<string[]>(
    []
  );

  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [erroNome, setErroNome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function carregarConvidado(id: string) {
    if (id === undefined) return;
    const { data } = await supabase
      .from("rsvp")
      .select("id,nome,acompanhantes_rsvp_id_fkey!left (id,nome)")
      .eq("id", id)
      .single();

    console.log("convidados:", data?.acompanhantes_rsvp_id_fkey);
    setConvidado({
      id: data!.id,
      nome: data!.nome,
      acompanhantes: (data?.acompanhantes_rsvp_id_fkey as Acompanhante[]) || [],
    });
  }

  async function carregarPresentes() {
    const { data } = await supabase
      .from("presentes")
      .select("*")
      .eq("reservado", false);

    setPresentes(data || []);
  }

  useEffect(() => {
    carregarConvidado(id!);
    carregarPresentes();
  }, []);

  async function confirmarTudo() {
    // não fez nada
    if (presenca === null && presentesSelecionados === null) {
      setMensagem("Selecione presença ou um presente.");
      return;
    }

    // fez algo, mas sem nome
    if (!nome.trim()) {
      setErroNome(true);
      return;
    }

    setErroNome(false);
    setMensagem(null);
    setLoading(true);

    try {
      // RSVP
      if (presenca !== null) {
        const { error } = await supabase.from("rsvp").insert({
          nome,
          vai: presenca,
          acompanhantes,
        });

        if (error) {
          console.error("Erro RSVP:", error);
          throw error;
        }
      }

      // Presente
      if (presentesSelecionados !== null) {
        const { error } = await supabase
          .from("presentes")
          .update({ reservado: true })
          .eq("id", presentesSelecionados)
          .eq("reservado", false);

        if (error) throw error;
      }

      setMensagem("Confirmado com sucesso ❤️");
      setNome("");
      setAcompanhantes(null);
      setPresenca(null);
      setPresentesSelecionados([]);
      carregarPresentes();
    } catch (e) {
      console.log(e);
      setMensagem("Erro ao confirmar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

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

            <Input
              placeholder="Seu nome"
              value={convidado?.nome ?? ""}
              disabled
              onChange={(e) => setNome(e.target.value)}
              borderColor={erroNome ? "red.500" : "bg.border"}
              color={"brand.primary"}
            />

            {erroNome && (
              <Text color="red.500" fontSize="sm">
                Informe seu nome para confirmar.
              </Text>
            )}

            {/* RSVP */}
            <HStack gap={3}>
              <Button
                flex={1}
                variant={presenca === true ? "solid" : "outline"}
                onClick={() => setPresenca(true)}
                background={presenca ? "brand.primary" : "transparent"}
                border={"1px solid"}
                borderColor={"bg.border"}
                color={presenca ? "white" : "bg.border"}
              >
                Estarei presente
              </Button>

              <Button
                flex={1}
                variant={presenca === false ? "solid" : "outline"}
                onClick={() => setPresenca(false)}
                background={presenca ? "transparent" : "brand.primary"}
                border={"1px solid"}
                color={presenca ? "bg.border" : "white"}
                borderColor={"bg.border"}
              >
                Não poderei ir
              </Button>
            </HStack>
            <Stack width="100%">
              <Heading size="md" textAlign="center" color="brand.primary">
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
                          acompanhantesConvidado.filter((id) => id !== p.id)
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
            </Stack>

            {/* Presentes */}

            <ListaPresentes
              presentes={presentes}
              presentesSelecionados={presentesSelecionados}
              setPresentesSelecionados={(ids: string[]) =>
                setPresentesSelecionados(ids)
              }
            />

            <Button
              onClick={confirmarTudo}
              loading={loading}
              bg="brand.primary"
              color="white"
              _hover={{ opacity: 0.9 }}
            >
              Confirmar
            </Button>

            {mensagem && (
              <Text textAlign="center" color={"brand.primary"}>
                {mensagem}
              </Text>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
