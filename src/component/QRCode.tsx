import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Box, Button, Image as Pimage, Text } from "@chakra-ui/react";
import bg from "../convite-geral.png";

type Props = {
  inviteId: string;
  token?: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function QRModal({ inviteId, token, isOpen, onClose }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function baixarConviteComQRCode(imagemConvite: string) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const base = window.location.origin;
    const path = `/validate${
      token ? `?token=${encodeURIComponent(token)}` : ""
    }`;
    const link = `${base}${path}`;

    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imagemConvite;

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // desenha a imagem do convite
      ctx.drawImage(img, 0, 0);

      // gera QR
      const qrDataUrl = await QRCode.toDataURL(link, {
        width: 200,
        margin: 2,
        color: { dark: "#1b4a92", light: "#fff" },
      });

      const qrImg = new Image();
      qrImg.src = qrDataUrl;

      qrImg.onload = () => {
        const tamanho = 150;
        const margem = 40;

        // fundo branco para o QR
        ctx.fillStyle = "white";

        ctx.fillRect(
          canvas.width - tamanho - margem - 10,
          canvas.height - tamanho - margem - 10,
          tamanho + 20,
          tamanho + 20
        );
        const x = (canvas.width - tamanho) / 2;
        const y = canvas.height - tamanho - margem - 125;
        // desenha QR
        ctx.drawImage(qrImg, x, y, tamanho, tamanho);

        // baixar imagem
        const a = document.createElement("a");
        a.download = "convite.png";
        a.href = canvas.toDataURL("image/png");
        a.click();
      };
    };
  }

  useEffect(() => {
    if (!isOpen) return;
    const generate = async () => {
      setGenerating(true);
      try {
        const base = window.location.origin;
        const path = `/validate${
          token ? `?token=${encodeURIComponent(token)}` : ""
        }`;
        const url = `${base}${path}`;

        const d = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: { dark: "#1b4a92", light: "#fff" },
        });
        setDataUrl(d);
      } catch (err) {
        console.error("Erro gerando QR:", err);
        setDataUrl(null);
      } finally {
        setGenerating(false);
      }
    };

    generate();
  }, [isOpen, inviteId, token]);

  const handleCopyLink = async () => {
    const base = window.location.origin;
    const path = `/validate${
      token ? `?token=${encodeURIComponent(token)}` : ""
    }`;
    const url = `${base}${path}`;
    await navigator.clipboard.writeText(url);
    alert("Link copiado para a área de transferência");
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0,0,0,0.45)"
      zIndex={9999}
      p={4}
    >
      <Box
        bg="white"
        borderRadius="lg"
        p={6}
        maxW="420px"
        w="100%"
        textAlign="center"
      >
        <Text fontWeight="bold" mb={4} color={"brand.primary"}>
          QR Code do Convite
        </Text>

        {generating && <Text mb={4}>Gerando QR…</Text>}

        {dataUrl ? (
          <Pimage src={dataUrl} alt="QR Code" mx="auto" mb={4} maxH="320px" />
        ) : (
          !generating && (
            <Text color="red.500">Não foi possível gerar o QR</Text>
          )
        )}

        <Button
          onClick={() => baixarConviteComQRCode(bg)}
          mb={3}
          color={"white"}
          bg={"brand.primary"}
          mr={3}
        >
          Baixar PNG
        </Button>

        <Button
          onClick={handleCopyLink}
          mb={3}
          color={"white"}
          bg={"brand.primary"}
        >
          Copiar link
        </Button>

        <Box mt={4}>
          <Button onClick={onClose} color={"white"} bg={"brand.primary"}>
            Fechar
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
