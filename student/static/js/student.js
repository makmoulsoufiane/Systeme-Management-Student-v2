document.addEventListener("DOMContentLoaded", function () {
  // Select all elements with the class 'student-card'
  let cards = document.querySelectorAll(".student-card");

  // Iterate over each card
  cards.forEach(function (card) {
    // Add a click event listener to each card
    card.addEventListener("click", function () {
      // Get the URL from the data-url attribute of the card
      let url = card.getAttribute("data-url");

      // If the URL exists, navigate to it
      if (url) {
        window.location.href = url;
      }
    });
  });
});
