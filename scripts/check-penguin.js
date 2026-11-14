// With the dev server open: playwright-cli run-code --filename scripts/check-penguin.js
async (page) => {
  const origin = await page.evaluate(() => location.origin);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const idle = () => page.waitForFunction(() => {
    const bird = document.querySelector('[data-penguin]');
    const r = bird.getBoundingClientRect();
    // the frame has a little empty sky above the character's head (about 17% of it): the character, not the frame, clears the bar
    return !bird.hidden && bird.dataset.state === 'idle' && r.top + r.height * 0.16 >= document.querySelector('header').getBoundingClientRect().bottom && r.bottom <= innerHeight;
  }, null, { timeout: 8000 });
  const scrollTo = async selector => {
    await page.locator(selector).evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().bottom + scrollY - innerHeight * 0.58, behavior: 'instant' }));
    await idle();
  };
  // The mascot is a square frame of the clay sheet whose ground line is 8.33% above its bottom edge: the feet are there, not at the bottom.
  const feet = bird => { const r = bird.getBoundingClientRect(); return r.bottom - r.height * 0.0833; };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin + '/it/');
    await idle();
    check(await page.locator('[data-penguin]').getAttribute('data-perch') === 'switch', `Hero entrance at ${width}px`);
    // the sprite is really drawn, and in backstage its wire frame is amber on top of a ground-coloured silhouette
    const ink = () => page.locator('[data-penguin] canvas').evaluate(canvas => {
      const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let opaque = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 200) opaque++;
      return { opaque, size: canvas.width };
    });
    const clay = await ink();
    check(clay.opaque > clay.size * clay.size * 0.2, 'The clay mascot must be drawn on its canvas');
    await page.keyboard.press('b');
    await page.waitForFunction(() => document.documentElement.dataset.mode === 'backstage');
    await idle();
    check(await page.locator('[data-penguin]').evaluate((bird, feetSrc) => Math.abs((0, eval)(feetSrc)(bird) - document.querySelector('[data-hero-track]').getBoundingClientRect().top) < 3, feet.toString()), 'Feet must land on the switch');
    // in backstage the wire frame is amber on top of a ground-coloured silhouette
    await page.waitForFunction(() => { const canvas = document.querySelector('[data-penguin] canvas'); const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data; let amber = 0; for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 120 && data[i] > 200 && data[i + 1] > 130 && data[i + 1] < 210 && data[i + 2] < 120) amber++; return amber > 20; }, null, { timeout: 8000 }).catch(() => { throw new Error('In backstage the mascot must show its amber wire frame'); });

    await page.keyboard.press('b');
    await page.waitForFunction(() => document.documentElement.dataset.mode === 'front');
    await idle();
    check(await page.locator('.bs:not([data-penguin-label])').evaluateAll(notes => notes.every(el => getComputedStyle(el).visibility === 'hidden' || getComputedStyle(el).display === 'none')), 'Closing backstage must hide every annotation');

    await scrollTo('#w-platform');
    check(await page.locator('[data-penguin]').getAttribute('data-perch') === 'project 1', 'Land on the project rail');
    // The lead case study arrives open: collapse it first, so the next click is a real expansion.
    await page.locator('#w-platform [data-row]').click();
    await page.waitForFunction(() => document.querySelector('#p-platform').getBoundingClientRect().height < 10);
    await scrollTo('#w-platform');
    await page.locator('#w-platform [data-row]').click();
    await page.waitForFunction(() => document.querySelector('#p-platform').getBoundingClientRect().height > 100);
    await scrollTo('#w-platform');
    check(await page.locator('[data-penguin]').evaluate((bird, feetSrc) => Math.abs((0, eval)(feetSrc)(bird) - document.querySelector('#w-platform').getBoundingClientRect().bottom) < 3, feet.toString()), 'Opening a project must carry its passenger');
    // it stands where it covers no text and no button
    check(await page.locator('[data-penguin]').evaluate(bird => {
      const r = bird.getBoundingClientRect();
      const body = { left: r.left + r.width * 0.16, right: r.right - r.width * 0.16, top: r.top + r.height * 0.3, bottom: r.bottom - r.height * 0.1 };
      const row = document.querySelector('#w-platform');
      const hit = [];
      const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent.trim() || node.parentElement.closest('[inert]') || getComputedStyle(node.parentElement).visibility === 'hidden') continue;
        const range = document.createRange(); range.selectNodeContents(node);
        for (const b of range.getClientRects()) if (b.right > body.left && b.left < body.right && b.bottom > body.top && b.top < body.bottom) hit.push(node.textContent.trim().slice(0, 20));
      }
      for (const el of row.querySelectorAll('[data-clay="plus"]')) { const b = el.getBoundingClientRect(); if (b.right > body.left && b.left < body.right && b.bottom > body.top && b.top < body.bottom) hit.push('plus'); }
      return hit.length === 0;
    }), 'The mascot must not stand on text or on the plus button of its row');

    // Slow scrolling used to start fresh exits/drops on every newly visible rail.
    const scrollingStates = await page.evaluate(async () => {
      const states = [];
      for (let frame = 0; frame < 90; frame++) {
        window.scrollBy({ top: 8, behavior: 'instant' });
        await new Promise(requestAnimationFrame);
        states.push(document.querySelector('[data-penguin]').dataset.state);
      }
      return states;
    });
    check(scrollingStates.every(state => ['idle', 'hidden'].includes(state)), `No new scene during continuous scroll: ${[...new Set(scrollingStates)]}`);
    await idle();

    // Reverse direction before a flight finishes; only the final destination is allowed to land.
    await page.locator('#skills').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
    await page.locator('#experience').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('[data-penguin]').dataset.state === 'idle' && document.querySelector('[data-penguin]').dataset.perch === 'switch', null, { timeout: 8000 });

    // The farewell: the whole contact section is on screen and the diorama band is still under the hand-off threshold.
    await page.locator('#contact').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().bottom + scrollY - innerHeight + 4, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('[data-penguin]').dataset.state === 'idle' && document.querySelector('[data-penguin]').dataset.perch === 'hello', null, { timeout: 10000 });
    check(await page.locator('[data-horizon]').evaluate(band => { const r = band.getBoundingClientRect(); return (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height < 0.45; }), 'The band must be under the hand-off threshold here');
    check(await page.locator('[data-penguin]').evaluate((bird, feetSrc) => Math.abs((0, eval)(feetSrc)(bird) - document.querySelector('[data-cta]').getBoundingClientRect().top) < 3, feet.toString()), 'The farewell must stand on the contact button, feet on its top edge');
    // The hello is the sheet's wave clip (frames 24 to 39), played front on, and it ends back on the front turn frame.
    await page.waitForTimeout(2600); // a greeting is not repeated within 2.4s of the last one
    await page.locator('[data-cta]').hover();
    const frames = await page.evaluate(async () => {
      const bird = document.querySelector('[data-penguin]');
      const seen = new Set();
      for (let i = 0; i < 160; i++) { seen.add(Number(bird.dataset.frame)); await new Promise(requestAnimationFrame); }
      return [...seen];
    });
    check(frames.some(f => f >= 25 && f <= 38), `Hovering the contact button must play the wave clip: ${frames}`);
    await page.waitForFunction(() => { const bird = document.querySelector('[data-penguin]'); return bird.dataset.state === 'idle' && bird.dataset.perch === 'hello'; }, null, { timeout: 6000 });
    await page.mouse.move(5, 5);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('[data-penguin]').hidden);
    check(await page.locator('[data-penguin]').evaluate(el => el.getAnimations({ subtree: true }).length === 0), 'Reduced motion must stop every mascot animation');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await idle();
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
    check(await page.locator('[data-penguin]').isHidden(), 'Page suspension must hide the mascot');
    // hidden, it must not tick: no blink/glance frame loop and no pending blink timer may wake it
    await page.evaluate(() => {
      window.mascotFrames = 0;
      const raf = window.requestAnimationFrame.bind(window);
      if (!window.mascotPatched) { window.mascotPatched = true; window.requestAnimationFrame = callback => { if (callback.name === 'idleFrame') window.mascotFrames++; return raf(callback); }; }
    });
    await page.waitForTimeout(7000); // longer than the longest gap between two blinks
    check(await page.evaluate(() => window.mascotFrames) === 0 && await page.locator('[data-penguin]').isHidden(), 'A hidden mascot must run no animation frames');
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow')));
    await idle();

    // The very bottom belongs to the clay penguin: the flat one is gone, the diorama slides, rises, waves and idles.
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('[data-penguin]').hidden, null, { timeout: 5000 });
    await page.waitForFunction(() => document.querySelector('[data-diorama-stage]').dataset.state === 'idle', null, { timeout: 15000 });
    check(await page.locator('[data-penguin]').isHidden(), 'At the very bottom the flat mascot must be hidden');
    check(await page.locator('[data-diorama-stage]').evaluate(stage => {
      const r = stage.getBoundingClientRect();
      return r.width > 90 && stage.hasAttribute('data-drawn') && getComputedStyle(stage.querySelector('[data-diorama-still]')).visibility === 'hidden' && stage.querySelector('canvas').getBoundingClientRect().width > 90;
    }), 'The canvas must be the visible one once the character is on stage');
    // The frame loop runs while it idles...
    await page.evaluate(() => {
      window.loopCount = 0;
      const raf = window.requestAnimationFrame.bind(window);
      if (!window.loopPatched) { window.loopPatched = true; window.requestAnimationFrame = callback => { if (callback.name === 'dioramaFrame') window.loopCount++; return raf(callback); }; }
    });
    await page.waitForTimeout(500);
    check(await page.evaluate(() => window.loopCount) > 2, 'The idle loop must be running on screen');
    // The character is a real-time model on a WebGL canvas, with a clip playing and no turn yet.
    check(await page.locator('[data-diorama-stage] canvas').first().evaluate(canvas => !!canvas.getContext('webgl2') || !!canvas.getContext('webgl')), 'The diorama canvas must be a WebGL canvas');
    check(await page.locator('[data-diorama-stage]').evaluate(stage => /^idle:\d+$/.test(stage.dataset.pose) && stage.dataset.yaw === '0'), 'Idle plays a clip of the model, facing front');
    // Dragging turns it 1:1 (a drag across the stage is one full turn) and it springs back to the front.
    const box = await page.locator('[data-diorama-stage]').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.5);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) { await page.mouse.move(box.x + box.width / 2 + box.width / 4 * i / 8, box.y + box.height * 0.5); await page.waitForTimeout(24); }
    await page.waitForTimeout(120);
    check(await page.locator('[data-diorama-stage]').evaluate(stage => stage.dataset.state === 'spin' && Math.abs(Number(stage.dataset.yaw) - 90) <= 3), 'A drag of a quarter of the stage must turn the body a quarter turn');
    await page.mouse.up();
    await page.waitForFunction(() => document.querySelector('[data-diorama-stage]').dataset.state === 'idle' && document.querySelector('[data-diorama-stage]').dataset.yaw === '0', null, { timeout: 8000 })
      .catch(() => { throw new Error('After a drag the body must come back to the front and idle'); });
    // Backstage: the same canvas draws the wireframe model, loaded the first time the page is in backstage, with a live tag.
    check(await page.locator('[data-diorama-stage]').evaluate(stage => stage.dataset.wire === undefined), 'The wireframe model must not load before backstage');
    await page.keyboard.press('b');
    await page.waitForFunction(() => document.documentElement.dataset.mode === 'backstage' && document.querySelector('[data-diorama-stage]').dataset.wire === 'ready', null, { timeout: 8000 })
      .catch(() => { throw new Error('Backstage must load the wireframe model'); });
    check(await page.evaluate(() => /^model · (idle|wave|turn)$/.test(document.querySelector('[data-diorama-name]').textContent) && /^\d+°$/.test(document.querySelector('[data-diorama-frame]').textContent)), 'The backstage tag must read the live clip and yaw');
    await page.keyboard.press('b');
    await page.waitForFunction(() => document.documentElement.dataset.mode === 'front');
    // ...and stops when the band leaves the screen.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    // The loop parks when the band's IntersectionObserver reports it off screen, and that report is asynchronous (it waits for a
    // rendering opportunity, which a loaded machine can delay well past any fixed pause). So wait for the real condition, a loop that has
    // gone quiet: a 300ms window with no frame. A loop that never parks never gets one and fails here at the timeout.
    await page.waitForFunction(() => new Promise(resolve => { const seen = window.loopCount; setTimeout(() => resolve(window.loopCount === seen), 300); }), null, { timeout: 10000, polling: 100 })
      .catch(() => { throw new Error('No frame loop may run while the band is off screen: the loop never parked'); });
    // ...and once parked it must stay parked.
    await page.evaluate(() => { window.loopCount = 0; });
    await page.waitForTimeout(600);
    check(await page.evaluate(() => window.loopCount) === 0, 'No frame loop may run while the band is off screen');
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('[data-diorama-stage]').dataset.state === 'idle');
    // Reduced motion, live: the stage freezes into its static pose and nothing ticks.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('[data-diorama-stage]').dataset.state === 'static');
    await page.evaluate(() => { window.loopCount = 0; });
    const frozen = await page.locator('[data-diorama-stage]').getAttribute('data-pose');
    await page.waitForTimeout(600);
    check(await page.evaluate(() => window.loopCount) === 0, 'Reduced motion must stop the frame loop');
    check(await page.locator('[data-diorama-stage]').getAttribute('data-pose') === frozen && frozen === 'still', 'Reduced motion must freeze the pose');
    check(await page.locator('[data-diorama-still]').isVisible(), 'The static pose is the still image');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.querySelector('[data-diorama-stage]').dataset.state === 'idle', null, { timeout: 8000 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('[data-penguin]').dataset.state === 'idle' && !document.querySelector('[data-penguin]').hidden, null, { timeout: 8000 });
  }
  // A mode change during the page entrance must not resurrect the old switch position.
  await page.goto(origin + '/');
  await page.waitForFunction(() => document.documentElement.classList.contains('js'));
  await page.evaluate(() => {
    window.wipeRuns = [];
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (...args) => {
      const run = {};
      window.wipeRuns.push(run);
      const transition = start(...args);
      transition.ready.then(() => {
        run.ready = performance.now();
        const animation = document.getAnimations().find(item => ['backstage-open', 'backstage-close'].includes(item.animationName));
        run.circular = animation?.effect.getKeyframes().every(frame => frame.clipPath?.startsWith('circle('));
      }, error => { run.error = error.message; });
      transition.finished.then(() => { run.finished = performance.now(); });
      return transition;
    };
  });
  await page.keyboard.press('b');
  await page.waitForFunction(() => document.documentElement.dataset.mode === 'backstage');
  // Reverse mid-wipe: neither reveal may be skipped or reduced to a colour flash.
  await page.keyboard.press('b');
  await page.waitForFunction(() => document.documentElement.dataset.mode === 'front' && !document.documentElement.style.getPropertyValue('--dur'));
  const wipes = await page.evaluate(() => window.wipeRuns);
  check(wipes.length === 2 && wipes.every(run => !run.error && run.circular && run.finished - run.ready >= 490), 'Both circular transitions must finish under rapid input');
  await page.keyboard.press('b');
  await page.waitForFunction(() => document.documentElement.dataset.mode === 'backstage' && !document.documentElement.style.getPropertyValue('--dur'));
  await idle();
  for (let i = 0; i < 6; i++) await page.keyboard.press('b');
  await page.waitForFunction(() => !document.documentElement.style.getPropertyValue('--dur'));
  await idle();
  check(await page.locator('html').getAttribute('data-mode') === 'backstage', 'Rapid flips must preserve the final requested mode');
  await page.locator('#skills').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await page.waitForFunction(() => ['arrive', 'hop', 'exit'].includes(document.querySelector('[data-penguin]').dataset.state));
  await page.setViewportSize({ width: 320, height: 740 });
  // a resize mid-flight must leave it on a real perch: bring a rung's line to the reading height, where one is on screen at this size
  await scrollTo('#skills > ol > li:nth-child(2)');
  await page.locator('#experience').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelector('[data-penguin]').hidden);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await idle();
  check(errors.length === 0, errors.join('\n'));
}
