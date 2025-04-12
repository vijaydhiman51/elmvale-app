window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar-container");
  const mainPage = document.getElementById("main-page");
  if (navbar && mainPage) {
    if (this.window.scrollY === 0) {
      navbar.style.paddingTop = "50px";
    } else {
      navbar.style.paddingTop = "0px";
    }
  }
});

window.toggleForms = function () {
  const loginForm = document.getElementById("login-form");
  const verifyForm = document.getElementById("verify-form");
  const changepasswordform = document.getElementById("change-password-form");
  const messageBoxLogin = document.getElementById("messageLogin");
  const messageBoxVerify = document.getElementById("messageVerify");
  const formTitle = document.getElementById("form-title");
  const toggleLink = document.querySelector(".toggle-link");

  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    verifyForm.style.display = "none";
    changepasswordform.style.display = "none";
    formTitle.textContent = "User Login";
    toggleLink.textContent = "Forget Password?";
    messageBoxLogin.innerText = "";
    messageBoxLogin.classList.remove("text-success");
  } else {
    loginForm.style.display = "none";
    verifyForm.style.display = "block";
    formTitle.textContent = "Forget Password";
    toggleLink.textContent = "Back to Login";
    messageBoxVerify.innerText = "";
  }
};

window.onLoginFormSubmit = async function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const messageBoxLogin = document.getElementById("messageLogin");

  try {
    const res = await fetch(CONFIG.ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      messageBoxLogin.classList.remove("text-danger");
      messageBoxLogin.classList.add("text-success");
      messageBoxLogin.innerText = "Login successful!";
      if (data?.user?.isPasswordFresh) {
        alert("Please change temporary password.");
        setTimeout(
          () => window.NavigationChanged(null, "changepassword"),
          1000
        );
      } else setTimeout(() => (window.location.href = "index.html"), 1000);
    } else {
      messageBoxLogin.classList.remove("text-success");
      messageBoxLogin.classList.add("text-danger");
      messageBoxLogin.innerText = data.error || "Login failed.";
    }
  } catch (error) {
    messageBoxLogin.innerText = "An error occurred.";
  }
};

window.onVerifyFormSubmit = async function (e) {
  e.preventDefault();
  const username = document.getElementById("verifyusername").value;
  const email = document.getElementById("verifyemail").value;
  const tokenResult = document.getElementById("tokenResult");
  const changepasswordform = document.getElementById("change-password-form");
  const verifyForm = document.getElementById("verify-form");
  const messageBoxVerify = document.getElementById("messageVerify");
  const formTitle = document.getElementById("form-title");
  const toggleLink = document.querySelector(".toggle-link");

  try {
    const res = await fetch(CONFIG.ENDPOINTS.FORGET_PASSWORD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });
    const data = await res.json();
    if (res.ok) {
      tokenResult.innerText = `${data.resetToken}`;
      changepasswordform.style.display = "block";
      verifyForm.style.display = "none";
      formTitle.textContent = "Change Password";
      toggleLink.textContent = "Back to Login";
    } else {
      messageBoxVerify.innerText = "Verification failed!";
    }
  } catch (error) {
    messageBoxVerify.innerText = "An error occurred.";
  }
};

window.onResetPasswordFormSubmit = async function (e) {
  e.preventDefault();
  const newPassword = document.getElementById("newpassword").value;
  const verifypassword = document.getElementById("verifypassword").value;
  const token = document.getElementById("tokenResult").innerText;
  const messageChangePassword = document.getElementById(
    "messageChangePassword"
  );
  const loginForm = document.getElementById("login-form");
  const changepasswordform = document.getElementById("change-password-form");
  const formTitle = document.getElementById("form-title");
  const toggleLink = document.querySelector(".toggle-link");

  try {
    if (newPassword !== verifypassword) {
      messageChangePassword.innerText = "Passwords do not match!";
      return;
    }

    const res = await fetch(CONFIG.ENDPOINTS.RESET_PASSWORD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      setTimeout(() => {
        document.getElementById("tokenResult").innerText = "";
        changepasswordform.style.display = "none";
        loginForm.style.display = "block";
        formTitle.textContent = "User Login";
        toggleLink.textContent = "Forget Password";
        messageChangePassword.innerText = "";
      }, 1000);
      messageChangePassword.classList.remove("text-danger");
      messageChangePassword.classList.add("text-success");
      messageChangePassword.innerText = data.message;
    } else {
      messageChangePassword.classList.add("text-danger");
      messageChangePassword.innerText =
        "Error resetting password! " + data.message;
    }
  } catch (error) {
    messageChangePassword.classList.add("text-danger");
    messageChangePassword.innerText = "An error occurred.";
  }
};

window.onChangePasswordFormSubmit = async function (e) {
  e.preventDefault();
  const oldPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmNewPassword").value;
  const messageBoxChangePassword = document.getElementById(
    "messageChangePassword"
  );

  if (newPassword !== confirmPassword) {
    messageBoxChangePassword.classList.add("text-danger");
    messageBoxChangePassword.innerText = "New passwords do not match!";
    return;
  }

  try {
    const res = await fetch(CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (res.ok) {
      const user = JSON.parse(localStorage.getItem("user"));
      messageBoxChangePassword.classList.remove("text-danger");
      messageBoxChangePassword.classList.add("text-success");
      messageBoxChangePassword.innerText = "Password changed successfully!";
      if (user?.isPasswordFresh) {
        user.isPasswordFresh = false;
        localStorage.setItem("user", JSON.stringify(user));
        setTimeout(() => (window.location.href = "index.html"), 1000);
      }
    } else {
      const data = await res.json();
      messageBoxChangePassword.classList.add("text-danger");
      messageBoxChangePassword.innerText =
        data.error || "Failed to change password.";
    }
  } catch (error) {
    messageBoxChangePassword.classList.add("text-danger");
    messageBoxChangePassword.innerText = "An error occurred.";
  }
};
