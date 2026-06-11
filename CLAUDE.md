# 작업 규칙 (중요 — 반드시 준수)

## 이 앱은 운영 중인 서비스다
- Swap Board는 Brisbane Transport 드라이버들이 실제로 사용 중인 듀티 스왑 게시판이다.
- 배포 주소: https://ustarman.github.io/duty-swap-board-metro/
- `git push` → GitHub Actions가 자동 빌드 → **라이브 사이트에 바로 반영된다.**

## 변경 전 승인 규칙
1. **기존 파일을 수정하기 전에** 반드시 다음을 설명하고 승인을 받는다:
   - 어떤 파일을 수정하는지
   - 무엇이 어떻게 바뀌는지 (기존 동작과의 차이)
   - 라이브 사용자에게 미치는 영향
2. **git commit / git push는 별도 승인**을 받는다.
   - 코드 수정 승인 ≠ 배포 승인. 푸시 전에 반드시 다시 확인받는다.
3. **여러 작업을 묶어서 한 번에 승인받지 않는다.** 배포는 항상 개별 확인.
4. 읽기/조사/신규 파일 생성은 자유롭게 해도 된다 (기존 동작에 영향 없음).
5. Supabase 변경(테이블, RLS, 함수)도 적용 전 SQL을 보여주고 승인받는다.

## 기술 참고사항
- Node 22 필요 (Vite 8). deploy.yml의 node-version 변경 금지.
- deploy.yml 수정은 PAT workflow 권한이 없어 푸시 불가 → 사용자가 GitHub 웹에서 직접 수정해야 함.
- 빌드 환경변수(GitHub Secrets): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
  VITE_VAPID_PUBLIC_KEY — 새 VITE_ 변수 추가 시 deploy.yml에도 반드시 추가.
- 푸시 전 `npm run build`로 로컬 빌드 검증 필수.
- 푸시 알림: sw.js + usePushNotifications.js + Supabase Edge Function(send-push) 연동.
- 프리필 연동: PostDetail.jsx의 handleAccept가 URL 파라미터로 Duty Swap App의
  /screen1에 데이터를 전달함 (weekCommencing, weekType, driverA/B Name/Duty).
  이 파라미터 이름들은 두 앱 간 계약이므로 한쪽만 바꾸면 안 됨.
- PWA: manifest.json(타이틀 "Swap Board"), 홈화면 설치 지원.
