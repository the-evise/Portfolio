import { useMemo } from "react";

interface MoodTile {
    id: string;
    src: string;
    rowStart: number; // 1 based
    colStart: number;
    rowSpan: number;
    colSpan: number;
}

type Shape = { rowSpan: number; colSpan: number };

const GRID_SIZE = 3;
const SHAPES: Shape[] = [
    { rowSpan: 2, colSpan: 1 },
    { rowSpan: 1, colSpan: 2 },
    { rowSpan: 1, colSpan: 1 },
] as const;

export function useMoodBoardLayout(images: string[]) {
    return useMemo(() => {
        if (!images.length) return [];

        const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
        const startOffset = Math.floor(Math.random() * images.length);

        return fillGrid(grid, images, startOffset, 0) ?? [];
    }, [images]);
}

function fillGrid(
    grid: boolean[][],
    images: string[],
    imageOffset: number,
    tileIndex: number
): MoodTile[] | null {
    const next = findNextEmpty(grid);
    if (!next) return [];

    const shapes = shuffleShapes();
    const src = images[(tileIndex + imageOffset) % images.length];

    for (const shape of shapes) {
        if (!canPlace(grid, next.row, next.col, shape.rowSpan, shape.colSpan)) continue;

        place(grid, next.row, next.col, shape.rowSpan, shape.colSpan, true);

        const child = fillGrid(grid, images, imageOffset, tileIndex + 1);
        if (child) {
            return [
                {
                    id: `${src}-${tileIndex}-${Math.random().toString(36).slice(2, 8)}`,
                    src,
                    rowStart: next.row + 1,
                    colStart: next.col + 1,
                    rowSpan: shape.rowSpan,
                    colSpan: shape.colSpan,
                },
                ...child,
            ];
        }

        place(grid, next.row, next.col, shape.rowSpan, shape.colSpan, false);
    }

    return null;
}

function findNextEmpty(grid: boolean[][]) {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (!grid[r][c]) {
                return { row: r, col: c };
            }
        }
    }
    return null;
}

function canPlace(grid: boolean[][], r: number, c: number, rowSpan: number, colSpan: number) {
    if (r + rowSpan > GRID_SIZE || c + colSpan > GRID_SIZE) return false;

    for (let y = r; y < r + rowSpan; y++) {
        for (let x = c; x < c + colSpan; x++) {
            if (grid[y][x]) return false;
        }
    }
    return true;
}

function place(grid: boolean[][], r: number, c: number, rowSpan: number, colSpan: number, fill: boolean) {
    for (let y = r; y < r + rowSpan; y++) {
        for (let x = c; x < c + colSpan; x++) {
            grid[y][x] = fill;
        }
    }
}

function shuffleShapes() {
    const copy = [...SHAPES];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}
