import { $ } from './utils.js';

export async function renderAll(){
  await renderMain();
  renderSettings();
}

export async function renderMain(){
  const main = $('#tab-main');
  if (main) {
    // main rendering would occur here
  }
}

export function renderSettings(){
  const list = $('#nurseList');
  if (list) {
    list.innerHTML = '';
  }
}
