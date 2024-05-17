let privacys = document.querySelector("#privacys");

if (location.pathname == "/posts/update") {
  for (let i = 0; i < privacys.options.length; i++) {
    if (privacys.options[i].value == privacys.dataset.val) {
      privacys.options[i].selected = true;
    }
  }
}

let postImages;
let output;
let imagesArray = [];
if (location.pathname === "/posts/insertform") {
  output = document.querySelector("output");
  postImages = document.querySelector(".images");

  postImages.addEventListener("change", () => {
    imagesArray = [];
    const files = postImages.files;
    for (let i = 0; i < files.length; i++) {
      imagesArray.push(files[i]);
    }
    displayImages();
  });

  function displayImages() {
    let extentionImage = ["jpg", "jpeg", "png", "svg"];
    let extentionVideo = ["mp4","webm"]
    let images = "<div  class='flex flex-wrap '>";

    imagesArray.forEach((image, index) => {
      if (extentionImage.includes(image.name.split(".").pop())) {
        images += `<div class="image m-2 bg-[#d3d3d3] p-[10px] rounded-md"><span onclick="deleteImage(${index})" class="cursor-pointer text-3xl">&times;</span>
                  <img src="${URL.createObjectURL(
                    image
                  )}" class="bg-cover w-[12rem] h-[12rem]" alt="image">
                  
                </div>`;
      }
      if (extentionVideo.includes(image.name.split(".").pop())) {
        images += `<div class="image m-2 bg-[#d3d3d3] p-[10px] rounded-md"><span onclick="deleteImage(${index})" class="cursor-pointer text-3xl">&times;</span>
         <video controls class="bg-cover w-[12rem] h-[12rem]">
        <source src="${URL.createObjectURL(
          image
        )}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      </div> `
      }
      
    });
 
    images += "</div>";
    output.innerHTML = images;
  }

  function deleteImage(index) {
    imagesArray.splice(index, 1);
    postImages.value = "";

    const dataTransfer = new DataTransfer();
    imagesArray.forEach((item) => {
      dataTransfer.items.add(item);
    });
    postImages.files = dataTransfer.files;
    displayImages();
  }
}

let hashtagged = [];
const hashtagList = document.getElementById("hashtagList");
const hashtags = document.getElementById("hashtags");
const hashlist = document.querySelector(".hashlist");
let debounceHashtag;
hashtags.addEventListener("keydown", async function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    hashRemoveElements();
    const tag = document.createElement("li");
    tag.classList.add(
      "inline-block",
      "bg-[#f2f2f2]",
      "text-[#333]",
      "rounded-[20px]",
      "px-[10px]",
      "py-[5px]",
      "mr-[5px]",
      "mb-[5px]"
    );
    const tagContent = hashtags.value.trim();
    if (tagContent !== "") {
      tag.innerText = `#${tagContent}`;

      tag.innerHTML += `<input type="hidden" value="#${tagContent}" name="hashtags[]"><button class="delete-button bg-transparent border-[none] text-[#999] cursor-pointer ml-[5px]">X</button>`;
      hashtagged.push(`#${tagContent}`);
      hashtagList.appendChild(tag);
      hashtags.value = "";
    }
  }

  if (
    event.key !== "Enter" &&
    hashtags.value.trim() != "" &&
    event.key !== "ArrowDown" &&
    event.key !== "ArrowUp"
  ) {
    clearTimeout(debounceHashtag)
    debounceHashtag = setTimeout(async()=>{
      let result = await fetch("/posts/getHashtags", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hashtagLike: hashtags.value.trim() }),
      });
      responce = await result.json();
      let sortedNames = responce.sort();
  
      hashRemoveElements();
      for (let i of sortedNames) {
        if (
          i.toLowerCase().startsWith(`#${hashtags.value.toLowerCase()}`) &&
          hashtags.value != "" &&
          !hashtagged.includes(i)
        ) {
          let listItem = document.createElement("option");
          listItem.style.cursor = "pointer";
          listItem.classList.add(
            "hash-list-items",
            "flex",
            "items-center",
            "mb-1"
          );
          let word = "<b>" + i.substr(0, hashtags.value.length) + "</b>";
          word += i.substr(hashtags.value.length);
          listItem.innerHTML = word;
          listItem.value = i.substr(1);
          hashlist.appendChild(listItem);
        }
      }
    },700)
  }
});

function hashRemoveElements() {
  let items = document.querySelectorAll(".hash-list-items");
  items.forEach((item) => {
    item.remove();
  });
}

hashtagList.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-button")) {
    if (hashtagged.length != 1) {
      hashtagged.splice(
        hashtagged.indexOf(
          event.target.parentNode.innerText.substr(
            0,
            event.target.parentNode.innerText.length - 1
          )
        ),
        1
      );
    } else {
      hashtagged.pop();
    }
    event.target.parentNode.remove();
  }
});

let taggedPeople = [];
const peopleTagsList = document.getElementById("peopleTagsList");
const peopleTag = document.getElementById("peopleTag");
let debounceTagpeople
peopleTag.addEventListener("keydown", async function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
  }
  if (event.key !== "Enter" && peopleTag.value.trim() != "") {
    clearTimeout(debounceTagpeople)
    debounceTagpeople = setTimeout(async()=>{
      let result = await fetch("/posts/getuserusernames", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userLike: peopleTag.value.trim() }),
      });
      responce = await result.json();
      let sortedNames = responce.userNames;
      removeElements();
      if (responce.userNames.length >= 1) {
        for (let i = 0; i < sortedNames.length; i++) {
          if (
            sortedNames[i]
              .toLowerCase()
              .startsWith(peopleTag.value.toLowerCase()) &&
            peopleTag.value != "" &&
            !taggedPeople.includes(sortedNames[i])
          ) {
            let listItem = document.createElement("li");
            listItem.classList.add("list-items", "flex", "items-center", "mb-1");
            listItem.style.cursor = "pointer";
            listItem.setAttribute(
              "onclick",
              "displayNames('" + sortedNames[i] + "')"
            );
            let image = `<img src="${responce.profileImages[i]}" alt="hello" class="w-[40px] h-[40px] rounded-[50%]" >`;
            listItem.innerHTML = image;
            let word =
              "<b class='ml-2'>" +
              sortedNames[i].substr(0, peopleTag.value.length) +
              "</b>";
            word += sortedNames[i].substr(peopleTag.value.length);
            listItem.innerHTML += word;
            document.querySelector(".list").appendChild(listItem);
          }
        }
      } else {
        document.querySelector(".list").innerHTML =
          "<li class='list-items'><b>No user found</b></li>";
      }
    },700)
  }
});

function displayNames(value) {
  const tag = document.createElement("li");
  tag.classList.add(
    "inline-block",
    "bg-[#f2f2f2]",
    "text-[#333]",
    "rounded-[20px]",
    "px-[10px]",
    "py-[5px]",
    "mr-[5px]",
    "mb-[5px]"
  );
  const tagContent = value.trim();
  if (tagContent !== "") {
    tag.innerText = tagContent;
    tag.innerHTML += `<input type="hidden" value="${tagContent}" name="peopleTag[]"><button class="delete-button bg-transparent border-[none] text-[#999] cursor-pointer ml-[5px]">X</button>`;

    peopleTagsList.appendChild(tag);
    taggedPeople.push(tagContent);
    peopleTag.value = "";
  }
  peopleTag.focus();
  removeElements();
}
function removeElements() {
  let items = document.querySelectorAll(".list-items");
  items.forEach((item) => {
    item.remove();
  });
}

peopleTagsList.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-button")) {
    if (taggedPeople.length != 1) {
      taggedPeople.splice(
        taggedPeople.indexOf(
          event.target.parentNode.innerText.substr(
            0,
            event.target.parentNode.innerText.length - 1
          )
        ),
        1
      );
    } else {
      taggedPeople.pop();
    }
    event.target.parentNode.remove();
  }
});

let submitPost = document.querySelector("#submitPost");
let postForm = document.querySelector("#postForm");
submitPost.addEventListener("click", async (e) => {
  e.preventDefault();
  if (validation()) {
    postForm.submit();
  }
});

function validation(){
  let isvalidate = true;
  //caption validate

  if (isvalidate) {
    let caption = document.querySelector("#caption");
    if (caption.value.trim().length > 100) {
      isvalidate = false;
      sweetAlertError("Too much content in caption")
    }
  }
  //description validate
  if (isvalidate) {
    let description = document.querySelector("#description");
    if (description.value.trim().length > 550) {
      isvalidate = false;
      sweetAlertError("Too much content in description")
    }
  }
  //image validate
  if (location.pathname === "/posts/insertform") {
    if (isvalidate) {
      if (postImages.files.length <= 0) {
        isvalidate = false;
        sweetAlertError("select at least one image for post")
      } else if (postImages.files.length >= 6) {
        isvalidate = false;
        sweetAlertError("select five image only")
      }
    }

    const extention = ["jpg", "jpeg", "png", "svg","mp4","webm"];
    if (isvalidate) {
      for (let i = 0; i < imagesArray.length; i++) {
        if (!extention.includes(imagesArray[i].name.split(".").pop())) {
          isvalidate = false;
          sweetAlertError("Only SVG, PNG,JPG , JPEG, WEBM or MP4 image allowed!!!!")
          break;
        } else if (Math.round(imagesArray[i].size / 1024) >= 20000) {
          isvalidate = false;
          sweetAlertError("Max 20Mb size image allowed!!!!")
          break;
        }
      }
    }
  }

  //location validate
  if (isvalidate) {
    let location = document.querySelector("#location");
    if (
      location.value.trim().length <= 0 ||
      location.value.trim().length > 30
    ) {
      isvalidate = false;
      sweetAlertError("Give Proper location for your post")
    }
  }
  return isvalidate;
}


let location1 = document.querySelector("#location");
let locationList = document.querySelector(".locationList");
let debounceLocation;
location1.addEventListener("keydown", async function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
  }
  if (
    event.key !== "Enter" &&
    location1.value.trim() != "" &&
    event.key !== "ArrowDown" &&
    event.key !== "ArrowUp"
  ) {
    clearTimeout(debounceLocation)
   debounceLocation = setTimeout(async()=>{
    let result = await fetch("/trips/getlocation", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locationLike: location1.value.trim() }),
    });
    responce = await result.json();
    locationRemoveElements();
    responce.forEach((i) => {
      if (
        i.toLowerCase().startsWith(peopleTag.value.toLowerCase()) &&
        location1.value != ""
      ) {
        let listItem = document.createElement("option");
        listItem.classList.add(
          "location-items",
          "flex",
          "items-center",
          "mb-1"
        );
        listItem.style.cursor = "pointer";
        let word =
          "<b class='ml-2'>" + i.substr(0, location1.value.length) + "</b>";
        word += i.substr(location1.value.length);
        listItem.innerHTML += word;
        listItem.value = i;
        locationList.appendChild(listItem);
      }
    });
  },700)
  }
});

function locationRemoveElements() {
  let items = document.querySelectorAll(".location-items");
  items.forEach((item) => {
    item.remove();
  });
}

if (location.pathname == "/posts/update") {
  let usedHashatags = document.getElementsByName("hashtags[]");
  if (usedHashatags.length >= 1) {
    usedHashatags.forEach((item) => {
      hashtagged.push(item.value);
    });
  }
  let usedTagpeople = document.getElementsByName("peopleTag[]");
  if (usedTagpeople.length >= 1) {
    usedTagpeople.forEach((item) => {
      taggedPeople.push(item.value);
    });
  }
}

function sweetAlertError(msg){
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: msg,
  });
}

