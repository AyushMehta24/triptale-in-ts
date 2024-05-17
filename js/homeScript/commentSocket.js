const form = document.getElementById("form");
const btn = document.getElementById("sendbtn");
let comment = document.getElementById("comments");

let socket = io();
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (comment.value.trim() !== "") {
    let postId = btn.dataset.postId;

    let userComment = await fetch("/home/comment", {
      method: "POST",
      body: JSON.stringify({ comment: comment.value, postId: postId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (comment.value) {
      socket.emit("comment", { id: postId, data: comment.value });
      comment.value = "";
    }

    userComment = await userComment.json();
    if (userComment.status == 200) {
      userlist.innerHTML += `<li class="p-3 ">
      <div class="flex flex-col">
        <div class="flex items-center space-x-4">
          <input type="hidden" id="commentid" name="commentid" value="${userComment.lastComment[0].comment_id}">
            <div class="flex-shrink-0">
                <img class="w-8 h-8 rounded-full" src="${userComment.lastComment[0].profile_image}" alt="user profile">
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-black-900 text-base">
                    ${userComment.lastComment[0].first_name} ${userComment.lastComment[0].last_name}
                </p>
                <p class="text-sm text-black-500 ">
                    ${userComment.lastComment[0].comments}
                </p>
            </div>
            <img id="replybtn" src="/assets/images/reply.png" alt="reply" class="w-4 h-4 cursor-pointer">
            <div id="deleteBtnDiv">
            <button id="delete">
              <img src="/assets/images/delete.png" alt="delete" class="w-4 h-4"></img>
            </button>
            </div>
        </div>
        <p id="viewbtn" class="text-gray-500 sub-font text-sm ml-16 cursor-pointer">view reply</p>
        <ul
            id="replyList"
            class="divide-y divide-gray-200 sub-font ml-16"
            data-cmtId = "${userComment.lastComment[0].comment_id}"
        ></ul>
        <div id="replyform">
        </div>
      </div>
      </li>`;
    }
    if (userlist.innerHTML.length) {
      document.getElementById("innerTextDiv").classList.add("hidden");
    }
    notification(postId, "your post is comment");

    deleteComment();
    replyComment();
    viewbtnToggle();
  }
});

async function notification(postId, content) {
  let messages = document.getElementById("messages");
  let socket = io();

  let notificationData = await fetch(`/notification/postUserId`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ postId: postId, content: content }),
  });

  notificationData = await notificationData.json();

  if (notificationData["result"] != "") {
    socket.emit("notification-message", {
      id: notificationData["result"],
      data: notificationData["userDetail"][0],
      content: content,
    });
  }
}

function deleteComment() {
  let deletebtn = document.querySelectorAll("#delete");

  deletebtn.forEach((dltbtn) => {
    dltbtn.addEventListener("click", async () => {
      dltbtn.parentElement.parentElement.parentElement.parentElement.remove();
      await fetch("/home/deletecomment", {
        method: "POST",
        body: JSON.stringify({
          commentId: dltbtn.parentElement.parentElement.firstElementChild.value,
          postId: btn.dataset.postId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  });
}

document.getElementById("emojibtn").addEventListener("click", (e) => {
  console.log("click");
  e.preventDefault();
  document.querySelector("emoji-picker").classList.toggle("hidden");
});

document.querySelector("emoji-picker").addEventListener("emoji-click", (e) => {
  comment.value += e.detail.unicode;
  comment.focus();
});

btn.addEventListener("click", () =>
  document.querySelector("emoji-picker").classList.add("hidden")
);
