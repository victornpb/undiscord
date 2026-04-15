import { msToHMS } from '../utils/time.js';

/**
 * Setup progress callbacks on the UndiscordCore instance.
 * @param {UndiscordCore} undiscordCore - Core instance
 * @param {Object} ui - UI element references
 * @param {Function} $ - Scoped querySelector shorthand
 */
export function setupProgress(undiscordCore, ui, $) {

  undiscordCore.onStart = (state, stats) => {
    $('#start').disabled = true;
    $('#stop').disabled = false;
    ui.undiscordBtn.classList.add('running');
    ui.progressMain.style.display = 'block';
    ui.percent.style.display = 'block';
  };

  undiscordCore.onProgress = (state, stats) => {
    let max = state.grandTotal;
    const value = state.delCount + state.failCount;
    max = Math.max(max, value, 0);

    const percent = value >= 0 && max ? Math.round(value / max * 100) + '%' : '';
    const elapsed = msToHMS(Date.now() - stats.startTime.getTime());
    const remaining = msToHMS(stats.etr);
    ui.percent.textContent = `${percent} (${value}/${max}) Elapsed: ${elapsed} Remaining: ${remaining}`;

    // set max before value to avoid brief 100% glitch on first update
    if (max) {
      ui.progressIcon.setAttribute('max', max);
      ui.progressMain.setAttribute('max', max);
      ui.progressIcon.value = value;
      ui.progressMain.value = value;
    } else {
      ui.progressIcon.removeAttribute('value');
      ui.progressMain.removeAttribute('value');
      ui.percent.textContent = '...';
    }

    // sync delay sliders with core values
    const searchDelayInput = $('input#searchDelay');
    searchDelayInput.value = undiscordCore.options.searchDelay;
    $('div#searchDelayValue').textContent = undiscordCore.options.searchDelay + 'ms';

    const deleteDelayInput = $('input#deleteDelay');
    deleteDelayInput.value = undiscordCore.options.deleteDelay;
    $('div#deleteDelayValue').textContent = undiscordCore.options.deleteDelay + 'ms';
  };

  undiscordCore.onStop = (state, stats) => {
    $('#start').disabled = false;
    $('#stop').disabled = true;
    ui.undiscordBtn.classList.remove('running');
    ui.progressMain.style.display = 'none';
    ui.percent.style.display = 'none';
  };
}
