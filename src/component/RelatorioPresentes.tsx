import {
  Box,
  ButtonGroup,
  Flex,
  IconButton,
  Pagination,
  Stack,
  Table,
} from "@chakra-ui/react";
import bg from "../casamento-bg.png";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface PresenteComReserva {
  id: string;
  nome: string;
  presentes_reservado_por_fkey: {
    nome: string;
  } | null;
}

export function RelatorioPresentes() {
  const pageSize = 10;

  const [relatorio, setRelatorio] = useState<
    { id: string; nome: string; presente: string }[]
  >([]);
  const [relatorioVisivel, setRelatorioVisivel] = useState<
    { id: string; nome: string; presente: string }[]
  >([]);

  const [page, setPage] = useState(1);

  async function carregarRelatorio() {
    const { data, error } = (await supabase.from("presentes").select(`
        id,
        nome,
        presentes_reservado_por_fkey!inner (
        nome
        )
    `)) as { data: PresenteComReserva[] | null; error: object };

    if (error) {
      console.error("Erro ao carregar relatório:", error);
      return;
    }

    const relatorioRecuperado = data?.map((item) => ({
      id: item.id,
      nome: item.presentes_reservado_por_fkey?.nome || "Desconecido",
      presente: item.nome,
    }));
    setRelatorio(relatorioRecuperado || []);
    setRelatorioVisivel(relatorioRecuperado?.slice(0, pageSize) || []);
  }

  useEffect(() => {
    const carregar = async () => {
      carregarRelatorio();
    };
    carregar();
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
          <Stack>
            <Table.Root size="md" variant={"outline"} background={"white"}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader color={"brand.primary"}>
                    Presente
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color={"brand.primary"}>
                    Vai ser dado por
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {Array.from({ length: 10 }).map((_, index) => {
                  const item = relatorioVisivel[index];

                  return (
                    <Table.Row key={index} h={"45px"}>
                      <Table.Cell w={"300px"} color={"brand.primary"}>
                        {item?.presente || ""}
                      </Table.Cell>
                      <Table.Cell w={"300px"} color={"brand.primary"}>
                        {item?.nome || ""}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
            <Flex justify="flex-end" mt={4}>
              <Pagination.Root
                count={relatorio.length}
                pageSize={pageSize}
                page={page}
                onPageChange={(e) => {
                  setPage(e.page);
                  const startIndex = (e.page - 1) * pageSize;
                  const endIndex = startIndex + pageSize;
                  setRelatorioVisivel(relatorio.slice(startIndex, endIndex));
                }}
              >
                <ButtonGroup variant="outline" size="sm" wrap="wrap">
                  <Pagination.PrevTrigger
                    asChild
                    background={"transparent"}
                    color={"brand.primary"}
                  >
                    <IconButton>
                      <LuChevronLeft />
                    </IconButton>
                  </Pagination.PrevTrigger>

                  <Pagination.Items
                    render={(pageSelected) => (
                      <IconButton
                        background={
                          pageSelected.value === page
                            ? "brand.primary"
                            : "transparent"
                        }
                        color={
                          pageSelected.value === page
                            ? "white"
                            : "brand.primary"
                        }
                        variant={{
                          base: "ghost",
                          _selected: "outline",
                        }}
                      >
                        {pageSelected.value}
                      </IconButton>
                    )}
                  />

                  <Pagination.NextTrigger
                    asChild
                    background={"transparent"}
                    color={"brand.primary"}
                  >
                    <IconButton>
                      <LuChevronRight />
                    </IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
