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

## What words? / 검색 기능
- 상단 내비게이션에 `Content` 페이지가 추가되어 있습니다.
- `Home`은 `Latest` 목록만 표시합니다.
- `Content` 페이지에서 `Search by word` + 최신순 글 목록을 제공합니다.
- 상단 내비게이션에 `What words?` 페이지가 추가되어 있습니다.
- `words` 페이지는 모든 포스트의 front matter `words`를 모아 단어 칩으로 표시합니다.
- 단어 칩 정렬 기준: **빈도 높은 순 우선, 동률은 가나다순**.
- 단어 칩 클릭 시 URL에 `?w=<단어>`가 반영되며, 해당 단어를 포함한 글 목록이 최신순으로 표시됩니다.
- 홈(`index`) 상단 검색 입력창에서 단어를 입력하면 실시간으로 관련 글 목록이 표시됩니다.
- 결과가 없으면 `해당 단어를 포함한 글이 없습니다` 메시지를 보여줍니다.

## 구현 구조
- `words.html`: 단어 인덱스/필터 UI
- `index.html`: 홈 검색 UI
- `_includes/posts-data-json.html`: `site.posts`를 JS용 JSON으로 노출
- `assets/js/main.js`: 단어 필터/검색 로직
- `assets/css/style.css`: 검색/칩 스타일
