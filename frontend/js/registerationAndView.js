window.onUserRegisterFormSubmit = async function (e) {
  e.preventDefault();

  // Validation
  let valid = true;

  const fields = [
    { id: "username", errorId: "usernameError" },
    {
      id: "email",
      errorId: "emailError",
      validate: (value) => value.includes("@"),
    },
    { id: "firstName", errorId: "firstNameError" },
    { id: "lastName", errorId: "lastNameError" },
    { id: "dob", errorId: "dobError" },
    { id: "gender", errorId: "genderError", validate: (value) => value !== "" },
    { id: "city", errorId: "cityError" },
    { id: "state", errorId: "stateError" },
    { id: "zip", errorId: "zipError" },
    { id: "country", errorId: "countryError" },
    { id: "phoneNumbers", errorId: "phoneError" },
  ];

  fields.forEach(({ id, errorId, validate }) => {
    const field = document.getElementById(id);
    const value = field.value.trim();
    const isValid = validate ? validate(value) : value !== "";
    document.getElementById(errorId).style.display = isValid ? "none" : "block";
    if (!isValid) valid = false;
  });

  if (!valid) return;

  // Data payload
  const data = {
    username: username.value.trim(),
    email: email.value.toLowerCase().trim(),
    password: null,
    roles: [
      ...(document.getElementById("roleUser").checked ? ["user"] : []),
      ...(document.getElementById("roleAdmin").checked ? ["admin"] : []),
    ],
    personalInfo: {
      fullName: {
        first: document.getElementById("firstName").value,
        middle: document.getElementById("middleName").value,
        last: document.getElementById("lastName").value,
      },
      dob: document.getElementById("dob").value,
      gender: document.getElementById("gender").value,
      phoneNumbers: document
        .getElementById("phoneNumbers")
        .value.split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      address: {
        street: document.getElementById("street").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        zip: document.getElementById("zip").value,
        country: document.getElementById("country").value,
      },
      emergencyContact: {
        name: document.getElementById("emergencyName").value,
        relationship: document.getElementById("relationship").value,
        phone: document.getElementById("emergencyPhone").value,
      },
    },
  };

  // Submit
  const token = localStorage.getItem("authToken") || null;
  try {
    const res = await fetch(CONFIG.ENDPOINTS.REGISTER_USER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(data),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = username.value.trim() + "_credentials.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("User registered successfully! Credentials downloaded.");
      document.getElementById("registrationForm").reset();
    } else {
      alert(result.message || "Something went wrong.");
    }
  } catch (error) {
    alert("Error submitting form");
    console.error(error);
  }
};

window.getUnregisteredMembers = async function () {
  try {
    const token = localStorage.getItem("authToken") || null;
    const response = await fetch(CONFIG.ENDPOINTS.UNREGISTERED_USERS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const members = await response.json();
    const tableBody = document.getElementById("memberTableBody");

    tableBody.innerHTML = ""; // Clear existing rows
    members.forEach((member) => {
      const row = `
            <tr>
              <td>${member.fullName}</td>
              <td>${member.address || ""}</td>
              <td>${member.postalCode || ""}</td>
              <td>${member.phone || ""}</td>
              <td>${member.email}</td>
              <td>${member.membershipType}</td>
              <td>${member.agreedToCode ? "✅" : "❌"}</td>
              <td>${new Date(member.createdAt).toLocaleDateString()}</td>
            </tr>
          `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    document.getElementById("memberTableBody").innerHTML =
      '<tr><td colspan="9" class="text-danger">Failed to load members</td></tr>';
  }
};

window.getUsersList = async function () {
  try {
    const token = localStorage.getItem("authToken") || null;
    const response = await fetch(CONFIG.ENDPOINTS.ALL_USERS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const transformedUsers = await response.json();
    const tableBody = document.getElementById("userTableBody");

    tableBody.innerHTML = "";
    transformedUsers.forEach((user, index) => {
      const row = `
          <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.gender}</td>
            <td>${user.city}</td>
            <td>${user.status}</td>
            <td>${user.roles}</td>
            <td>${user.registeredOn}</td>
            <td>
              <button class="btn btn-outline-success btn-sm" onclick="window.viewUser('${user.id}')">
                View
              </button>
            </td>
          </tr>
        `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    document.getElementById("memberTableBody").innerHTML =
      '<tr><td colspan="9" class="text-danger">Failed to load members</td></tr>';
  }
};

window.viewUser = async function (userId) {
  try {
    const res = await fetch(CONFIG.ENDPOINTS.GET_USER_PROFILEBYID(userId), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    if (res.ok) {
      const userData = await res.json();
      fetch(`./pages/userregister.html`)
        .then((res) => res.text())
        .then((html) => {
          const mainSection = document.getElementById("main-section");
          if (mainSection) {
            mainSection.innerHTML = html;
            setTimeout(() => {
              addDataToForm(userData);
            });
          }
        });
    } else {
      alert("An error occurred.");
    }
  } catch (error) {
    alert("An error occurred.");
  }
};

function addDataToForm(userData) {
  if (userData) {
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user?.role?.includes("admin") || false;
    document.getElementById("username").value = userData.username || "";
    document.getElementById("email").value = userData.email || "";

    document.getElementById("firstName").value =
      userData.personalInfo?.fullName?.first || "";
    document.getElementById("middleName").value =
      userData.personalInfo?.fullName?.middle || "";
    document.getElementById("lastName").value =
      userData.personalInfo?.fullName?.last || "";

    document.getElementById("dob").value =
      userData.personalInfo?.dob?.split("T")[0] || "";
    document.getElementById("gender").value =
      userData.personalInfo?.gender || "";

    document.getElementById("street").value =
      userData.personalInfo?.address?.street || "";
    document.getElementById("city").value =
      userData.personalInfo?.address?.city || "";
    document.getElementById("state").value =
      userData.personalInfo?.address?.state || "";
    document.getElementById("zip").value =
      userData.personalInfo?.address?.zip || "";
    document.getElementById("country").value =
      userData.personalInfo?.address?.country || "";

    document.getElementById("phoneNumbers").value =
      (userData.personalInfo?.phoneNumbers || [])[0] || "";

    document.getElementById("emergencyName").value =
      userData.personalInfo?.emergencyContact?.name || "";
    document.getElementById("relationship").value =
      userData.personalInfo?.emergencyContact?.relationship || "";
    document.getElementById("emergencyPhone").value =
      userData.personalInfo?.emergencyContact?.phone || "";

    document.getElementById("roleUser").checked =
      userData.roles.includes("user");
    document.getElementById("roleAdmin").checked =
      userData.roles.includes("admin");

    if (!isAdmin) {
      makeFormReadOnly();
    }
  }
}
/*===loadUserToForm - Start===*/
window.loadUserToForm = async function () {
  try {
    const res = await fetch(CONFIG.ENDPOINTS.USER_PROFILE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    if (res.ok) {
      const userData = await res.json();
      addDataToForm(userData);
    } else {
      alert("An error occurred.");
    }
  } catch (error) {
    alert("An error occurred.");
  }
};

function makeFormReadOnly() {
  const form = document.getElementById("registrationForm");
  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.disabled = true;
  });

  form.querySelector("button[type='submit']").style.display = "none";
}
/*===loadUserToForm - End===*/

window.resetUserFrom = function () {
  const form = document.getElementById("registrationForm");
  form.reset();
  form.querySelector("button[type='submit']").style.display = "block";
};
