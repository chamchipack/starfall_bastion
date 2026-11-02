// 건설 패드 좌표를 고정 시드(12345)로 생성해 index.html의 MAPS[].pads에 직접 써 넣는다.
// 사용법: node tools/gen-pads.js   (규칙은 index.html의 genPads 함수)
const fs = require('fs'), path = require('path'), vm = require('vm');
const file = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(file, 'utf8');
const cut = (a, b) => html.slice(html.indexOf(a), html.indexOf(b));
const ctx = vm.createContext({ Math });
const api = vm.runInContext(cut('/* @data-start */', '/* @data-end */') + cut('/* @geo-start */', '/* @geo-end */') + ';({MAPS, genPads})', ctx);
for (const m of api.MAPS) {
  const pads = api.genPads(m, 12345);
  console.log(m.id, pads.length);
  if (pads.length < 16) throw new Error(`${m.id}: 패드 ${pads.length}개 (16개 미만)`);
  const re = new RegExp(`(id:"${m.id}"[\\s\\S]*?pads:)\\[[\\s\\S]*?\\]( })`);
  html = html.replace(re, `$1${JSON.stringify(pads)}$2`);
}
fs.writeFileSync(file, html);
