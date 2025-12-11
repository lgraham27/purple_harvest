document.addEventListener("DOMContentLoaded", () => {
  // --- Seamless Tab Switching ---
  const navButtons = document.querySelectorAll("nav button, nav a");
  navButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const target = btn.getAttribute("onclick") || btn.getAttribute("href");
      if (target) {
        fetch(target.replace("location.href=", "").replace(/['"]/g, ""))
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const newContent = doc.querySelector("main");
            const currentMain = document.querySelector("main");
            if (newContent && currentMain) {
              currentMain.innerHTML = newContent.innerHTML;
              window.history.pushState({}, "", target);
            }
          })
          .catch(err => console.error("Error loading tab:", err));
      }
    });
  });

  // --- Utility: create item with delete button ---
  function createItemElement(text, list, storageKey, savedArray) {
    const wrapper = document.createElement("div");
    wrapper.className = "item";

    const p = document.createElement("p");
    p.textContent = text;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";

    delBtn.addEventListener("click", () => {
      showConfirmModal(() => {
        list.removeChild(wrapper);
        const updated = savedArray.filter(c => c !== text);
        localStorage.setItem(storageKey, JSON.stringify(updated));
      });
    });

    wrapper.appendChild(p);
    wrapper.appendChild(delBtn);
    list.appendChild(wrapper);
  }

  // --- Confirmation Modal with fade-out ---
  function showConfirmModal(onConfirm) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    modal.innerHTML = `
      <div class="modal">
        <h2>⚡ Confirm Deletion</h2>
        <p>Are you sure you want to banish this item from the harvest?</p>
        <div class="modal-actions">
          <button class="confirm-btn">Yes</button>
          <button class="cancel-btn">No</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
      modal.classList.add("fade-out");
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      }, 500); // match fade-out duration
    };

    modal.querySelector(".confirm-btn").addEventListener("click", () => {
      onConfirm();
      closeModal();
    });

    modal.querySelector(".cancel-btn").addEventListener("click", () => {
      closeModal();
    });
  }

  // --- Stream Comments ---
  const commentForm = document.querySelector("#comments form");
  const commentList = document.querySelector("#commentList");
  if (commentForm && commentList) {
    const savedComments = JSON.parse(localStorage.getItem("streamComments")) || [];
    savedComments.forEach(c => createItemElement(c, commentList, "streamComments", savedComments));

    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const commentBox = document.querySelector("#commentBox");
      if (commentBox.value.trim() !== "") {
        const newComment = commentBox.value.trim();
        savedComments.push(newComment);
        localStorage.setItem("streamComments", JSON.stringify(savedComments));
        createItemElement(newComment, commentList, "streamComments", savedComments);
        commentBox.value = "";
      }
    });
  }

  // --- Community Posts ---
  const forumForm = document.querySelector("#forum form");
  const forumSection = document.querySelector("#forum");
  if (forumForm && forumSection) {
    const savedPosts = JSON.parse(localStorage.getItem("communityPosts")) || [];
    savedPosts.forEach(pText => createItemElement(pText, forumSection, "communityPosts", savedPosts));

    forumForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const postContent = document.querySelector("#postContent");
      if (postContent.value.trim() !== "") {
        const newPost = postContent.value.trim();
        savedPosts.push(newPost);
        localStorage.setItem("communityPosts", JSON.stringify(savedPosts));
        createItemElement(newPost, forumSection, "communityPosts", savedPosts);
        postContent.value = "";
      }
    });
  }

  // --- Video Comments ---
  const videoSlots = document.querySelectorAll(".video-slot");
  videoSlots.forEach((slot, index) => {
    const form = slot.querySelector("form");
    const list = slot.querySelector(".comment-list");
    const clearBtn = slot.querySelector(".clear-btn");

    if (form && list) {
      const key = `videoComments${index}`;
      const savedVideoComments = JSON.parse(localStorage.getItem(key)) || [];
      savedVideoComments.forEach(c => createItemElement(c, list, key, savedVideoComments));

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const textarea = form.querySelector("textarea");
        if (textarea.value.trim() !== "") {
          const newComment = textarea.value.trim();
          savedVideoComments.push(newComment);
          localStorage.setItem(key, JSON.stringify(savedVideoComments));
          createItemElement(newComment, list, key, savedVideoComments);
          textarea.value = "";
        }
      });

      // Clear All Comments button
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          showConfirmModal(() => {
            list.innerHTML = "<p>No comments yet. Be the first!</p>";
            localStorage.removeItem(key);
            savedVideoComments.length = 0; // reset array
          });
        });
      }
    }
  });

  // --- Starry Background Animation ---
  const canvas = document.getElementById("stars");
  if (canvas) {
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        dx: (Math.random() - 0.5) * 0.2,
        dy: (Math.random() - 0.5) * 0.2
      });
    }

    function drawStars() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        star.x += star.dx;
        star.y += star.dy;

        // wrap around edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
      });
      requestAnimationFrame(drawStars);
    }

    drawStars();
  }
});

