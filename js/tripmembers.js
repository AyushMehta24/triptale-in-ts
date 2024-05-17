const output = document.querySelector("output");
const postImages = document.querySelector(".images");

let imagesArray = [];
postImages.addEventListener("change", () => {

  const files = postImages.files;

  imagesArray.pop();
  imagesArray.push(files[0]);
  displayImages();
  // if(location.reload()){
  //   imagesArray = [];
  // }
});

function displayImages() {
  let images = "<div  class='flex flex-wrap' style='padding-top: 16px;'>";
  imagesArray.forEach((image, index) => {
    images += `<div class="image mx-2" style="margin: 0 auto;" >
              <img src="${URL.createObjectURL(
                image
              )}" class="bg-cover w-[12rem] h-[12rem]" alt="image">
              
            </div>`;
  });
  output.innerHTML = images;
}

function deleteImage(index) {}

function datavalidation() {
  const startDate = document.getElementById("startdate").value;
  const endDate = document.getElementById("enddate").value;

  if (startDate > endDate) {
    document.getElementById("dateerror").innerHTML =
      "End Date cannot be less than start date";
    document.getElementById("dateerror").autofocus;
    return false;
  } else {
    document.getElementById("dateerror").innerHTML = "";
  }

  const fileName = document.getElementById("dropzone-file");
  var selectedFile = document.getElementById("dropzone-file").files[0];
  var allowedTypes = ["image/jpeg", "image/png"];

  if (fileName.files.length == 0) {
    document.getElementById("fileerror").innerHTML =
      "Cover Photo cannot be blank";
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text:  "Cover Photo cannot be blank",
    });
    return false;
  } else if (!allowedTypes.includes(selectedFile.type)) {
    // document.getElementById("fileerror").innerHTML =
    //   "Upload Photo in Proper format";
    document.getElementById("fileerror").autofocus;
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Only SVG, PNG, JPG or JPEG image allowed!!!!",
    });
    return false;
  } else {
    document.getElementById("fileerror").innerHTML = "";
  }

  var validate = ["title", "location", "description", "startdate", "enddate"];
  var display = ["Title", "Location", "Description", "Start Date", "End Date"];

  for (var i = 0; i < validate.length; i++) {
    str = document.getElementById(validate[i]);
    if (str.value.trim() == "" || str.value.trim() == null) {
      document.getElementsByClassName("validate_of")[i].innerHTML =
        display[i] + " cannot be blank";
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: display[i] + " cannot be blank",
        });
      return false;
    } else {
      document.getElementsByClassName("validate_of")[i].innerHTML = "";
    }
  }

  var textbox = document.getElementById("description");
  if (textbox.value.length >= 250) {
    document.getElementById("descerror").innerHTML =
      "Enter Description in 250 character or less";
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Enter Description in 250 character or less",
    });
    return false;
  } else {
    document.getElementById("descerror").innerHTML = "";
  }
}

async function fetchmembers() {
  try {
    let members = document.getElementById("members").value;
    let response = await fetch("/getmembers");
    if (!response.ok) {
      throw new Error("Failed to fetch cities");
    }
    const data = await response.json();
    let result = JSON.stringify(data);
    let datalength = data.result.length;
  } catch (error) {
    console.error("Error ", error);
  }
}

let addedMember = [];
const peopleTagsList = document.getElementById("peopleTagsList");
const peopleTag = document.getElementById("peopleTag");
let debounceTagPeople;
peopleTag.addEventListener("keydown", async function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
  }
  if (event.key !== "Enter" && peopleTag.value != "") {
    clearTimeout(debounceTagPeople);
    debounceTagPeople = setTimeout(async()=>{
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
            !addedMember.includes(sortedNames[i])
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

    tag.innerHTML += `<input type="hidden" value="${tagContent}" name="members[]"><button class="delete-button bg-transparent border-[none] text-[#999] cursor-pointer ml-[5px]">X</button>`;

    peopleTagsList.appendChild(tag);
    addedMember.push(tagContent);
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
    if (addedMember.length != 1) {
      addedMember.splice(
        addedMember.indexOf(
          event.target.parentNode.innerText.substr(
            0,
            event.target.parentNode.innerText.length - 1
          )
        ),
        1
      );
    } else {
      addedMember.pop();
    }
    event.target.parentNode.remove();
  }
});

function showresult(val) {
  res = document.getElementById("result2");
  res.innerHTML = "";

  if (val == "") {
    return;
  }
  let list = "";
  fetch("/trips/getlocation", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ locationLike: val.trim() }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      for (i = 0; i < data.length; i++) {
        list += '<li onclick="samevalue(this.innerHTML)">' + data[i] + "</li>";
      }
      res.innerHTML = "<ul>" + list + "</ul>";
    })
    .catch(function (err) {
      console.warn("Something went wrong.", err);
      return false;
    });
}

function samevalue(val) {
  document.getElementById("result2").innerHTML = "";
  document.getElementById("location").value = val;
}