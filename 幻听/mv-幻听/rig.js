// Clawd as a brick figure: box body, brick legs, round-brick arms, square eyes.
// Units: 1 = one stud pitch (8mm). Only the shoulders and hips rotate; nothing bends.
import * as THREE from 'three';
import { BRICK, PLATE, brick, plate, mesh, roundGeo, plastic, brickGeo } from './bricks.js';

const HIP = PLATE + 2 * BRICK;          // 2.8
const SHOULDER = HIP + PLATE + 2 * BRICK; // 5.6

export const TERRA = '#d97757';
export const ROSY = '#e58384';

// opts: { color, scale, body: 1 } — extra() lets a build add its own bits
export function makeClawd(opts = {}) {
  const col = opts.color || TERRA;
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const parts = [];                        // assembly groups, in build order

  const legs = [-1.5, 1.5].map(x => {
    const g = new THREE.Group(); g.position.set(x, HIP, 0); body.add(g);
    for (let i = 0; i < 2; i++) { const b = brick(1, 1, col); b.position.y = -HIP + PLATE + i * BRICK; g.add(b); }
    const f = plate(1, 2, col); f.position.set(0, -HIP, .3); g.add(f);
    parts.push({ obj: g, from: [0, 6, 0] });
    return g;
  });

  const hip = plate(6, 5, col); hip.position.y = HIP; body.add(hip); parts.push({ obj: hip, from: [0, 7, 0] });
  const torso = new THREE.Group(); body.add(torso);
  for (let i = 0; i < 2; i++) {
    const b = new THREE.Mesh(brickGeo(6, 5, BRICK, { tile: true }), plastic(col));
    b.position.y = HIP + PLATE + i * BRICK; b.castShadow = b.receiveShadow = true; torso.add(b);
  }
  parts.push({ obj: torso, from: [0, 8, 0] });

  const arms = [-3.5, 3.5].map(x => {
    const g = new THREE.Group(); g.position.set(x, SHOULDER - .1, 0); body.add(g);
    for (let i = 0; i < 3; i++) { const b = mesh(roundGeo(.5), col); b.position.y = -3 * BRICK + i * BRICK; g.add(b); }
    const hand = new THREE.Group(); hand.position.y = -3 * BRICK - .2; g.add(hand);
    parts.push({ obj: g, from: [x > 0 ? 5 : -5, 5, 0] });
    return { g, hand };
  });

  const head = new THREE.Group(); head.position.set(0, SHOULDER + PLATE, 0); body.add(head);
  const skull = new THREE.Group(); head.add(skull);
  for (let i = 0; i < 3; i++) { const b = brick(6, 5, col); b.position.y = i * BRICK; skull.add(b); }
  // face: two big square eyes, straight on the front face — reads at any distance
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#20130d', roughness: .28 });
  const EY = BRICK * 1.72, EX = 1.18, EW = 1.7, EH = 1.75;
  const eyes = [-EX, EX].map(ex => {
    const e = new THREE.Mesh(new THREE.BoxGeometry(EW, EH, .22), eyeMat);
    e.position.set(ex, EY, 2.53); skull.add(e); return e;
  });
  const shineMat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: .8 });
  const shine = [-EX + .42, EX + .42].map(ex => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(.4, .4, .1), shineMat);
    s.position.set(ex, EY + .42, 2.66); skull.add(s); return s;
  });
  parts.push({ obj: skull, from: [0, 10, 0] });

  parts.forEach(q => { q.home = q.obj.position.clone(); });
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  if (opts.scale) root.scale.setScalar(opts.scale);

  // p: x,y,z,ry / bob, lean, sit / legs[2] / armL,armR = [x,z] / nod,look,tilt / eyes (0..1 open)
  function pose(p = {}) {
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0);
    root.rotation.y = p.ry ?? 0;
    const sit = p.sit ?? 0;
    body.position.y = (p.bob ?? 0) - sit * (HIP - .5);
    body.rotation.x = p.lean ?? 0;
    legs[0].rotation.x = (p.legs?.[0] ?? 0) - sit * 1.45;
    legs[1].rotation.x = (p.legs?.[1] ?? 0) - sit * 1.45;
    const aL = p.armL ?? [0, 0], aR = p.armR ?? [0, 0];
    arms[0].g.rotation.set(aL[0], 0, -aL[1]);
    arms[1].g.rotation.set(aR[0], 0, aR[1]);
    head.rotation.set(p.nod ?? 0, p.look ?? 0, p.tilt ?? 0);
    const open = p.eyes ?? 1;
    eyes.forEach(e => { e.scale.y = open; e.visible = open > .05; });
    shine.forEach((s, i) => { s.visible = open > .55; s.position.y = BRICK * 1.55 + .05 + (eyes[i].scale.y - 1) * .3 + .3; });
  }
  // assembly: u = 0..1 over parts; each part flies in from its offset and snaps with a small overshoot
  function assemble(u) {
    parts.forEach((q, i) => {
      const k = Math.min(1, Math.max(0, u * parts.length - i));
      q.obj.visible = k > 0;
      const e = k < 1 ? (1 - k) : 0;
      const over = k >= 1 ? Math.max(0, .25 - (u * parts.length - i - 1) * .25) : 0;
      q.obj.position.copy(q.home).add(new THREE.Vector3(q.from[0] * e, q.from[1] * e - over * 1.2, q.from[2] * e));
      q.obj.rotation.z = e * .4;
    });
  }
  function visible(v) { root.visible = v; }
  return { root, body, head, arms, legs, pose, assemble, visible, parts };
}

export function walkPose(phi, amp = .55) {
  const s = Math.sin(phi);
  return { legs: [s * amp, -s * amp], armL: [-s * amp * .6, .06], armR: [s * amp * .6, .06], bob: Math.abs(Math.cos(phi)) * .18 };
}
