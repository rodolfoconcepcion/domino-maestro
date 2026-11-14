/**
 * Synthesizes a short wooden/resin domino clack sound using the Web Audio API.
 * Safe no-op in headless or restricted browser environments.
 */
export function playClackSound(): void {
  try {
    const win = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioCtx = win.AudioContext || win.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.onended = () => {
      try {
        void ctx.close();
      } catch {
        // Ignore close failures
      }
    };

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // Ignore audio context restriction errors
  }
}
