const fallbackData = {
  profile: {
    login: "felprangel",
    name: "Felipe Rangel",
    bio: "Crio experiências digitais completas, combinando interfaces modernas com soluções escaláveis no back-end.",
    avatar_url: "https://avatars.githubusercontent.com/u/113402519?v=4",
    html_url: "https://github.com/felprangel",
    email: "contato@felpo.dev",
    socials: {
      linkedin: "https://www.linkedin.com/in/felipe-rangel-ribeiro-73a899251/",
      instagram: "https://www.instagram.com/felp_rangel",
    },
  },
  repos: {
    pomodoro: {
      name: "Pomodoro",
      description: "Aplicativo de produtividade baseado na técnica de pomodoro",
      language: "TypeScript",
      stargazers_count: 0,
      html_url: "https://github.com/felprangel/pomodoro",
    },
    bookmark: {
      name: "Bookmark",
      description: "Gerenciador de livros lidos e em processo de leitura.",
      language: "TypeScript",
      stargazers_count: 0,
      html_url: "https://github.com/felprangel/bookmark",
    },
    "bookmark-api": {
      name: "Bookmark API",
      description: "API REST utilizada pelo frontend do bookmark.",
      language: "PHP",
      stargazers_count: 0,
      html_url: "https://github.com/felprangel/bookmark-api",
    },
    "zebra-printer-simulator": {
      name: "Zebra Printer Simulator",
      description:
        "Simulador para testes de impressão e validação de etiquetas.",
      language: "JavaScript",
      stargazers_count: 0,
      html_url: "https://github.com/felprangel/zebra-printer-simulator",
    },
    "chip8-js": {
      name: "Chip-8 JS",
      description: "Emulador CHIP-8 na web",
      language: "JavaScript",
      stargazers_count: 0,
      html_url: "https://github.com/felprangel/chip8-js",
    },
    chip8: {
      name: "Chip-8",
      description: "Emulador CHIP-8 implementado em C",
      language: "C",
      stargazers_count: 0,
      html_url: "https://github.com/felprangel/chip8",
    },
  },
};

const repoOrder = [
  "pomodoro",
  "bookmark",
  "chip8-js",
  "zebra-printer-simulator",
  "bookmark-api",
  "chip8",
];

const profileSelectors = {
  name: "[data-name]",
  bio: "[data-bio]",
  avatar: "[data-avatar]",
  github: "[data-social-github]",
  linkedin: "[data-social-linkedin]",
  instagram: "[data-social-instagram]",
  email: "[data-social-email]",
};

function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal })
    .then((response) => {
      clearTimeout(timeout);
      return response;
    })
    .catch((error) => {
      clearTimeout(timeout);
      throw error;
    });
}

async function loadGithubProfile() {
  const response = await fetchWithTimeout(
    "https://api.github.com/users/felprangel",
  );
  if (!response.ok) {
    throw new Error("Failed to load profile");
  }
  return response.json();
}

async function loadRepo(repo) {
  const response = await fetchWithTimeout(
    `https://api.github.com/repos/felprangel/${repo}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to load repo ${repo}`);
  }
  return response.json();
}

function setIfExists(selector, value, attr) {
  const element = document.querySelector(selector);
  if (!element || !value) return;

  if (attr) {
    element.setAttribute(attr, value);
    return;
  }

  element.textContent = value;
}

function renderProfile(profile) {
  setIfExists(profileSelectors.name, profile.name || profile.login);
  setIfExists(profileSelectors.bio, profile.bio);
  setIfExists(profileSelectors.avatar, profile.avatar_url, "src");

  const avatarEl = document.querySelector(profileSelectors.avatar);
  if (avatarEl && (profile.name || profile.login)) {
    avatarEl.setAttribute("alt", `Avatar de ${profile.name || profile.login}`);
  }

  const githubUrl = profile.html_url || fallbackData.profile.html_url;
  setIfExists(profileSelectors.github, githubUrl, "href");

  const email = profile.email || fallbackData.profile.email;
  setIfExists(profileSelectors.email, email ? `mailto:${email}` : null, "href");

  const linkedin = fallbackData.profile.socials.linkedin;
  const instagram = fallbackData.profile.socials.instagram;
  setIfExists(profileSelectors.linkedin, linkedin, "href");
  setIfExists(profileSelectors.instagram, instagram, "href");
}

function renderRepos(reposByName) {
  repoOrder.forEach((repoName) => {
    const repo = reposByName[repoName];
    const card = document.querySelector(`[data-repo="${repoName}"]`);
    if (!card || !repo) return;

    const title = card.querySelector("h4");
    const description = card.querySelector("p");
    const tags = card.querySelectorAll(".tag");
    const link = card.querySelector(".github-btn");

    if (title) title.textContent = repo.name || title.textContent;
    if (description) {
      description.textContent = repo.description || description.textContent;
    }

    if (tags.length > 0 && repo.language) {
      tags[0].textContent = repo.language;
    }

    if (tags.length > 1) {
      const stars = repo.stargazers_count || 0;
      if (stars > 0) {
        tags[1].textContent = `⭐ ${stars}`;
        tags[1].style.display = "inline-flex";
      } else {
        tags[1].textContent = "";
        tags[1].style.display = "none";
      }
    }

    if (link && repo.html_url) {
      link.setAttribute("href", repo.html_url);
    }
  });
}

async function loadGithubData() {
  try {
    const [profile, ...repos] = await Promise.all([
      loadGithubProfile(),
      ...repoOrder.map((repo) => loadRepo(repo)),
    ]);

    const repoMap = repoOrder.reduce((acc, name, index) => {
      acc[name] = repos[index];
      return acc;
    }, {});

    renderProfile({ ...fallbackData.profile, ...profile });
    renderRepos({ ...fallbackData.repos, ...repoMap });
  } catch (error) {
    console.warn("Using fallback data.", error);
    renderProfile(fallbackData.profile);
    renderRepos(fallbackData.repos);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderProfile(fallbackData.profile);
  renderRepos(fallbackData.repos);
  loadGithubData();
});
