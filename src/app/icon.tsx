import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Route segment config
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation - Logo icon
export default async function Icon() {
  const imageData = await readFile(
    join(process.cwd(), 'public', 'logo_192.png')
  );
  const base64Image = imageData.toString('base64');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <img
          src={`data:image/png;base64,${base64Image}`}
          alt="Logo"
          width={32}
          height={32}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
