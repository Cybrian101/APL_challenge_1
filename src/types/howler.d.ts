declare module 'howler' {
  export class Howl {
    constructor(options: {
      src: string | string[];
      volume?: number;
      rate?: number;
      preload?: boolean;
      html5?: boolean;
    });
    play(): number;
    stop(id?: number): this;
    volume(value?: number, id?: number): number | this;
    rate(value?: number, id?: number): number | this;
  }

  export const Howler: {
    ctx?: AudioContext;
    volume: (value?: number) => number;
  };
}
