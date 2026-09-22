export const PALETTE = {
  '.': null,
  '#': '#1e293b',
  'w': '#ffffff',
  'o': '#ffedd5',
  'O': '#fca5a5',
  'B': '#78350f',
  'g': '#4ade80',
  'G': '#16a34a',
  'D': '#15803d',
  'l': '#bbf7d0',
  'y': '#fde047',
  'Y': '#eab308',
  'c': '#38bdf8',
  'r': '#f43f5e',
  'p': '#c084fc',
  's': '#cbd5e1',
  'd': '#0284c7',
  'm': '#f472b6',
  'K': '#334155',
  'E': '#34d399',
  'R': '#fb7185'
};

export function createMatrixSprite(matrix, scale = 3) {
  const h = matrix.length;
  const w = matrix[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const char = matrix[y][x];
      const color = PALETTE[char];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
  return canvas;
}

export const SPRITE_CONFIGS = {
  player: [
    "....########....",
    "...#yyyyyyyy#...",
    "..#yyyyyyyyyy#..",
    "..#OOOOOOOOOO#..",
    "..#O#ww##ww#O#..",
    "..#OooooooooO#..",
    "....#gggggg#....",
    "...#gggggggg#...",
    "..#gggggggggg#..",
    "..#GGGGGGGGGG#..",
    "....#KK##KK#....",
    "....#KK##KK#....",
    "....#KK##KK#....",
    "....#BB##BB#...."
  ],
  bee: [
    "..####..",
    ".#yyyy#.",
    "#y#KK#y#",
    "#yyyyyy#",
    ".#KKKK#."
  ],
  dog: [
    "..####..",
    ".#BBBB#.",
    "#BwBBwB#",
    "#BBBBBB#",
    ".#B##B#."
  ],
  cart: [
    ".######.",
    "#dddddd#",
    "#dwwwwd#",
    "#dddddd#",
    ".######."
  ],
  bug: [
    "#.#..#.#",
    ".######.",
    "#r#rr#r#",
    ".######."
  ],
  cashBundle: [
    "##########",
    "#GgGgGgGg#",
    "#gGggggGg#",
    "#GgYYYYgG#",
    "#gGYYYYgG#",
    "#GgGgGgGg#",
    "##########"
  ],
  tree_dollar: [
    ".......######.......",
    ".....##llllll##.....",
    "....#llggggggll#....",
    "...#lggggggggggl#...",
    "..#ggggGGGGGGgggg#..",
    "..#ggGGGGGGGGGGgg#..",
    "..#ggGGGGGGGGGGgg#..",
    "..#ggGGGGGGGGGGgg#..",
    "...#GGGGDDDDGGGG#...",
    "....##DDDDDDDD##....",
    "........BB........",
    "........BB........",
    "........BB........",
    ".......BBBB......."
  ],
  tree_gold: [
    ".......######.......",
    ".....##yyyyyy##.....",
    "....#yyYYyyyyyy#....",
    "...#yYYYYYYYYYYy#...",
    "..#YYYYYBBBBYYYYY#..",
    "..#YYYYBBBBBBYYYY#..",
    "..#YYYYBBBBBBYYYY#..",
    "..#YYYYYBBBBYYYYY#..",
    "...#YYYYYYYYYYYY#...",
    "....##YYYYYYYY##....",
    "........BB........",
    "........BB........",
    "........BB........",
    ".......BBBB......."
  ],
  tree_emerald: [
    ".......######.......",
    ".....##EEEEEE##.....",
    "....#EEggggggEE#....",
    "...#EggggggggggE#...",
    "..#ggggDDDDDDgggg#..",
    "..#ggDDDDDDDDDDgg#..",
    "..#ggDDDDDDDDDDgg#..",
    "..#ggDDDDDDDDDDgg#..",
    "...#DDDDDDDDDDDD#...",
    "....##DDDDDDDD##....",
    "........BB........",
    "........BB........",
    "........BB........",
    ".......BBBB......."
  ],
  tree_ruby: [
    ".......######.......",
    ".....##RRRRRR##.....",
    "....#RRrrrrrrRR#....",
    "...#RrrrrrrrrrrR#...",
    "..#rrrrpppppprrrr#..",
    "..#rrpppppppppprr#..",
    "..#rrpppppppppprr#..",
    "..#rrpppppppppprr#..",
    "...#pppppppppppp#...",
    "....##pppppppp##....",
    "........BB........",
    "........BB........",
    "........BB........",
    ".......BBBB......."
  ]
};
