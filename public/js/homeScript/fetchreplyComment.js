function replyComment() {
  let replybtn = document.querySelectorAll("#replybtn");
  replybtn.forEach((ele) => {
    ele.addEventListener("click", () => {
      document.getElementById("sendbtn").setAttribute("disabled", "true");
      document.querySelectorAll("#replyform").forEach((ele) => {
        ele.innerHTML = "";
      });
      ele.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML = `<form id="replyCmtForm" class="m-0">
      <div class="border border-black rounded-3xl w-[250px] h-10 bg-white flex items-center gap-3">
          <input id="reply" class="w-[130px] items-center flex text-black text-base font-medium  focus:outline-none border-none sub-font pl-2 ml-4" placeholder="reply...">
          <button class="w-4" >
            <img
              src="/assets/images/emoji-icon.png"
              alt="emoji"
              class="w-4 h-4"
              id="replyemojibtn"
            />
          </button>
          <input
          type="submit"
            id="replySendBtn"
            class="items-center text-base flex px-3 py-1 bg-indigo-600 rounded-full shadow text-white sub-font m-[2px]"
            value="send"
          >
      </div>
    </form>
    <emoji-picker
            class="light fixed top-[145px] h-[350px] -left-14 rounded-sm hidden"
    ></emoji-picker>`;
      replyCommentForm();

      document
        .getElementById("replyemojibtn")
        .addEventListener("click", (e) => {
          console.log("click");
          e.preventDefault();
          document.querySelector("emoji-picker").classList.toggle("hidden");
        });

      document
        .querySelector("emoji-picker")
        .addEventListener("emoji-click", (e) => {
          document.getElementById("reply").value += e.detail.unicode;
          document.getElementById("reply").focus();
        });
    });
  });
}

document.getElementById("comments").addEventListener("focus", () => {
  document.querySelectorAll("#replyform").forEach((ele) => {
    ele.innerHTML = "";
  });
  document.getElementById("sendbtn").removeAttribute("disabled");
});

function replyCommentForm() {
  const replyCmtForm = document.getElementById("replyCmtForm");
  const replyInput = document.getElementById("reply");
  replyCmtForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("viewbtn").classList.remove("hidden");
    document.getElementById("replySendBtn").addEventListener("click", () => {
      document.querySelector("emoji-picker").classList.add("hidden");
    });
    if (replyInput.value.trim() !== "") {
      const commentId =
        replyCmtForm.parentElement.previousElementSibling.previousElementSibling
          .previousElementSibling.firstElementChild.value;
      let replyComment = await fetch("/home/replycomment", {
        method: "POST",
        body: JSON.stringify({ reply: replyInput.value, CmtId: commentId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (replyInput.value) {
        replyInput.value = "";
      }

      replyComment = await replyComment.json();
      const replyList = document.querySelectorAll("#replyList");
      for (let i = 0; i < replyList.length; i++) {
        if (
          replyList[i].dataset.cmtid == replyComment.lastReply[0].comment_id
        ) {
          replyList[i].classList.remove("hidden");
          replyList[i].previousElementSibling.innerHTML = "hide reply";
          replyList[i].innerHTML += `<li>
            <div class="flex items-center space-x-4">
              <input type="hidden" id="commentid" name="commentid" value="${replyComment.lastReply[0].replyId}">
              <div class="flex-shrink-0">
                  <img class="w-8 h-8 rounded-full" src="${replyComment.lastReply[0].profile_image}" alt="user profile">
              </div>
              <div class="flex-1 min-w-0">
                  <p class="text-black-900 text-base">
                      ${replyComment.lastReply[0].first_name} ${replyComment.lastReply[0].last_name}
                  </p>
                  <p class="text-sm text-black-500 ">
                      ${replyComment.lastReply[0].reply_comment}
                  </p>
              </div>
              <div id="replydeleteBtnDiv">
              <button id="replydelete">
                <img src="/assets/images/delete.png" alt="delete" class="w-4 h-4"></img>
              </button>
              </div>
            </div>
          </li>`;
          getNotification(
            replyComment.lastReply[0].comment_id,
            "your comment is reply"
          );
        }
      }
    }
    replycmtDelete();
  });
}

function allReply(allReplycmt) {
  for (let i = 0; i < allReplycmt.allReply.length; i++) {
    const cmtid = document.querySelectorAll("#replyList");
    for (let j = 0; j < cmtid.length; j++) {
      if (cmtid[j].dataset.cmtid == allReplycmt.allReply[i].id) {
        cmtid[j].innerHTML += `<li>
        <div class="flex items-center space-x-4">
        <input type="hidden" id="commentid" name="commentid" value="${
          allReplycmt.allReply[i].replyId
        }">
          <div class="flex-shrink-0">
              <img class="w-8 h-8 rounded-full" src="${
                allReplycmt.allReply[i].profile_image
              }" alt="user profile">
          </div>
          <div class="flex-1 min-w-0">
              <p class="text-black-900 text-base">
                  ${allReplycmt.allReply[i].first_name} ${
          allReplycmt.allReply[i].last_name
        }
              </p>
              <p class="text-sm text-black-500 ">
                  ${allReplycmt.allReply[i].reply_comment}
              </p>
          </div>
          <div class="replydeleteBtnDiv">
          ${
            allReplycmt.allReply[i].reply_by == allReplycmt.logedUserId
              ? `<button id="replydelete" class="mt-4">
          <img src="/assets/images/delete.png" alt="delete" class="w-4 h-4"></img>
       </button>`
              : ""
          }
          </div>
        </div>
        </li>`;
      }
    }
  }
  replycmtDelete();
}

function viewbtnToggle() {
  let viewReplyBtn = document.querySelectorAll("#viewbtn");
  viewReplyBtn.forEach((ele) => {
    ele.addEventListener("click", () => {
      if (ele.innerHTML == "view reply") {
        document.querySelectorAll("#replyList").forEach((element) => {
          element.classList.add("hidden");
          element.previousElementSibling.innerHTML = "view reply";
        });
        ele.innerHTML = "hide reply";
        ele.nextElementSibling.classList.remove("hidden");
      } else {
        ele.innerHTML = "view reply";
        ele.nextElementSibling.classList.add("hidden");
      }
    });
  });
}

function replycmtDelete() {
  const replyDeletebtn = document.querySelectorAll("#replydelete");

  replyDeletebtn.forEach((ele) => {
    ele.addEventListener("click", async () => {
      ele.parentElement.parentElement.parentElement.remove();

      await fetch("/home/replydelete", {
        method: "POST",
        body: JSON.stringify({
          replyId: ele.parentElement.parentElement.firstElementChild.value,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  });
}

async function getNotification(comment_id, content) {
  let socket = io();

  let notificationData = await fetch(
    `/notification/getCommentReplyNotification`,
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ comment_id: comment_id, content: content }),
    }
  );

  notificationData = await notificationData.json();

  if (notificationData["result"] != "") {
    socket.emit("notification-message", {
      id: notificationData["result"],
      data: notificationData["userDetail"][0],
      content: content,
    });
    socket.emit("end");
  }
}
