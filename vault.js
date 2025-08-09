const chips = document.querySelectorAll(".chip");
const cards = document.querySelectorAll(".vault-card");

const setActive = (selected) => {
  chips.forEach((chip) => {
    chip.classList.toggle("active", chip === selected);
  });
};

const filterCards = (filter) => {
  cards.forEach((card) => {
    const category = card.dataset.category;
    const show = filter === "all" || filter === category;
    card.style.display = show ? "block" : "none";
  });
};

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter;
    setActive(chip);
    filterCards(filter);
  });
});
