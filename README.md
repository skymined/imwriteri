# IMWRITERI GitHub Pages Blog

모노톤 기반의 Jekyll 블로그입니다. 랜딩(타이핑 모션)과 최신 글 목록을 한 페이지에서 제공합니다.

## Pages 활성화
1. GitHub 저장소 `Settings`로 이동
2. `Pages` 메뉴 선택
3. `Source`를 `Deploy from a branch`로 선택
4. `Branch`는 `main`, 폴더는 `/(root)`로 설정

## baseurl 설정 가이드
`_config.yml`의 `baseurl`은 Pages 유형에 따라 다릅니다.
- 사용자/조직 페이지(`username.github.io`): `baseurl: ""`
- 프로젝트 페이지(예: `username.github.io/imwriteri`): `baseurl: "/imwriteri"`

## 로컬 확인 (선택)
```bash
bundle exec jekyll serve
```

## 검증 절차
1. 파일 커밋 후 `main`에 푸시
2. GitHub `Pages` 또는 `Actions`에서 빌드 성공 확인
3. 사이트에서 다음 항목 확인
   - 상단 sticky 헤더와 `IMWRITERI`
   - 반응형 hero 섹션
   - 타이핑 모션 동작(모바일 포함)
   - 스크롤 시 최신 글 목록이 최신순 노출
4. `_posts`에 새 글 추가 후 목록 갱신 확인
