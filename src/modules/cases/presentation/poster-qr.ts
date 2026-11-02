import QRCode from "qrcode";
/** Local encoding; no personal information is sent to a QR service. */
export function createPosterQr(url: string) {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: "M" });
  const border = 4;
  const cells: string[] = [];
  for (let y = 0; y < modules.size; y++)
    for (let x = 0; x < modules.size; x++)
      if (modules.get(y, x)) cells.push(`M${x + border} ${y + border}h1v1h-1z`);
  return { size: modules.size + border * 2, path: cells.join("") };
}
