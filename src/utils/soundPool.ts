// src/utils/soundPool.ts
export type SoundPool = {
  play: () => void;
  load: () => void;
  destroy: () => void;
};

export function createSoundPool(src: string, size = 6, volume = 1): SoundPool {
  const pool: HTMLAudioElement[] = Array.from({ length: size }, () => {
    const a = new Audio(src);
    a.preload = "auto";
    a.volume = volume;
    return a;
  });

  let idx = 0;

  const load = () => pool.forEach((a) => a.load());

  const play = () => {
    const a = pool[idx % pool.length];
    idx++;

    // รีเซ็ตให้เล่นใหม่ทุกครั้ง
    a.pause();
    a.currentTime = 0;

    a.play().catch(() => {
      // เงียบไว้ (กัน policy / decode error)
    });
  };

  const destroy = () => {
    pool.forEach((a) => {
      a.pause();
      a.src = "";
    });
  };

  return { play, load, destroy };
}
