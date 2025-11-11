document.addEventListener("DOMContentLoaded", () => {
  const feedbackText = document.getElementById("feedbackText");
  const itemNameEl = document.querySelector(".feedback-card p strong"); // the <strong> inside the <p>
  const submitBtn = document.getElementById("submitFeedback");
  const feedbackModal = document.getElementById("feedbackModal");
  const feedbackMessage = document.getElementById("feedbackMessage");
  const feedbackOkBtn = document.getElementById("feedbackOkBtn");

  // ===================== Get URL Parameters =====================
  const urlParams = new URLSearchParams(window.location.search);
  const itemName = urlParams.get("item") || "Unknown Item";

  // Set the item name dynamically
  itemNameEl.textContent = `Item Name: ${itemName}`;

  // ===================== Submit Feedback =====================
  submitBtn.addEventListener("click", () => {
    const text = feedbackText.value.trim();

    if (!text) {
      feedbackMessage.textContent = "Please write your feedback before submitting.";
      feedbackMessage.style.color = "red";
    } else {
      feedbackMessage.textContent = "Thank you! Your feedback has been submitted.";
      feedbackMessage.style.color = "green";
      feedbackText.value = "";
    }

    feedbackModal.style.display = "flex";
  });

  // ===================== Close Modal =====================
  feedbackOkBtn.addEventListener("click", () => {
    feedbackModal.style.display = "none";
  });
});
