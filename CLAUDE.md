# Capital Atlas

## 프로젝트 개요
자본시장의 인과구조를 시각화하는 인터랙티브 분석 플랫폼.
매크로 변수 → 섹터 → 밸류체인 → 종목을 하나의 그래프로 연결.
Sophia Atlas(인류 사상 인과지도)의 금융 버전.

**총괄 개발자 및 저작권자: 이찬희**

## 기술 스택
- Next.js 14 (App Router, Static Export)
- TypeScript strict mode
- Tailwind CSS (다크모드 기본)
- Three.js + react-three-fiber (3D 그래프)
- Recharts (재무 차트)
- Fuse.js (클라이언트 검색)
- Vercel 배포

## 핵심 규칙
- 모든 데이터는 src/data/ 아래 JSON으로 관리 (Phase 1~3은 정적)
- 컴포넌트는 src/components/ 아래, 페이지별로 하위 폴더 분류
- 다크모드 기본. 배경 #0A0A0F, 패널 #111827
- 폰트: Pretendard(한글), Inter(영문), JetBrains Mono(숫자)
- 상승=녹색(#10B981), 하락=적색(#EF4444)
- 노드 타입별 색상: macro=#06B6D4, sector=#8B5CF6, company=#34D399, report=#FB923C
- 모든 노드는 BaseNode 인터페이스를 확장
- 엣지는 반드시 direction, strength, mechanism 필드를 포함

## 4개 모듈
- Module A: 매크로 인과지도 (/graph, /macro)
- Module B: 밸류체인 지도 (/themes)
- Module C: 섹터 비교 엔진 (/sectors, /companies)
- Module D: 리서치 아카이브 (/research)

## 코딩 컨벤션
- 함수형 컴포넌트 + hooks
- named export 사용 (default export는 페이지만)
- 타입은 src/types/ 아래 별도 파일로 관리
- API 호출 함수는 src/lib/ 아래
- 커밋 메시지: type(scope): description (feat, fix, data, style, refactor)

## 금지 사항
- any 타입 사용 금지
- 인라인 스타일 금지 (Tailwind 사용)
- console.log 커밋 금지
- 하드코딩된 색상값 금지 (Tailwind config에서 관리)
