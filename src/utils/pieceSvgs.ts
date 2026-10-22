/**
 * Staunton chess piece vector SVGs
 * Crisp, authentic rendering across light and dark boards and interaction network nodes.
 */

export const PIECE_NAMES: Record<string, string> = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King',
};

export const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export function getPieceLabel(piece: string, color: 'w' | 'b'): string {
  const prefix = color === 'w' ? 'w' : 'b';
  return `${prefix}${piece.toUpperCase()}`;
}

// Vector paths for standard Staunton pieces
export const PIECE_SVGS: Record<string, string> = {
  // White King
  'w-k': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/>
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" stroke-linecap="butt" stroke-linejoin="miter"/>
      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5M22.5 23.5V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7" fill="#fff"/>
      <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/>
    </g>
  </svg>`,

  // White Queen
  'w-q': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5 4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM14 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm17 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/>
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-4-15-4.5 15-4.5-15-4 15-7-11 2 12z" stroke-linecap="butt"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/>
      <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke-linecap="butt"/>
      <path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none"/>
    </g>
  </svg>`,

  // White Rook
  'w-r': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5l1-15h15l1 15H14z" stroke-linecap="butt"/>
      <path d="M14 16.5h17v-4H14v4zm-3-4l1.5-4h21l1.5 4H11z" stroke-linecap="butt"/>
      <path d="M14 8.5v3m8.5-3v3m8.5-3v3" fill="none" stroke-linejoin="miter"/>
      <path d="M12 33.5h21M11 36.5h23" fill="none"/>
    </g>
  </svg>`,

  // White Bishop
  'w-b': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="#fff" stroke-linecap="butt">
        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/>
        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
      </g>
      <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/>
    </g>
  </svg>`,

  // White Knight
  'w-n': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff"/>
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.06 1.43-1 1-1-1-1.5-4.5-.5-5 1-.5 1.5.5 2.5-.5 1-1 .5-1.5 2-2 1-1.5 2.5-2 3-3.5 1.5-3 1.5-4 1-5.5-.5-1.5-1.5-2.5-1.5-2.5-3.5-2-4.5-2.5-4.5-2.5s6-.5 8.5 2c2.5 2.5 4.5 4 6 8z" fill="#fff"/>
      <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.5-8a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#000"/>
    </g>
  </svg>`,

  // White Pawn
  'w-p': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h25c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  // Black King
  'b-k': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 11.63V6" stroke-linejoin="miter"/>
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#1e293b" stroke-linecap="butt" stroke-linejoin="miter"/>
      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5M22.5 23.5V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7" fill="#1e293b"/>
      <path d="M20 8h5" stroke-linejoin="miter"/>
      <path d="M32 29.5c.5 1.5 0 2 0 2-2 1.5-6.5 2-9.5 2s-7.5-.5-9.5-2c0 0-.5-.5 0-2" stroke="#fff"/>
      <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff"/>
    </g>
  </svg>`,

  // Black Queen
  'b-q': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <g fill="#1e293b" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5 4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM14 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm17 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/>
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-4-15-4.5 15-4.5-15-4 15-7-11 2 12z" stroke-linecap="butt"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/>
      <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke-linecap="butt"/>
      <path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="#fff"/>
    </g>
  </svg>`,

  // Black Rook
  'b-r': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <g fill="#1e293b" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5l1-15h15l1 15H14z" stroke-linecap="butt"/>
      <path d="M14 16.5h17v-4H14v4zm-3-4l1.5-4h21l1.5 4H11z" stroke-linecap="butt"/>
      <path d="M14 8.5v3m8.5-3v3m8.5-3v3" fill="none" stroke-linejoin="miter"/>
      <path d="M12 33.5h21M11 36.5h23" fill="none" stroke="#fff"/>
    </g>
  </svg>`,

  // Black Bishop
  'b-b': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="#1e293b" stroke-linecap="butt">
        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/>
        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
      </g>
      <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff" stroke-linejoin="miter"/>
    </g>
  </svg>`,

  // Black Knight
  'b-n': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#1e293b"/>
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.06 1.43-1 1-1-1-1.5-4.5-.5-5 1-.5 1.5.5 2.5-.5 1-1 .5-1.5 2-2 1-1.5 2.5-2 3-3.5 1.5-3 1.5-4 1-5.5-.5-1.5-1.5-2.5-1.5-2.5-3.5-2-4.5-2.5-4.5-2.5s6-.5 8.5 2c2.5 2.5 4.5 4 6 8z" fill="#1e293b"/>
      <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.5-8a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#fff"/>
    </g>
  </svg>`,

  // Black Pawn
  'b-p': `<svg viewBox="0 0 45 45" class="w-full h-full drop-shadow-sm">
    <path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h25c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#1e293b" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
};

export function getPieceSvg(piece: string, color: 'w' | 'b'): string {
  const key = `${color}-${piece.toLowerCase()}`;
  return PIECE_SVGS[key] || '';
}
