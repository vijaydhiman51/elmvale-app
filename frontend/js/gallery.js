window.onImageUpload = async function (e) {
  e.preventDefault();

  const form = e.target;
  const description = form.description.value.trim();
  const file = form.photo.files[0];
  const ext = file.name.split(".").pop();
  const guidName = generateGUID() + "." + ext;

  try {
    EXIF.getData(file, async function () {
      const orientation = EXIF.getTag(this, "Orientation");
      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", new File([file], guidName, { type: file.type }));
      formData.append("orientation", orientation || 1);

      const response = await fetch(CONFIG.ENDPOINTS.UPLOAD_IMAGE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      if (response.ok) {
        document.getElementById("messageBox").style.display = "block";
        setTimeout(() => {
          document.getElementById("messageBox").style.display = "none";
          const preview = document.getElementById("preview");
          preview.src = "";
          preview.style.display = "none";
        }, 2000);

        form.reset();
      } else {
        document.getElementById("errorBox").style.display = "block";
        setTimeout(() => {
          document.getElementById("errorBox").style.display = "none";
        }, 2000);
      }
    });
  } catch (err) {
    document.getElementById("errorBox").style.display = "block";
    setTimeout(() => {
      document.getElementById("errorBox").style.display = "none";
    }, 2000);
  }
};

function generateGUID() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

window.onImageUploadChange = function (event) {
  const preview = document.getElementById("preview");
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
  ];
  const fileInput = document.querySelector('input[name="photo"]');
  event.preventDefault();
  const file = fileInput.files[0];

  if (file && allowedTypes.includes(file.type)) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none";
    fileInput.value = ""; // clear invalid file
    alert("Only image files are allowed!");
  }
};

window.getAllImages = async function () {
  try {
    const token = localStorage.getItem("authToken") || null;
    const response = await fetch(CONFIG.ENDPOINTS.ALL_IMAGES, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const records = await response.json();
    const imageCarousel = document.getElementById("gallery-image-carousel");
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user?.role?.includes("admin") || false;

    imageCarousel.innerHTML = "";

    records.forEach((rec) => {
      imageCarousel.innerHTML += `
          <div class="col-6 col-md-4 col-lg-3">
                  <div class="card border-0 shadow-sm h-100 position-relative">
                      <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 delete-btn"  onclick="window.deleteImage(event)"
                          data-id="${
                            rec._id
                          }" title="Delete image" style="z-index: 2; display: ${ isAdmin ? "block" : "none" };">
                              <i class="fas fa-trash"></i>
                      </button>
                      <a href="${CONFIG.ENDPOINTS.GET_SINGLE_IMAGE(
                        rec.photoId
                      )}" data-lightbox="gallery"
                          data-title="${rec.description}" target="_blank">
                          <img src="${CONFIG.ENDPOINTS.GET_SINGLE_IMAGE(
                            rec.photoId
                          )}" class="card-img-top"
                              alt="${rec.description}" />
                      </a>
                      <div class="card-body p-2 text-center">
                          <small>${rec.description}</small>
                      </div>
                  </div>
              </div>
        `;
    });
  } catch (error) {
    console.error("Error fetching Images:", error);
    document.getElementById("gallery-image-carousel").innerHTML =
      '<tr><td colspan="9" class="text-danger">Failed to load Gallery!!</td></tr>';
  }
};

window.deleteImage = async function (e) {
  e.preventDefault();
  const imageId = e.target.closest(".delete-btn").getAttribute('data-id');
  const token = localStorage.getItem("authToken") || null;

  try {
    const response = await fetch(CONFIG.ENDPOINTS.DELETE_IMAGE(imageId), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Network response was not ok");
    getAllImages();
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};
