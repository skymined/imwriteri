(() => {
  const postsDataElement = document.getElementById("posts-data");
  if (!postsDataElement) {
    return;
  }

  let rawPosts = [];
  try {
    rawPosts = JSON.parse(postsDataElement.textContent || "[]");
  } catch (_error) {
    return;
  }

  const normalizeWord = (value) => String(value || "").trim().normalize("NFC");

  const posts = rawPosts
    .map((post) => {
      const words = Array.isArray(post.words)
        ? [...new Set(post.words.map(normalizeWord).filter(Boolean))]
        : [];

      return {
        title: String(post.title || "").trim(),
        url: String(post.url || "").trim(),
        date: String(post.date || "").trim(),
        timestamp: Number(post.timestamp || 0),
        words,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const renderPostList = (container, items) => {
    container.innerHTML = "";

    items.forEach((post) => {
      const listItem = document.createElement("li");
      listItem.className = "neo-panel post-item";

      const link = document.createElement("a");
      link.href = post.url;

      const time = document.createElement("time");
      time.dateTime = post.date;
      time.textContent = post.date;

      const title = document.createElement("span");
      title.className = "post-title";
      title.textContent = post.title;

      link.appendChild(time);
      link.appendChild(title);

      if (post.words.length > 0) {
        const small = document.createElement("small");
        small.textContent = post.words.join(", ");
        link.appendChild(small);
      }

      listItem.appendChild(link);
      container.appendChild(listItem);
    });
  };

  const searchInput = document.getElementById("word-search-input");
  const searchResults = document.getElementById("word-search-results");
  const searchEmpty = document.getElementById("word-search-empty");
  if (searchInput && searchResults && searchEmpty) {
    const params = new URLSearchParams(window.location.search);

    const applySearch = () => {
      const query = normalizeWord(searchInput.value);
      if (!query) {
        searchResults.innerHTML = "";
        searchResults.hidden = true;
        searchEmpty.hidden = true;
        return;
      }

      const matched = posts.filter((post) =>
        post.words.some((word) => word.includes(query)),
      );
      renderPostList(searchResults, matched);

      searchResults.hidden = matched.length === 0;
      searchEmpty.hidden = matched.length !== 0;
    };

    searchInput.addEventListener("input", applySearch);

    const initialWord = normalizeWord(params.get("w"));
    if (initialWord) {
      searchInput.value = initialWord;
      applySearch();
    }
  }

  const chipGrid = document.getElementById("word-chip-grid");
  const selectedWordLabel = document.getElementById("selected-word-label");
  const wordResults = document.getElementById("word-results");
  const wordResultsEmpty = document.getElementById("word-results-empty");

  if (chipGrid && selectedWordLabel && wordResults && wordResultsEmpty) {
    const frequency = new Map();

    posts.forEach((post) => {
      post.words.forEach((word) => {
        frequency.set(word, (frequency.get(word) || 0) + 1);
      });
    });

    const words = [...frequency.entries()]
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }
        return a[0].localeCompare(b[0], "ko");
      })
      .map(([word, count]) => ({ word, count }));

    const updateActiveChip = (selectedWord) => {
      chipGrid.querySelectorAll("button[data-word]").forEach((button) => {
        const isActive = button.getAttribute("data-word") === selectedWord;
        button.classList.toggle("active", isActive);
      });
    };

    const setWordFilter = (word) => {
      const selected = normalizeWord(word);
      if (!selected || !frequency.has(selected)) {
        selectedWordLabel.textContent = "단어를 선택하면 결과가 표시됩니다";
        wordResults.innerHTML = "";
        wordResultsEmpty.textContent = "단어를 선택하면 해당 글 목록이 나타납니다";
        wordResultsEmpty.hidden = false;
        updateActiveChip("");
        return;
      }

      const matched = posts.filter((post) => post.words.includes(selected));
      renderPostList(wordResults, matched);

      selectedWordLabel.textContent = `"${selected}" 포함 글 (${matched.length})`;
      wordResultsEmpty.hidden = matched.length !== 0;
      wordResultsEmpty.textContent = "해당 단어를 포함한 글이 없습니다";
      updateActiveChip(selected);
    };

    words.forEach(({ word, count }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "word-chip";
      button.setAttribute("data-word", word);

      const wordText = document.createElement("span");
      wordText.className = "word-chip-text";
      wordText.textContent = word;

      const countText = document.createElement("span");
      countText.className = "word-chip-count";
      countText.textContent = String(count);

      button.appendChild(wordText);
      button.appendChild(countText);

      button.addEventListener("click", () => {
        const params = new URLSearchParams(window.location.search);
        params.set("w", word);
        const nextQuery = params.toString();
        const nextUrl = nextQuery
          ? `${window.location.pathname}?${nextQuery}`
          : window.location.pathname;
        window.history.replaceState({}, "", nextUrl);
        setWordFilter(word);
      });

      chipGrid.appendChild(button);
    });

    const initialWord = normalizeWord(new URLSearchParams(window.location.search).get("w"));
    setWordFilter(initialWord);
  }
})();
