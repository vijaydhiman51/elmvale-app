const filePaths = {
  main: { css: true, js: false },
  about: { css: false, js: false },
  events: { css: false, js: false },
  bursaries: { css: false, js: false },
  download: { css: false, js: false },
  contact: { css: false, js: false },
  members: { css: false, js: false },
  news: { css: false, js: true, jsfunc: "getAllnews" },
  gallery: { css: false, js: true, jsfunc: "getAllImages" },
  login: { css: true, js: false },
  membership: { css: false, js: false },
  userregister: { css: true, js: true },
  changepassword: { css: true, js: false },
  membershiplist: { css: true, js: true, jsfunc: "getUnregisteredMembers" },
  userslist: { css: true, js: true, jsfunc: "getUsersList" },
  photoupload: { css: false, js: false },
  newsadd: { css: false, js: false },
};

document.addEventListener("DOMContentLoaded", () => {
  window.handleNavbar();
  window.NavigationChanged();
});

window.handleNavbar = function () {
  fetch("./utils/navbar.html")
    .then((res) => res.text())
    .then((html) => {
      const container = document.getElementById("navbar-container");
      if (container) {
        container.innerHTML = html;

        const currentPage = location.pathname.split("/").pop() || "index.html";

        if (currentPage === "index.html") {
          const homeLink = document.getElementById("nav-main");
          if (homeLink?.closest("li")) {
            homeLink.closest("li").style.display = "none";
          }
        }

        const token = localStorage.getItem("authToken");
        const user = JSON.parse(localStorage.getItem("user"));

        const navbar = document.querySelector(".navbar-nav");
        navbar.addEventListener("click", window.NavigationChanged);

        const loginLink = navbar.querySelector("a[id='nav-login']");
        if (token && user) {
          if (loginLink) loginLink.closest("li").remove();

          const newsLink = `<li class="nav-item"><a class="nav-link" id="nav-news" href="#">News</a></li>`;
          const galleryLink = `<li class="nav-item"><a class="nav-link" id="nav-gallery" href="#">Gallery</a></li>`;

          navbar.insertAdjacentHTML("beforeend", newsLink);
          navbar.insertAdjacentHTML("beforeend", galleryLink);

          const name = `${user.name.first} ${user.name.last}`;
          const userDropdown = `
               <li class="nav-item dropdown">
                 <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                   ${name}
                 </a>
                 <ul class="dropdown-menu dropdown-menu-end" id="userDropdown-list" aria-labelledby="userDropdown">
                   ${generateUserOptions(user)}
                   <li><a class="dropdown-item" id="nav-changepassword" href="#">Change Password</a></li>
                   <li><hr class="dropdown-divider"></li>
                   <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Sign Out</a></li>
                 </ul>
               </li>
             `;
          navbar.insertAdjacentHTML("beforeend", userDropdown);
        }

        document.addEventListener("click", function (e) {
          if (e.target.id === "logoutBtn") {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            window.handleNavbar();
          }
        });
      }
    });
};

function generateUserOptions(user) {
  const options = [
    {
      name: "Profile",
      id: "nav-userregister",
      type: ["user", "admin"],
      method: JSON.stringify({
        user: "loadUserToForm",
        admin: "loadUserToForm",
      }),
    },
    {
      name: "Users",
      id: "nav-userslist",
      type: ["admin"],
    },
    {
      name: "Upload Images",
      id: "nav-photoupload",
      type: ["admin"],
    },
    {
      name: "Add News",
      id: "nav-newsadd",
      type: ["admin"],
    },
    {
      name: "User Registration",
      id: "nav-userregister",
      type: ["admin"],
      method: JSON.stringify({ admin: "resetUserFrom" }),
    },
    {
      name: "Unregistered Members",
      id: "nav-membershiplist",
      type: ["admin"],
    },
  ];
  let menuList = "";
  options.forEach((option) => {
    if (user?.role?.some((item) => option.type.includes(item))) {
      let met = "";
      if (option.method) {
        met = `data-mthodInfo=${option.method}`;
      }
      menuList += `<li><a class="dropdown-item" id="${option.id}" href="#" ${met}>${option.name}</a></li>`;
    }
  });

  return menuList;
}

/*===Nav Change Area - Start===*/
window.NavigationChanged = function (event, fallback = "main") {
  const mainSection = document.getElementById("main-section");
  const navbar = document.getElementById("navbar-container");
  const privCSS = document.querySelector('link[data-iscustom="true"]');
  const homeLink = document.getElementById("nav-main");

  resetActiveLinks(navbar);

  const link = event?.target.closest("a");
  if ((link || fallback) && link?.id !== "userDropdown") {
    const pageName = link?.id.split("-")[1] || fallback;
    loadPageContent(event, pageName, navbar, mainSection, privCSS, homeLink);
  }
};

function resetActiveLinks(navbar) {
  navbar
    .querySelectorAll(".nav-link.active, .dropdown-item.active")
    .forEach((link) => {
      link.classList.remove("active");
    });
}

function loadPageContent(
  event,
  pageName,
  navbar,
  mainSection,
  privCSS,
  homeLink
) {
  fetch(`./pages/${pageName}.html`)
    .then((res) => res.text())
    .then((html) => {
      if (navbar && mainSection) {
        adjustNavbarForPage(pageName, navbar, homeLink);
        updateCustomCSS(pageName, privCSS);
        mainSection.innerHTML = html;
        executePageSpecificJS(pageName, event);
        resetActiveLinks(navbar);
      }
    });
}

function adjustNavbarForPage(pageName, navbar, homeLink) {
  if (pageName != "main") {
    navbar.style.paddingTop = "0px";
    if (homeLink?.closest("li")) {
      homeLink.closest("li").style.display = "block";
    }
  } else if (homeLink?.closest("li")) {
    navbar.style.paddingTop = "50px";
    homeLink.closest("li").style.display = "none";
  }
  if (!(pageName === "main" || pageName === "userDropdown")) {
    navbar.querySelector(`#nav-${pageName}`)?.classList.add("active");
  }
}

function updateCustomCSS(pageName, privCSS) {
  if (privCSS) {
    privCSS.remove();
  }
  if (filePaths[pageName].css) {
    const style = document.createElement("link");
    style.setAttribute("rel", "stylesheet");
    style.setAttribute("href", `./css/pages/${pageName}.css`);
    style.setAttribute("data-iscustom", "true");
    document.head.appendChild(style);
  }
}

function executePageSpecificJS(pageName, event = null) {
  if (filePaths[pageName].js) {
    if (
      filePaths[pageName].jsfunc &&
      typeof window[filePaths[pageName].jsfunc] === "function"
    ) {
      window[filePaths[pageName].jsfunc]();
    } else {
      const mthodsInfo = event?.target
        ?.closest("a")
        ?.getAttribute("data-mthodInfo");
      if (mthodsInfo) {
        const mthod = JSON.parse(mthodsInfo);
        const user = JSON.parse(localStorage.getItem("user"));
        if (
          user.role.includes("admin") &&
          mthod["admin"] &&
          typeof window[mthod.admin] === "function"
        ) {
          window[mthod.admin]();
        } else if (mthod["user"] && typeof window[mthod.user] === "function") {
          window[mthod.user]();
        }
      }
    }
  }
}
/*===Nav Change Area - End===*/
