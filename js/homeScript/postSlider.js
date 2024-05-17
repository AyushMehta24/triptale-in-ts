let leftbtn = document.querySelectorAll("#leftbtn");
let rightbtn = document.querySelectorAll("#rightbtn");
let count = 0;
let prevCount;
let currentPostId;
let prevPostId;

leftbtn.forEach((element) => {
  if (count == 0) {
    element.style.display = "none";
  }
  element.addEventListener("click", () => {
    element.parentElement.lastElementChild.style.display = "block";
    currentPostId = element.nextElementSibling.dataset.id;
    prevCount = element.parentElement.childElementCount - 3;

    count = Number(element.parentElement.dataset.prevcount);
    count--;

    prevPostId = element.nextElementSibling.dataset.id;
    element.parentElement.dataset.prevcount = count;
    if (count == 0) {
      element.style.display = "none";
    }
    element.parentElement.children[count + 1].classList.toggle("hidden");
    element.parentElement.children[count + 2].classList.toggle("hidden");
  });
});

rightbtn.forEach((element) => {
  element.addEventListener("click", () => {
  
    element.parentElement.firstElementChild.style.display = "block";
    currentPostId = element.previousElementSibling.dataset.id;

    count = Number(element.parentElement.dataset.prevcount);
    count++;
    prevCount = element.parentElement.childElementCount - 3;
    prevPostId = element.previousElementSibling.dataset.id;
    element.parentElement.dataset.prevcount = count;
    if (count == prevCount) {
      element.style.display = "none";
    }

    element.parentElement.children[count + 1].classList.toggle("hidden");
    element.parentElement.children[count].classList.toggle("hidden");
  });
});
