import { Box, Text } from "@chakra-ui/react";

type Props = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

export function CustomCheckbox({ label, checked, onChange }: Props) {
  return (
    <Box
      as="label"
      display="flex"
      alignItems="center"
      gap={3}
      cursor="pointer"
      userSelect="none"
    >
      {/* input real (invisível) */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ display: "none" }}
      />

      {/* caixa visual */}
      <Box
        width="20px"
        height="20px"
        border="2px solid"
        borderColor={checked ? "brand.primary" : "gray.400"}
        borderRadius="md"
        bg={checked ? "brand.primary" : "transparent"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="all 0.15s ease"
      >
        {checked && (
          <Box
            width="6px"
            height="10px"
            border="solid white"
            borderWidth="0 2px 2px 0"
            transform="rotate(45deg)"
          />
        )}
      </Box>

      <Text color={"brand.primary"}>{label}</Text>
    </Box>
  );
}
