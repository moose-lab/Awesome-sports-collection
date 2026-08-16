import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAudioFilter,
  renderFrame,
  scenes,
  starts,
  totalDuration,
} from "../docs/media/roboflow-sports-explainer/render.mjs";

test("Roboflow Sports explainer keeps its 43-second eight-scene timeline", () => {
  assert.equal(scenes.length, 8);
  assert.equal(totalDuration, 43);
  assert.deepEqual(starts, [0, 4.8, 10.2, 16.6, 21.6, 26.8, 32.2, 37]);
});

test("every explainer scene renders its matching Chinese caption", () => {
  scenes.forEach((scene, index) => {
    const frame = renderFrame(starts[index] + scene.duration / 2);
    assert.match(frame, new RegExp(scene.voice));
  });
});

test("the closing frame publishes the complete source install command", () => {
  const frame = renderFrame(42);
  assert.match(frame, /pip install git\+https:\/\/github\.com\/roboflow\/sports\.git/);
  assert.match(frame, /模型与依赖：请分别核对许可证/);
});

test("audio fade duration uses an FFmpeg-compatible leading zero", () => {
  const filter = buildAudioFilter();
  assert.match(filter, /afade=t=out:st=42\.20:d=0\.8/);
  assert.doesNotMatch(filter, /:d=\.8/);
});
