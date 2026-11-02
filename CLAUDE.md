# STARFALL / BASTION

브라우저 우주 타워 디펜스. 게임 전체가 `index.html` 한 파일이다.

## 지켜야 할 규칙
- 단일 `index.html` (HTML/CSS/JS 인라인). 빌드 도구·프레임워크·외부 이미지/사운드 없음. 폰트만 Google Fonts.
- 저장 없음: localStorage, sessionStorage, IndexedDB, 쿠키 사용 금지. 새로고침하면 처음부터.
- 확장은 DATA 항목 추가로: TOWERS, ENEMIES, DIFFICULTIES, MAPS. 화면 목록(맵 카드, 난이도 카드, 포탑 독, 웨이브 미리보기)은 데이터를 보고 자동 생성.
  - 새 공격 방식 → `attackHandlers[attack]` (fire/update/draw, 지속형은 tick/drawBeam, 대상 제한은 canTarget)
  - 새 적 특성 → `traitHandlers[trait]` (onSpawn/onHit/onDeath/onUpdate)
  - 그림이 없는 새 포탑/적은 기본 도형(`TOWER_ART._`, `ENEMY_ART._`)으로 그려진다. 전용 그림은 `TOWER_ART[id]`, `ENEMY_ART[id]`에 추가.

## 화면과 좌표
- 논리 해상도 1280x720. 모든 좌표·크기·속도(px, px/s)는 이 기준.
- `#stage`(1280x720)를 CSS scale로 창에 맞춤(16:9 레터박스). 캔버스 backing = 표시 크기 x devicePixelRatio, `ctx.setTransform`으로 논리 좌표에 그림.
- 캔버스에는 게임 월드만(맵, 포탑, 적, 탄, 이펙트, 피해 숫자). 그 밖의 글자·메뉴·HUD·팝업·결과는 `#ui` HTML 레이어.
- 폰트: 한글 "IBM Plex Sans KR", 숫자/영문 제목 "Chakra Petch"(tabular-nums). 960x540에서 0.75배가 되므로 UI 글자는 논리 18px 이상.
- 위 64px, 아래 104px는 HUD 영역. 경로와 패드는 그 바깥.

## 맵
- `paths`: 꺾이는 점 목록 → centripetal Catmull-Rom 곡선. 두 번째 이후 경로가 paths[0]의 점에서 끝나면 거기서부터 paths[0]을 따라간다.
- 건설 패드(`pads`)는 런타임에 계산하지 않는다. 경로를 바꾸면 `node tools/gen-pads.js`로 다시 생성(시드 12345, 규칙은 index.html의 `genPads`).
  - 규칙: 경로 중심선에서 80~150px, 패드 간격 100px 이상, 화면 끝·HUD에서 40px 이상(패드 가장자리 기준), 반응로에서 110px 이상.
  - 16개가 안 나오면 최소 거리만 80→70→60→58로 낮춘다(보이드 게이트는 차선 간격이 120px이라 이 완화가 적용됨).
- 배경은 맵 시작 시 오프스크린에 굽고(그라디언트, 천체, 경로, 패드) 성운·별·암석·웜홀·화살표·포털·반응로만 매 프레임 그린다.

## 게임 규칙
- 한 판 = 웨이브 1 ~ `map.waves`. 포탑·크레딧·기지 HP는 끝까지 이어짐. 스테이지/별점 없음.
- 웨이브 n: 적 수 min(60, 8+floor(1.2n)), 2~4개 무리(무리마다 한 종류, 무리 간격 2초), shell ≤ 25%, stinger는 4~6마리 무리만, 새로 해금된 적은 첫 무리로 단독.
- HP 배율 1 + 0.12(n-1) + 0.004(n-1)² x 난이도 hpMul. 10의 배수 웨이브는 보스 웨이브(queen n/10마리, 맨 뒤).
- 클리어 보너스 30+4n. autoWave가 숫자면 카운트다운 후 자동 시작, 일찍 누르면 남은 초 x2 크레딧.
- 업그레이드 Lv1~4, 비용 기본가 x [0.7, 1.0, 1.5], 단계마다 damage x1.45, range +8%. 판매는 총액의 70%.
- 피해 max(1, damage - armor). beam은 장갑 무시. splash는 비행 적을 못 맞힘. 피격 시 0.08초 속도 x0.8(v0.1 해석 유지).
- 파티클 최대 400개.

## 조작
- 1~5 포탑 선택, Space 다음 웨이브, F 배속(x1/x2/x3), Esc 선택 취소 또는 메뉴, P 메뉴.
- 메뉴에서 [처음부터 다시]/[메인 화면으로]는 패널 안에서 한 번 더 확인(window.confirm 금지). 나가면 효과음 노드를 모두 멈춘다.
- 터치: 포탑을 고른 뒤 패드 첫 탭은 미리보기, 같은 패드 두 번째 탭이 설치.
- prefers-reduced-motion이면 화면 흔들림과 배경 흐름을 끈다.
