'use client';

import { useEffect, useRef } from 'react';
import QRCodeStyling, { type Options } from 'qr-code-styling';
import type { RestaurantQrStyle } from '@/features/restaurant/model/qr-style';

type QrStylePreviewProps = {
  data: string;
  style: RestaurantQrStyle;
  imageUrl?: string | null;
};

export function QrStylePreview({ data, style, imageUrl }: QrStylePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const size = Math.min(style.width ?? 280, 280);

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        width: size,
        height: size,
        type: 'canvas',
        data,
      });
      qrRef.current.append(containerRef.current);
    }

    const nextOptions: Options = {
      width: size,
      height: size,
      data,
      margin: style.margin,
      shape: style.shape,
      qrOptions: style.qrOptions as Options['qrOptions'],
      dotsOptions: style.dotsOptions,
      cornersSquareOptions: style.cornersSquareOptions,
      cornersDotOptions: style.cornersDotOptions,
      backgroundOptions: style.backgroundOptions,
      imageOptions: {
        ...style.imageOptions,
        crossOrigin: 'anonymous',
      },
      image: imageUrl || undefined,
    };

    qrRef.current.update(nextOptions);
  }, [data, style, imageUrl]);

  return (
    <div className="flex items-center justify-center rounded-[24px] border border-line bg-paper-50 p-4">
      <div ref={containerRef} className="[&_canvas]:max-h-70 [&_canvas]:max-w-70" />
    </div>
  );
}
