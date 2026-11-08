// 造型对位页：他/她 站立·跪·蹲 + 影子剪影，一次画在一层纸上
import { shotStage, cam, layer, panelOf, PINK, LADDER } from '../set.js';
import { figureSil, figureSilW } from '../figures.js';

function cal(E) {
  const S = shotStage({ key: 1.7, amb: .9, lightR: .4, lightCol: '#ffe0b0' });
  const vH = .30, c = [0, -.01], p = panelOf(vH, c, 1.5);
  layer(S, {
    ...p, z: -.06, trans: .18, shadow: false,
    draw: x => {
      const G = -.13, H = .13, col = '#b8563a';
      x.fillStyle = '#2a3550'; x.fillRect(-.30, -.4, .60, .30);
      x.save(); x.translate(-.072, G + .47 * H); x.fillStyle = col; figureSil(x, H, { pose: 'stand', facing: 1, mood: 'neutral', arms: [[.10, .16], [-.06, .22]] }); x.restore();
      x.save(); x.translate(-.016, G + .30 * H); x.fillStyle = col; figureSil(x, H, { pose: 'kneel', facing: 1, mood: 'sad', arms: [[.55, .95], [.16, .55]] }); x.restore();
      x.save(); x.translate(.036, G + .33 * H); x.fillStyle = col; figureSil(x, H, { pose: 'crouch', facing: 1, mood: 'nervous', arms: [[.9, 1.1], [.5, .8]] }); x.restore();
      x.save(); x.translate(.078, G + .47 * H); x.fillStyle = PINK; figureSilW(x, H, { pose: 'stand', facing: -1, mood: 'neutral', arms: [[.08, .14], [-.05, .2]] }); x.restore();
      x.fillStyle = '#ffffff'; x.fillRect(-.30, G, .60, .0015);
    },
  });
  return {
    S,
    update(t) { cam(S, t, { vH, look: [c[0], c[1], -.06], hand: 0 }); },
    post() { return { focus: S.cam.position.z + .06, aper: 2, maxCoc: 3, bloom: { strength: 0 } }; },
    grade() { return { expo: 1, vig: 0, sat: 1, contrast: 0 }; },
  };
}
export const SHOTS = [{ id: 'CAL', start: 0, build: cal }];
