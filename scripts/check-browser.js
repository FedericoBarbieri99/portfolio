// With the dev server running: playwright-cli run-code --filename scripts/check-browser.js
async (page) => {
  const origin = await page.evaluate(() => location.origin);
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const route of ['/', '/it/']) {
    await page.goto(origin + route);
    await page.waitForFunction(() => document.documentElement.classList.contains('js'));
    await page.evaluate(() => document.fonts.ready.then(() => {}));
    check(await page.locator('[id^="p-"][inert]').count() === 6, 'Closed panels must be inert');
    const first = page.locator('[data-row]').nth(0);
    const second = page.locator('[data-row]').nth(1);
    await first.focus();
    await page.keyboard.press('Enter');
    check(await first.getAttribute('aria-expanded') === 'true', 'Keyboard must open a project');
    check(await page.locator('#p-platform').getAttribute('inert') === null, 'Open content must be accessible');
    await second.click();
    check(await page.locator('[data-row][aria-expanded="true"]').count() === 1, 'Only one panel can be open');
    check(await page.locator('#p-platform').getAttribute('inert') !== null, 'Previous panel must become inert');
    await second.click();
    check(await page.locator('[id^="p-"][inert]').count() === 6, 'A second click must close the panel');

    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const mode of ['front', 'backstage']) {
        if (await page.locator('html').getAttribute('data-mode') !== mode) {
          await page.locator('header [data-toggle]').click();
        }
        check(await page.locator('html').getAttribute('data-mode') === mode, 'Mode switch must work');
        check(await page.locator('[data-toggle]').evaluateAll(nodes => nodes.every(node => node.getAttribute('aria-pressed') === (document.documentElement.dataset.mode === 'backstage' ? 'true' : 'false'))), 'Switches must stay synchronized');
        check(await page.locator('header').evaluate(header => [...header.querySelectorAll('a, button')].filter(el => el.getClientRects().length && !el.closest('nav')).every(el => {
          const rect = el.getBoundingClientRect();
          return rect.left >= 0 && rect.right <= innerWidth && rect.bottom <= header.getBoundingClientRect().bottom;
        })), `Header controls must fit at ${width}px on ${route}`);
        check(await page.locator('nav').isVisible(), 'Section navigation must be available');
      }
    }
    await page.locator('header [data-toggle]').click();
    await page.locator('main > section:first-child > a[href="#work"]').click();
    check(await page.locator('#work').evaluate(el => el.getBoundingClientRect().top >= document.querySelector('header').getBoundingClientRect().bottom), 'Section links must clear the sticky header');
  }

  const context = await page.context().browser().newContext({ javaScriptEnabled: false });
  try {
    const fallback = await context.newPage();
    for (const route of ['/', '/it/']) {
      await fallback.goto(origin + route);
      check(await fallback.locator('body').evaluate(el => getComputedStyle(el).backgroundColor === 'rgb(237, 239, 236)'), 'Styles must load without JavaScript');
      check(await fallback.locator('#p-platform').evaluate(el => el.offsetHeight > 100 && !el.inert), 'Project details must be readable without JavaScript');
      check(await fallback.locator('header [data-toggle]').isHidden(), 'Unavailable switches must be hidden');
    }
  } finally {
    await context.close();
  }
  check(errors.length === 0, errors.join('\n'));
  console.log('Passed: EN/IT, five widths, both modes, keyboard, accordion accessibility, anchors, no-JS fallback.');
}
