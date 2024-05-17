let morebtn = document.querySelectorAll(".more");

morebtn.forEach((ele) => {
  if (
    ele.previousElementSibling.scrollWidth >
    ele.previousElementSibling.clientWidth
  ) {
    ele.classList.remove("hidden");
  }
  ele.addEventListener("click", () => {
    ele.innerHTML = ele.innerHTML == "less" ? "more" : "less";
    ele.previousElementSibling.classList.toggle("truncate");
  });
});

let card = document.getElementById("postCard");

let images = document.querySelectorAll(".postsImage");
let popupClosebtn = document.getElementById("closebtn");
let popUpLeftbtn = document.querySelector(".leftbtn");
let detailsDiv = document.getElementById("details");

images.forEach((element) => {
  element.addEventListener("click", async () => {
    if (!document.getElementById("rightBar").classList.contains("show")) {
      document.getElementById("rightBar").classList.add("show");
    }
    card.classList.remove("hidden");
    detailsDiv.classList.remove("hidden");
    let onePostDetails = await fetch("/home/onepost", {
      method: "POST",
      body: JSON.stringify({ postId: element.dataset.id }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    onePostDetails = await onePostDetails.json();
    let postDetails = onePostDetails.postData.shift();
    postDetails.hashTags = onePostDetails.hashTags;
    postDetails.tagPeople = onePostDetails.tagPeoples;
    if (postDetails.ismultiple) {
      if (postDetails.isvideo[0]) {
        let video = document.createElement("video");
        video.src = "/posts/" + postDetails.image[0];
        video.classList.add("object-cover", "w-full", "rounded-t-md");
        video.id = "multipost";
        video.setAttribute("autoplay", "true");
        popUpLeftbtn.insertAdjacentElement("afterend", video);
      } else {
        let image = document.createElement("img");
        image.src = "/posts/" + postDetails.image[0];
        image.alt = "post";
        image.classList.add("object-cover", "w-full", "rounded-t-md");
        image.id = "multipost";
        popUpLeftbtn.insertAdjacentElement("afterend", image);
      }
      for (let index = postDetails.image.length - 1; index > 0; index--) {
        if (postDetails.isvideo[index]) {
          let video = document.createElement("video");
          video.src = "/posts/" + postDetails.image[index];
          video.classList.add(
            "object-cover",
            "hidden",
            "w-full",
            "rounded-t-md"
          );
          video.setAttribute("autoplay", "true");
          document
            .getElementById("multipost")
            .insertAdjacentElement("afterend", video);
        } else {
          let image = document.createElement("img");
          image.src = "/posts/" + postDetails.image[index];
          image.alt = "post";
          image.classList.add(
            "object-cover",
            "hidden",
            "w-full",
            "rounded-t-md"
          );
          document
            .getElementById("multipost")
            .insertAdjacentElement("afterend", image);
        }
      }
    } else {
      document.querySelector(".rightbtn").style.display = "none";
      if (postDetails.isvideo[0]) {
        let video = document.createElement("video");
        video.src = "/posts/" + postDetails.image[0];
        video.classList.add("object-cover", "w-full", "rounded-t-md");
        video.id = "multipost";
        video.setAttribute("autoplay", "true");
        popUpLeftbtn.insertAdjacentElement("afterend", video);
      } else {
        let image = document.createElement("img");
        image.src = "/posts/" + postDetails.image[0];
        image.alt = "post";
        image.classList.add("object-cover", "w-full", "rounded-t-md");
        image.id = "multipost";
        popUpLeftbtn.insertAdjacentElement("afterend", image);
      }
    }
    document.getElementById("profile").src = postDetails.profile_image;
    document.getElementById("username").innerHTML = postDetails.username;
    document.getElementById("desc").innerHTML = postDetails.descriptions;
    document.getElementById("postlikes").innerHTML =
      "Likes: " + postDetails.like_count;
    document.getElementById("postComments").innerHTML =
      "Comments: " + postDetails.comment_count;
    document.getElementById("location").innerHTML = postDetails.location;
    if (postDetails.hashTags.length) {
      document.getElementById("hashtags").innerHTML = "# tags: ";
      for (let i = 0; i < postDetails.hashTags.length; i++) {
        document.getElementById("hashtags").innerHTML +=
          postDetails.hashTags[i].name + " ";
      }
    }

    if (postDetails.tagPeople.length) {
      document.getElementById("tagpeoples").innerHTML = "Tag People: ";
      for (let i = 0; i < postDetails.tagPeople.length; i++) {
        document.getElementById("tagpeoples").innerHTML +=
          postDetails.tagPeople[i].username + " ";
      }
    }
  });
});

popupClosebtn.addEventListener("click", () => {
  for (
    let index = 0;
    index < popUpLeftbtn.parentElement.children.length;
    index++
  ) {
    if (
      popUpLeftbtn.parentElement.children[index].nodeName == "IMG" ||
      popUpLeftbtn.parentElement.children[index].nodeName == "VIDEO"
    ) {
      popUpLeftbtn.nextElementSibling.remove();
      index = 0;
    }
  }
  document.getElementById("imageDiv").dataset.prevcount = 0;
  popUpLeftbtn.style.display = "none";
  document.querySelector(".rightbtn").style.display = "block";
  card.classList.add("hidden");
  detailsDiv.classList.add("hidden");
});

document.getElementById("details").addEventListener("click", () => {
  for (
    let index = 0;
    index < popUpLeftbtn.parentElement.children.length;
    index++
  ) {
    if (
      popUpLeftbtn.parentElement.children[index].nodeName == "IMG" ||
      popUpLeftbtn.parentElement.children[index].nodeName == "VIDEO"
    ) {
      popUpLeftbtn.nextElementSibling.remove();
      index = 0;
    }
  }
  document.getElementById("imageDiv").dataset.prevcount = 0;
  popUpLeftbtn.style.display = "none";
  document.querySelector(".rightbtn").style.display = "block";
  card.classList.add("hidden");
  detailsDiv.classList.add("hidden");
});
