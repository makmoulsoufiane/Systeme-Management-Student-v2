document.addEventListener("DOMContentLoaded", function () {
  let cards = document.querySelectorAll(".student-card");

  cards.forEach(function (card) {
      card.addEventListener("click", function () {
          // Prevent navigation when clicking the button

              let url = card.getAttribute("data-url");
              if (url) {
                  window.location.href = url;
              }
          }
      );
  });
});
