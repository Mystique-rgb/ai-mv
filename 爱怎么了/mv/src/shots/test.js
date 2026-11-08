// 校准探针：0.10m 参考方格 + 人物，固定 vH=.30（量像素/米用）
import { shotStage, cam, layer, figure, panelOf } from '../set.js';

function sProbe(E) {
  const S = shotStage({});
  const p = panelOf(.30, [0, 0], 1.6);
  layer(S, { ...p, z: -.05, trans: .4, draw: x => { x.fillStyle = '#ffffff'; x.fillRect(-.05, -.05, .10, .10); x.fillStyle = '#000'; x.fillRect(-.052, -.052, .104, .004); } });
  figure(S, { x: 0, ground: 0, h: .235, z: -.05, ppm: p.ppm, col: '#c86b4a', mood: 'neutral', pose: 'stand', facing: 1 });
  return {
    S,
    update(t) { cam(S, t, { vH: .30, look: [0, 0, -.05], hand: 0 }); },
    post() { return { focus: S.cam.position.z - .05, aper: 2, maxCoc: 2, bloom: { strength: 0 } }; },
    grade() { return { expo: 1, vig: 0, sat: 1, contrast: 0 }; },
  };
}
export const SHOTS = [{ id: 'SP', start: 0, build: sProbe }];
