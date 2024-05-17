export async function notification(postId,content) {
    let messages = document.getElementById("messages");
    let socket = io();
  
    let notificationData =await fetch(`/notification/postUserId`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
  
      body: JSON.stringify({ postId: postId,content:content }),
    })
  
    notificationData= await notificationData.json()
     
        if (notificationData["result"] != "") {
          socket.emit("notification-message", {
            id: notificationData["result"],
            data: notificationData["userDetail"][0],
          });
          
        }
     
  }





  