declare module "gifenc" {
  export function GIFEncoder(): {
    writeFrame(index: Uint8Array, width: number, height: number, options: { palette: number[][]; delay: number; repeat: number; dispose: number }): void;
    finish(): void;
    bytes(): Uint8Array;
  };
}
