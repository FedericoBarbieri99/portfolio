import './styles.css';
import { init, log } from './motion';

document.documentElement.classList.add('js');

// Work rows: one open at a time, CSS animates the height.
const buttons = document.querySelectorAll<HTMLButtonElement>('[data-row]');
buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    buttons.forEach((b) => {
      b.setAttribute('aria-expanded', 'false');
      document.getElementById(b.getAttribute('aria-controls')!)?.removeAttribute('data-open');
    });
    if (!open) {
      btn.setAttribute('aria-expanded', 'true');
      document.getElementById(btn.getAttribute('aria-controls')!)?.setAttribute('data-open', '');
      log(`open #${btn.closest('li')?.id}`);
    }
  });
});

init();
