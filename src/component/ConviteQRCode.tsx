import { useEffect, useRef } from "react";
import QRCode from "qrcode";

type Props = {
  link: string;
  imagemConvite: string;
};

export default function ConviteQRCode({ link, imagemConvite }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gerarImagem = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imagemConvite;

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // desenha a imagem do convite
      ctx.drawImage(img, 0, 0);

      // gera o QR Code
      const qrDataUrl = await QRCode.toDataURL(link);

      const qrImg = new Image();
      qrImg.src = qrDataUrl;

      qrImg.onload = () => {
        const tamanho = 200;

        // posição do QR (canto inferior direito)
        ctx.drawImage(
          qrImg,
          canvas.width - tamanho - 40,
          canvas.height - tamanho - 40,
          tamanho,
          tamanho
        );
      };
    };
    const linkDownload = document.createElement("a");
    linkDownload.download = "convite.png";
    linkDownload.href = canvas.toDataURL();
    linkDownload.click();
  };
  useEffect(() => {
    gerarImagem();
  }, []);
  return <canvas ref={canvasRef} />;
}
