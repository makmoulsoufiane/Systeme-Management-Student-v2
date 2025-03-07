document.addEventListener("DOMContentLoaded", function () {
  let cards = document.querySelectorAll(".student-card");

  cards.forEach(function (card) {
      card.addEventListener("click", function (event) {
          // Prevent navigation when clicking the button
          if (!event.target.classList.contains("student-btn")) {
              let url = card.getAttribute("data-url");
              if (url) {
                  window.location.href = url;
              }
          }
      });
  });
});
