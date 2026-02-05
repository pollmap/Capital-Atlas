# Capital Atlas

**자본시장의 인과구조를 시각화하는 인터랙티브 분석 플랫폼**

> "금리가 오르면 뭐가 오르고 뭐가 내리는가?" — 예측하지 않습니다. 구조를 보여줍니다.

## Overview

Capital Atlas는 매크로 변수 간 인과관계, 산업 밸류체인, 섹터 비교를 하나의 그래프로 연결하는 인터랙티브 분석 플랫폼입니다. 7대 매크로 투자자(드러켄밀러, 시타델, 애크먼, 막스, 성상현, VIP, 르네상스)의 프레임워크를 분석하여 핵심 매크로 변수와 인과관계를 도출했습니다.

**시리즈:** [Sophia Atlas](https://sophia-atlas.vercel.app) (인류 사상) → **Capital Atlas** (자본시장) → 향후 확장

## 4 Modules

| Module | Description | Route |
|--------|------------|-------|
| A. 매크로 인과지도 | 3D 인터랙티브 그래프로 매크로 변수 간 인과관계 탐색 | `/graph` |
| B. 밸류체인 지도 | 테마별 상류→하류 산업 구조 시각화 | `/themes` |
| C. 섹터 비교 엔진 | 동일 섹터 내 기업 정량 비교 분석 | `/sectors` |
| D. 리서치 아카이브 | CUFA 리서치 리포트 퍼블리싱 (Phase 3) | `/research` |

## Tech Stack

- **Framework:** Next.js 14 (App Router, Static Export)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (dark mode default)
- **3D Graph:** Three.js + react-three-fiber
- **Charts:** Recharts
- **Search:** Fuse.js
- **Deployment:** Vercel

## Data

- 36+ 매크로 변수 (통화정책, 환율, 채권, 원자재, 거시지표, 자금흐름, 시장지수)
- 30+ 인과관계 엣지 (방향, 강도, 시차, 메커니즘)
- 5 투자 테마 (AI 데이터센터, 원전 르네상스, K-방산, 조선·해운, 2차전지)
- 16+ 기업 데이터 (재무제표, 밸류에이션)
- 7 섹터 비교

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # Static export to /out
```

## Author

**이찬희** — 총괄 개발자 & 저작권자

CUFA 투자연구회

## License

MIT
