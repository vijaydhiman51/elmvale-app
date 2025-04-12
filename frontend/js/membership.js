window.onMembershipFormSubmit = async function (event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
  
    // Handle radio & checkbox manually
    data.membershipType =
      form.querySelector("input[name='membershipType']:checked")?.value || "";
    data.agreedToCode = document.getElementById("acceptConstitution").checked;
  
    clearErrors(form);
  
    if (validateMembershipForm(data)) return;
  
    try {
      const response = await fetch(
        CONFIG.ENDPOINTS.MEMBERSHIP_APPLY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
  
      if (response.ok) {
        // If response is a PDF blob, download it
        const contentType = response.headers.get("Content-Type");
        if (contentType?.includes("application/pdf")) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "Membership_Form.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          form.reset();
          alert("Form submitted and downloaded successfully!");
        } else {
          const result = await response.json();
          alert(result.message || "Form submitted successfully!");
        }
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.message || "Submission failed."));
      }
    } catch (err) {
      alert("Something went wrong: " + err.message);
    }
  };
  
  function clearErrors(form) {
    form
      .querySelectorAll(".is-invalid")
      .forEach((el) => el.classList.remove("is-invalid"));
    form
      .querySelectorAll(".invalid-feedback")
      .forEach((el) => (el.textContent = ""));
    document.getElementById("constitutionError").textContent = "";
  }
  
  function validateMembershipForm(data) {
    let hasError = false;
  
    function showError(id, message) {
      const field = document.getElementById(id);
      field.classList.add("is-invalid");
      field.nextElementSibling.textContent = message;
      hasError = true;
    }
  
    if (!data.fullName.trim()) showError("fullName", "Full Name is required.");
    if (!data.address.trim()) showError("address", "Address is required.");
    if (!data.postalCode.trim())
      showError("postalCode", "Postal Code is required.");
    if (!data.phone.trim()) showError("phone", "Phone number is required.");
    if (!data.email.trim()) showError("email", "Email is required.");
    if (!data.agreedToCode) {
      document.getElementById("constitutionError").textContent =
        "You must agree to the Constitution.";
      hasError = true;
    }
    if (!data.signature.trim()) showError("signature", "Signature is required.");
    if (!data.printedName.trim())
      showError("printedName", "Printed name is required.");
    if (!data.date.trim()) showError("date", "Date is required.");
  
    return hasError;
  }