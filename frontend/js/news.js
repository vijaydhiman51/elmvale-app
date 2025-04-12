window.OnAddNews = async function (event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    await fetch(CONFIG.ENDPOINTS.NEWS_ADD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.ok) {
        document.getElementById("newsMessageBox").style.display = "block";
        setTimeout(() => {
          document.getElementById("newsMessageBox").style.display = "none";
        }, 2000);

        form.reset();
      } else {
        document.getElementById("newsEerrorBox").style.display = "block";
        setTimeout(() => {
          document.getElementById("newsEerrorBox").style.display = "none";
        }, 2000);
      }
    });
  } catch (err) {
    document.getElementById("newsEerrorBox").style.display = "block";
    setTimeout(() => {
      document.getElementById("newsEerrorBox").style.display = "none";
    }, 2000);
  }
};

window.getAllnews = async function () {
  try {
    const token = localStorage.getItem("authToken") || null;
    const response = await fetch(CONFIG.ENDPOINTS.NEWS_GET_ALL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const records = await response.json();
    const newsCarousel = document.getElementById("news-section-list");
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user?.role?.includes("admin") || false;

    newsCarousel.innerHTML = "";

    records.forEach((rec) => {
      newsCarousel.innerHTML += `                  
            <div class="col-md-6">
                <div class="card border-warning h-100 position-relative">
                 <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 delete-btn"  onclick="window.deleteNews(event)"
                              data-id="${
                                rec._id
                              }" title="Delete image" style="z-index: 2; display: ${
        isAdmin ? "block" : "none"
      };">
                                  <i class="fas fa-trash"></i>
                          </button>
                    <div class="card-body">
                        <h5 class="card-title">${rec.title}</h5>
                        <p>
                           ${rec.content}
                        </p>
                        <p><strong>Date:</strong> ${
                          new Date(rec.date).toISOString().split("T")[0]
                        }</p>
                    </div>
                </div>
            </div>
            `;
    });
  } catch (error) {
    console.error("Error fetching Images:", error);
    document.getElementById("news-section-list").innerHTML =
      '<tr><td colspan="9" class="text-danger">Failed to load Gallery!!</td></tr>';
  }
};

window.deleteNews = async function (e) {
  e.preventDefault();
  const id = e.target.closest(".delete-btn").getAttribute("data-id");
  const token = localStorage.getItem("authToken") || null;

  try {
    const response = await fetch(CONFIG.ENDPOINTS.NEWS_DELETE(id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Network response was not ok");
    getAllnews();
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};
