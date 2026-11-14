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
    const first = page.locator('[data-row]').nth(0);
    const second = page.locator('[data-row]').nth(1);
    check(await first.getAttribute('aria-expanded') === 'true', 'The lead case study arrives open');
    check(await page.locator('[id^="p-"][inert]').count() === 5, 'Every other panel must arrive inert');
    await first.focus();
    await page.keyboard.press('Enter');
    check(await first.getAttribute('aria-expanded') === 'false', 'Keyboard must close a project');
    check(await page.locator('[id^="p-"][inert]').count() === 6, 'Closed panels must be inert');
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
        // from 1100px the sections are inline in the bar; below it they live in the Menu popover, which opens, closes on Escape and holds every section link
        if (width >= 1100) {
          check(await page.locator('header nav:not([popover])').isVisible() && await page.locator('header [popovertarget]').isHidden(), `Inline section navigation at ${width}px`);
        } else {
          const menu = page.locator('header [data-menu]');
          check(await page.locator('header [popovertarget]').isVisible() && await menu.isHidden(), `The Menu button stands in for the navigation at ${width}px`);
          await page.locator('header [popovertarget]').focus();
          await page.keyboard.press('Enter');
          check(await menu.evaluate(el => el.matches(':popover-open')) && await menu.locator('a').count() === 5 && await menu.locator('a').evaluateAll(links => links.every(a => a.getBoundingClientRect().height >= 44)), `The Menu opens with five touch-sized links at ${width}px`);
          await page.keyboard.press('Escape');
          check(await menu.evaluate(el => !el.matches(':popover-open')), `Escape closes the Menu at ${width}px`);
        }
        check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal scroll at ${width}px in ${mode} on ${route}`);
        // the clay name lies over the live text in front; backstage hides it and the live text becomes its outline
        await page.waitForFunction(backstage => {
          const style = getComputedStyle(document.querySelector('[data-name-clay]'));
          return backstage ? style.visibility === 'hidden' || style.opacity === '0' : style.opacity === '1' && style.visibility === 'visible';
        }, mode === 'backstage', { timeout: 3000 }).catch(() => { throw new Error(`The clay name must show in front only (${mode}, ${width}px)`); });
        check(await page.locator('[data-hero-knob]').evaluate((knob, backstage) => {
          const track = knob.parentElement.getBoundingClientRect(); const k = knob.getBoundingClientRect();
          return backstage ? track.right - k.right < track.height * 0.25 : k.left - track.left < track.height * 0.25;
        }, mode === 'backstage'), 'The knob rests on the side of the mode');
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
      await fallback.locator('[data-diorama-still]').scrollIntoViewIfNeeded();
      await fallback.waitForFunction(() => { const img = document.querySelector('[data-diorama-still]'); return img.complete && img.naturalWidth > 0; });
      check(await fallback.locator('[data-diorama-still]').evaluate(img => { const r = img.getBoundingClientRect(); return r.width > 90 && r.height > 90 && getComputedStyle(img).visibility === 'visible'; }), 'Without JavaScript the still pose of the diorama is the whole feature');
    }
  } finally {
    await context.close();
  }
  check(errors.length === 0, errors.join('\n'));
  console.log('Passed: EN/IT, five widths, both modes, no horizontal scroll, clay name and switch rest, keyboard, accordion accessibility, anchors, no-JS fallback.');
}
