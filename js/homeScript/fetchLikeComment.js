let likedByData = document.querySelectorAll(".likeByDetails");
let userlist = document.getElementById("userList");
const rightbar = document.getElementById("rightBar");
let commentData = document.querySelectorAll(".comment");
let title = document.getElementById("sidebarTitle");
const textBox = document.getElementById("textBox");

likedByData.forEach((element) => {
  element.addEventListener("click", async () => {
    document.getElementById("innerText1").innerHTML = "No Like yet.";
    document.getElementById("innerText2").classList.add("hidden");

    textBox.classList.add("hidden");
    document.getElementById("rightbardiv").classList.remove("hidden");
    title.innerHTML = "Likes";
    let postId = element.parentElement.previousElementSibling.children[0].id;
    let likedByData = await fetch("/home/likedby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId: postId }),
    });

    likedByData = await likedByData.json();
    if (likedByData.data.length) {
      document.getElementById("innerTextDiv").classList.add("hidden");
    } else {
      document.getElementById("innerTextDiv").classList.remove("hidden");
    }
    rightbar.classList.remove("show");
    userlist.innerHTML = "";
    for (let index = 0; index < likedByData.data.length; index++) {
      userlist.innerHTML += `<li class="p-3 ">
      <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
              <img class="w-8 h-8 rounded-full" src="${likedByData.data[index].profile_image}" alt="user profile">
          </div>
          <div class="flex-1 min-w-0">
              <p class="text-black-900 text-base">
                  ${likedByData.data[index].first_name} ${likedByData.data[index].last_name}
              </p>
              <p class="text-sm text-black-500 ">
                  ${likedByData.data[index].username}
              </p>
          </div>
      </div>
    </li>`;
    }
  });
});

function showList(commentByData) {
  for (let index = 0; index < commentByData.data.length; index++) {
    userlist.innerHTML += `<li class="p-3">
    <div class="flex flex-col">
      <div class="flex space-x-4">
        <input type="hidden" id="commentid" name="commentid" value="${commentByData.data[index].comment_id}">
          <div class="flex">
              <img class="w-8 h-8 rounded-full mt-2" src="${commentByData.data[index].profile_image}" alt="user profile">
          </div>
          <div class="flex-1 min-w-0">
              <p class="text-black-900 text-lg font-semibold">
                  ${commentByData.data[index].first_name} ${commentByData.data[index].last_name}
              </p>
              <p class="text-base text-black-500">
                  ${commentByData.data[index].comments}
              </p>
          </div>
          <img id="replybtn" src="/assets/images/reply.png" alt="reply" class="w-4 h-4 mt-4 cursor-pointer">
          <div id="deleteBtnDiv">  
          </div>
      </div>
      <p id="viewbtn" class="text-gray-500 sub-font text-sm ml-16 cursor-pointer">view reply</p>
      <ul
          id="replyList"
          class="divide-y divide-gray-200 sub-font ml-16 hidden"
          data-cmtId="${commentByData.data[index].comment_id}"
      ></ul>  
      <div id="replyform">
      </div>
    </div>
    </li>`;
    if (commentByData.data[index].id == commentByData.logedUserId) {
      let deletebtnDiv = document.querySelectorAll("#deleteBtnDiv");
      for (let i = 0; i < deletebtnDiv.length; i++) {
        deletebtnDiv[index].innerHTML = `<button id="delete" class="mt-4">
          <img src="/assets/images/delete.png" alt="delete" class="w-4 h-4"></img>
        </button>`;
      }
    }

    if(commentByData.allReply.length == 0){
      document.getElementById("viewbtn").classList.add("hidden")
    } else {
      document.getElementById("viewbtn").classList.remove("hidden")
    }
  }
}

commentData.forEach((element) => {
  element.addEventListener("click", async () => {
    document.getElementById("innerTextDiv").classList.remove("hidden");
    document.getElementById("rightbardiv").classList.remove("hidden");
    document.getElementById("innerText1").innerHTML = "No comment yet.";
    document.getElementById("innerText2").classList.remove("hidden");
    rightbar.classList.remove("show");
    userlist.innerHTML = "";
    title.innerHTML = "Comments";
    let postId;
    if (element.nodeName == "IMG") {
      postId = element.previousElementSibling.id;
    } else {
      postId =
        element.parentElement.previousElementSibling.previousElementSibling
          .firstElementChild.id;
    }

    let commentByData = await fetch("/home/commentby", {
      method: "POST",
      body: JSON.stringify({ postId: postId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    commentByData = await commentByData.json();
    if (commentByData.data.length) {
      document.getElementById("innerTextDiv").classList.add("hidden");
    } else {
      document.getElementById("innerText1").classList.remove("hidden");
      document.getElementById("innerText2").classList.remove("hidden");
    }
    showList(commentByData);
    allReply(commentByData);
    textBox.classList.remove("hidden");
    textBox.classList.add("block");

    btn.dataset.postId = postId;
    viewbtnToggle();
    replyComment();
    deleteComment();
  });
});

document.getElementById("close").addEventListener("click", () => {
  rightbar.classList.toggle("show");
});

document.getElementById("rightbardiv").addEventListener("click", () => {
  rightbar.classList.toggle("show");
  document.getElementById("rightbardiv").classList.toggle("hidden");
  document.querySelector("emoji-picker").classList.add("hidden")
});
