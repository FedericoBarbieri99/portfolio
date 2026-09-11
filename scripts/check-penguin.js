// With the dev server open: playwright-cli run-code --filename scripts/check-penguin.js
async (page) => {
  const origin = await page.evaluate(() => location.origin);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const idle = () => page.waitForFunction(() => {
    const bird = document.querySelector('[data-penguin]');
    const r = bird.getBoundingClientRect();
    return !bird.hidden && bird.dataset.state === 'idle' && r.top >= document.querySelector('header').getBoundingClientRect().bottom && r.bottom <= innerHeight;
  }, null, { timeout: 8000 });
  const scrollTo = async selector => {
    await page.locator(selector).evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().bottom + scrollY - innerHeight * 0.58, behavior: 'instant' }));
    await idle();
  };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin + '/it/');
    await idle();
    check(await page.locator('[data-penguin]').getAttribute('data-perch') === 'switch', `Hero entrance at ${width}px`);
    await page.keyboard.press('b');
    await page.waitForFunction(() => document.documentElement.dataset.mode === 'backstage');
    await idle();
    check(await page.locator('[data-penguin]').evaluate(bird => Math.abs(bird.getBoundingClientRect().bottom - document.querySelector('[data-hero-track]').getBoundingClientRect().top) < 3), 'Feet must land on the switch');
    await page.keyboard.press('b');
    await page.waitForFunction(() => document.documentElement.dataset.mode === 'front');
    await idle();
    check(await page.locator('.bs:not([data-penguin-label])').evaluateAll(notes => notes.every(el => getComputedStyle(el).visibility === 'hidden' || getComputedStyle(el).display === 'none')), 'Closing backstage must hide every annotation');

    await scrollTo('#w-platform');
    check(await page.locator('[data-penguin]').getAttribute('data-perch') === 'project 1', 'Land on the project rail');
    await page.locator('#w-platform [data-row]').click();
    await page.waitForFunction(() => document.querySelector('#p-platform').getBoundingClientRect().height > 100);
    await scrollTo('#w-platform');
    check(await page.locator('[data-penguin]').evaluate(bird => Math.abs(bird.getBoundingClientRect().bottom - document.querySelector('#w-platform').getBoundingClientRect().bottom) < 3), 'Opening a project must carry its passenger');

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

    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('[data-penguin]').dataset.state === 'idle' && document.querySelector('[data-penguin]').dataset.perch === 'hello', null, { timeout: 10000 });
    check(await page.locator('[data-penguin]').evaluate(bird => Math.abs(bird.getBoundingClientRect().bottom - document.querySelector('[data-cta]').getBoundingClientRect().top) < 3), 'Final greeting must land on the email button');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('[data-penguin]').hidden);
    check(await page.locator('[data-penguin]').evaluate(el => el.getAnimations({ subtree: true }).length === 0), 'Reduced motion must stop every mascot animation');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await idle();
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
    check(await page.locator('[data-penguin]').isHidden(), 'Page suspension must hide the mascot');
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow')));
    await idle();
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
  await idle();
  await page.locator('#experience').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelector('[data-penguin]').hidden);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await idle();
  check(errors.length === 0, errors.join('\n'));
}
