let like = document.querySelectorAll(".like");

let flag;
like.forEach((element) => {
  element.addEventListener("click", async () => {
    if (element.src == window.location.origin + "/assets/images/like.png") {
      element.src = "/assets/images/fill-like.png";
      flag = 1;
      notification(element.id, "your post is liked");
    } else {
      element.src = "/assets/images/like.png";
      flag = 0;
    }
    let likeData = await fetch("/home", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ likeId: element.id, flag: flag }),
    });

    likeData = await likeData.json();
    element.parentElement.nextElementSibling.children[0].innerHTML =
      likeData.updateCount[0].like_count + " Likes";
  });
});

async function notification(postId, content) {
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
    if(notificationData["sourceId"]!=notificationData["result"]){
      socket.emit("notification-message", {
        id: notificationData["result"],
        data: notificationData["userDetail"][0],
        content: content,
      });
      socket.emit("end");
    }
  }
}
