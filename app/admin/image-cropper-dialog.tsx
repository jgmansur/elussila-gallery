"use client";

import { useCallback, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

type ImageCropperDialogProps = {
  open: boolean;
  imageSrc: string | null;
  fileName: string;
  title?: string;
  onCancel: () => void;
  onUseOriginal: () => void;
  onApply: (file: File) => void;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar la imagen para recorte."));
    image.src = src;
  });

const createCroppedFile = async (imageSrc: string, cropPixels: Area, fileName: string) => {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(cropPixels.width));
  canvas.height = Math.max(1, Math.floor(cropPixels.height));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo inicializar el canvas para recorte.");
  }

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/jpeg", 0.92);
  });

  if (!blob) {
    throw new Error("No se pudo generar la imagen recortada.");
  }

  const safeName = fileName.replace(/\.[^.]+$/, "");
  return new File([blob], `${safeName}-cropped.jpg`, { type: "image/jpeg" });
};

export default function ImageCropperDialog({
  open,
  imageSrc,
  fileName,
  title = "Recortar imagen",
  onCancel,
  onUseOriginal,
  onApply,
}: ImageCropperDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const aspectOptions = useMemo(
    () => [
      { label: "Original", value: undefined as number | undefined },
      { label: "4:5", value: 4 / 5 },
      { label: "1:1", value: 1 },
      { label: "16:9", value: 16 / 9 },
    ],
    []
  );
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const applyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setSubmitting(true);
    try {
      const croppedFile = await createCroppedFile(imageSrc, croppedAreaPixels, fileName);
      onApply(croppedFile);
    } catch (error) {
      console.error(error);
      alert("No se pudo recortar la imagen.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4">
      <div className="w-full max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-xs text-zinc-500">Mové y acercá para ajustar el encuadre</p>
        </div>

        <div className="relative mb-4 h-[52vh] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-widest text-zinc-500">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-widest text-zinc-500">Aspecto</label>
            <select
              value={String(aspect ?? "original")}
              onChange={(e) => {
                const selected = aspectOptions.find((option) => String(option.value ?? "original") === e.target.value);
                setAspect(selected?.value);
              }}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-sm text-white"
            >
              {aspectOptions.map((option) => (
                <option key={option.label} value={String(option.value ?? "original")}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onUseOriginal}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
          >
            Usar original
          </button>
          <button
            type="button"
            onClick={applyCrop}
            disabled={submitting}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black disabled:opacity-60"
          >
            {submitting ? "Aplicando..." : "Recortar y usar"}
          </button>
        </div>
      </div>
    </div>
  );
}
