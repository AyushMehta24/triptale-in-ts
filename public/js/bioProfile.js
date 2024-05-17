function validateForm() {
  let istrue = true;
  try {
    if (
      document.getElementById("file_upload").files[0].type == "image/png" ||
      document.getElementById("file_upload").files[0].type == "image/jpg" ||
      document.getElementById("file_upload").files[0].type == "image/jpeg"
    ) {
      document.getElementById("error-file_upload").innerHTML = "";
    } else {
      document.getElementById("error-file_upload").innerHTML =
        "(File type is only png/jpg/jpeg allow)";
      istrue = false;
    }
  } catch (error) {}

  try {
    const validate_date = (date, name) => {
      let dateRegx = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;

      if (!dateRegx.test(date)) {
        document.getElementById("error-" + name).innerHTML =
          "(Date is invalid)";
        document.getElementById("error-" + name).style.color = "red";
        istrue = false;
      } else {
        document.getElementById("error-" + name).innerHTML = "";
      }
    };

    const alphabetic = (string, name) => {
      let regex = /^[a-zA-Z]+$/;
      if (!regex.test(string)) {
        document.getElementById("error-" + name).innerHTML =
          "(name only content alphabetic letter)";
        document.getElementById("error-" + name).style.color = "red";
        istrue = false;
      } else {
        document.getElementById("error-" + name).innerHTML = "";
      }
    };

    [...document.querySelectorAll(".field-required")].map((element) => {
      if (element.value.trim() == "") {
        document.getElementById("error-" + element.id).style.color = "red";
        document.getElementById("error-" + element.id).innerHTML = "(*)";

        istrue = false;
      } else {
        if (element.id == "user_dob") {
          validate_date(element.value.trim(), element.id);
        }
        if (element.id == "first_name" || element.id == "last_name") {
          alphabetic(element.value.trim(), element.id);
        }
      }
    });
    return istrue;
  } catch (error) {
    return false;
  }
}

async function call_db(name, id, current_id) {
  if (name == "countries") {
    document.getElementById("state").style.display = "none";
    document.getElementById("city").style.display = "none";
  }
  let userProflie = await fetch(`/${name}`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ id: id }),
  });
  userProflie = await userProflie.json();
  let temp = `<option selected hidden value="">Choose a ${name}</option>`;
  for (let i in userProflie["result"]) {
    temp += ` <option value="${userProflie["result"][i].id}" data-id="${userProflie["result"][i].id}">${userProflie["result"][i].name}</option>`;
  }
  document.getElementById(`main-${name}`).style.display = "";
  document.getElementById(name).innerHTML = temp;
}
call_db("countries");

function change_combo(id, element, next_id) {
  let element_id = document.getElementById(id);
  let next_element_id =
    element_id.options[element.selectedIndex].getAttribute("data-id");

  document.getElementById(next_id).style.display = "";
  if (id == "countries") {
    document.getElementById("city").style.display = "none";
    document.getElementById(`main-city`).style.display = "none";
  }
  call_db(next_id, next_element_id, id);
}

const imageInput = document.getElementById("file_upload");
const selectedImage = document.getElementById("selectedImage");

imageInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    selectedImage.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

async function checkUsername(username) {
  fetch(`/checkUsername`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ username: username.value }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.isExists) {
        document.getElementById("error-username").style.color = "red";
        document.getElementById("error-username").innerHTML =
          "userName already";
        document.getElementById("submitButton").style.display = "none";
      } else {
        document.getElementById("error-username").style.color = "red";
        document.getElementById("error-username").innerHTML = "";
        document.getElementById("submitButton").style.display = "";
      }
    });
}

let interest = [];
const userInterestsList = document.getElementById("userInterestsList");
const userInterests = document.getElementById("userInterests");
const interestlist = document.querySelector(".interestlist");
let focusedHashtag = 0;
userInterests.addEventListener("keydown", async function (event) {
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
    const tagContent = userInterests.value.trim();
    if (tagContent !== "") {
      tag.innerText = `${tagContent}`;

      tag.innerHTML += `<input type="hidden" value="${tagContent}" name="userInterests[]"><button class="delete-button bg-transparent border-[none] text-[#999] cursor-pointer ml-[5px]">X</button>`;
      interest.push(`${tagContent}`);
      userInterestsList.appendChild(tag);
      userInterests.value = "";
    }
  }

});

function hashRemoveElements() {
  let items = document.querySelectorAll(".hash-list-items");
  items.forEach((item) => {
    item.remove();
  });
}

userInterestsList.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-button")) {
    if (interest.length != 1) {
      interest.splice(
        interest.indexOf(
          event.target.parentNode.innerText.substr(
            0,
            event.target.parentNode.innerText.length - 1
          )
        ),
        1
      );
    } else {
      interest.pop();
    }
    event.target.parentNode.remove();
  }
});

