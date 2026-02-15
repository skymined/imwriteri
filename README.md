# IMWRITERI

IMWRITERI는 AI가 얼마나 글을 잘 쓸 수 있는지 확인해보는 프로젝트입니다.
매일 5개의 글자(또는 단어)를 뽑아, 다양한 분야/분위기/category 조건을 AI에 던져 글을 쓰게 합니다.
수필, 이야기, 시적 문장까지 형식을 넘나들며 결과를 기록합니다.

## 방문자 통계(Analytics)
GA4를 사용할 수 있게 연결되어 있습니다.

1. `_config.yml`에서 `analytics.ga4_measurement_id`에 측정 ID를 넣습니다.  
   예: `G-XXXXXXXXXX`
2. 배포 후 GA4 콘솔에서 확인합니다.
   - 당일/실시간: `Reports > Realtime`
   - 일별/누적: `Reports > Engagement > Pages and screens` (날짜 범위 확장)

## 좋아요 기능
포스트 상세 페이지에 좋아요 버튼이 추가되어 있습니다.

- 저장 방식: CounterAPI + 브라우저 `localStorage`
- 기본 동작: 같은 브라우저에서는 글당 1회 좋아요
- 설정: `_config.yml`
  - `likes.enabled`: 기능 on/off
  - `likes.namespace`: 비우면 호스트명 기준으로 자동 분리

## 브랜치에서 확인하는 방법
### 1) 로컬 확인
1. 작업 브랜치 체크아웃
2. 사이트 실행 (예: Jekyll 환경이면 `bundle exec jekyll serve`)
3. 글 상세 페이지에서 좋아요 버튼 클릭
4. 숫자가 증가하고 버튼이 `좋아요 완료`로 바뀌면 정상

참고: 로컬은 `localhost` 네임스페이스를 쓰기 때문에 운영 카운트와 분리됩니다.

### 2) 원격 브랜치 확인
1. 브랜치를 원격에 push
2. Preview URL(예: Netlify/Vercel 또는 별도 브랜치 배포)에서 접속
3. GA4 `Realtime`에서 본인 접속이 잡히는지 확인
4. 좋아요 클릭 후 카운트 증가 확인

참고: `likes.namespace`를 비워두면 브랜치/프리뷰 도메인별로 자동 분리되어 운영 데이터와 섞이지 않습니다.

## Contact
관련 문의사항이나 제안(suggestion)은 트위터 [@imawriteri](https://x.com/imawriteri)로 연락해주세요.

## Copyright
Copyright (c) 2026 IMWRITERI. All rights reserved.
이 저장소와 사이트의 게시 콘텐츠(텍스트, 이미지 등)의 권리는 IMWRITERI에 있습니다.
