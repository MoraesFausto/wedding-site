import { Stack, Heading, Text } from "@chakra-ui/react";
import { CustomCheckbox } from "./CustomCheckbox";

export type Presente = { id: string; nome: string };

type Props = {
  presentes: Presente[];
  presentesSelecionados: Array<string>;
  setPresentesSelecionados: (ids: Array<string>) => void;
};

export default function ListaPresentes({
  presentes,
  presentesSelecionados,
  setPresentesSelecionados,
}: Props) {
  if (!presentes) return null;

  return (
    <Stack width="100%">
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
                setPresentesSelecionados([...presentesSelecionados, p.id]);
              }
            }}
          />
        );
      })}
    </Stack>
  );
}
