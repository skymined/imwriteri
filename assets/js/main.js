(() => {
  const normalizeWord = (value) => String(value || "").trim().normalize("NFC");
  const shouldShowTags = Boolean(window.IMWRITERI_SHOW_TAGS);
  const likesEnabled = Boolean(window.IMWRITERI_LIKES_ENABLED);
  const configuredLikesNamespace = String(window.IMWRITERI_LIKES_NAMESPACE || "").trim();
  const likesApiBase = "https://api.counterapi.dev/v1";

  const parseInlinePostsFallback = () => {
    const postsDataElement = document.getElementById("posts-data");
    if (!postsDataElement) {
      return [];
    }
    try {
      const parsed = JSON.parse(postsDataElement.textContent || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  };

  const resolvePostsUrl = () => {
    if (typeof window.IMWRITERI_POSTS_URL === "string" && window.IMWRITERI_POSTS_URL.trim()) {
      return window.IMWRITERI_POSTS_URL.trim();
    }
    return "/assets/posts.json";
  };

  const loadRawPosts = async () => {
    const url = resolvePostsUrl();
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const parsed = await response.json();
      if (!Array.isArray(parsed)) {
        throw new Error("posts.json is not an array");
      }
      return parsed;
    } catch (_error) {
      return parseInlinePostsFallback();
    }
  };

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

      if (shouldShowTags && post.tags.length > 0) {
        const smallTags = document.createElement("small");
        smallTags.textContent = `tags: ${post.tags.join(", ")}`;
        link.appendChild(smallTags);
      }

      if (post.words.length > 0) {
        const small = document.createElement("small");
        small.textContent = post.words.join(", ");
        link.appendChild(small);
      }

      listItem.appendChild(link);
      container.appendChild(listItem);
    });
  };

  const attachSearch = (posts) => {
    const searchInput = document.getElementById("word-search-input");
    const searchResults = document.getElementById("word-search-results");
    const searchEmpty = document.getElementById("word-search-empty");
    if (!searchInput || !searchResults || !searchEmpty) {
      return;
    }

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
  };

  const attachWordChips = (posts) => {
    const chipGrid = document.getElementById("word-chip-grid");
    const selectedWordLabel = document.getElementById("selected-word-label");
    const wordResults = document.getElementById("word-results");
    const wordResultsEmpty = document.getElementById("word-results-empty");

    if (!chipGrid || !selectedWordLabel || !wordResults || !wordResultsEmpty) {
      return;
    }

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
  };

  const sanitizeNamespacePart = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "");

  const resolveLikesNamespace = () => {
    if (configuredLikesNamespace) {
      return configuredLikesNamespace;
    }

    const hostPart = sanitizeNamespacePart(window.location.hostname || "local");
    return `imwriteri-likes-${hostPart || "local"}`;
  };

  const resolveStorageKey = (namespace, key) => `imwriteri:likes:v1:${namespace}:${key}`;

  const parseLikeValue = (payload) => {
    if (!payload || typeof payload.count !== "number" || Number.isNaN(payload.count)) {
      return 0;
    }
    return payload.count;
  };

  const getLikeCount = async (namespace, key) => {
    const url = `${likesApiBase}/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      if (response.status === 400 || response.status === 404) {
        return 0;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    return parseLikeValue(payload);
  };

  const hitLikeCount = async (namespace, key) => {
    const url = `${likesApiBase}/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}/up`;
    const response = await fetch(url, { method: "GET", cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    return parseLikeValue(payload);
  };

  const attachLikeWidgets = async () => {
    if (!likesEnabled) {
      return;
    }

    const widgets = document.querySelectorAll("[data-like-widget]");
    if (widgets.length === 0) {
      return;
    }

    const namespace = resolveLikesNamespace();

    widgets.forEach((widget) => {
      const key = String(widget.getAttribute("data-like-key") || "").trim();
      const button = widget.querySelector("[data-like-button]");
      const countLabel = widget.querySelector("[data-like-count]");
      const statusLabel = widget.querySelector("[data-like-status]");

      if (!key || !button || !countLabel || !statusLabel) {
        return;
      }

      const storageKey = resolveStorageKey(namespace, key);
      let liked = window.localStorage.getItem(storageKey) === "1";
      let busy = false;

      const setBusy = (value) => {
        busy = value;
        button.disabled = value || liked;
      };

      const setStatus = (message) => {
        statusLabel.hidden = !message;
        statusLabel.textContent = message;
      };

      const setCount = (value) => {
        countLabel.textContent = String(Math.max(0, Number(value) || 0));
      };

      if (liked) {
        button.disabled = true;
        button.textContent = "좋아요 완료";
      }

      setStatus("");

      getLikeCount(namespace, key)
        .then((value) => {
          setCount(value);
        })
        .catch(() => {
          setStatus("좋아요 수를 불러오지 못했습니다.");
        });

      button.addEventListener("click", async () => {
        if (busy || liked) {
          return;
        }

        setBusy(true);
        setStatus("저장 중...");

        try {
          const value = await hitLikeCount(namespace, key);
          setCount(value);
          window.localStorage.setItem(storageKey, "1");
          liked = true;
          button.textContent = "좋아요 완료";
          button.disabled = true;
          setStatus("좋아요가 반영되었습니다.");
        } catch (_error) {
          setStatus("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
          setBusy(false);
        }
      });
    });
  };

  const normalizePosts = (rawPosts) =>
    rawPosts
      .map((post) => {
        const words = Array.isArray(post.words)
          ? [...new Set(post.words.map(normalizeWord).filter(Boolean))]
          : [];
        const tags = Array.isArray(post.tags)
          ? [...new Set(post.tags.map(normalizeWord).filter(Boolean))]
          : [];

        return {
          title: String(post.title || "").trim(),
          url: String(post.url || "").trim(),
          date: String(post.date || "").trim(),
          timestamp: Number(post.timestamp || 0),
          tags,
          words,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

  (async () => {
    await attachLikeWidgets();

    const rawPosts = await loadRawPosts();
    const posts = normalizePosts(rawPosts);
    if (posts.length === 0) {
      return;
    }

    attachSearch(posts);
    attachWordChips(posts);
  })();
})();
