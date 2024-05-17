let tripId = Number(location.pathname.split("/").pop());
let tripChat;
let userId;
let userName;
let chatLoader = document.querySelector(".chat-loader");
const getTripChat = async () => {
  chatLoader.classList.toggle("hidden")
  let result = await fetch("/displaytrip/gettripchat", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tripId }),
  });
  result = await result.json();
  chatLoader.classList.toggle("hidden")
  tripChat = result.result;
  userId = result.userId;
  userName = result.userName;
  initialAppendChat();
};
getTripChat();

const initialAppendChat = () => {
  tripChat.forEach((item) => {
    let msg = {
      userName: item.user_id == userId ? "You" : item.username,
      message: item.message,
      time: item.created_at,
    };
    if (item.user_id == userId) {
      appendMessage(msg, "outgoing");
    } else {
      appendMessage(msg, "incoming");
    }
  });
  message__area.scrollTop = message__area.scrollHeight;
};

const socket = io();
let textarea = document.querySelector("#textarea");
let message__area = document.querySelector(".message__area");
const sendMessage = document.querySelector("#sendMessage");
textarea.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    insertChat()
  }
});

sendMessage.addEventListener("click",(e)=>{
  e.preventDefault();
  insertChat()
})

async function insertChat(){
  if (textarea.value.trim().length > 150) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Too long message",
    });
  } else if (textarea.value.trim().length <= 0) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Write something Before Send Message",
    });
  } else {
    let msg = {
      user: userId,
      userName: userName,
      tripId: tripId,
      message: textarea.value.trim(),
      time: new Date(),
    };
    let result = await fetch("/displaytrip/insertripchat", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg),
    });

    result = await result.json();
    if (result.success) {
      socket.emit(`trip-chat-message`, msg);
    }
    msg.userName = "You";
    appendMessage(msg, "outgoing");
    message__area.scrollTop = message__area.scrollHeight;
    textarea.value = "";
  }
}

socket.on(`trip-chat-${tripId}`, (msg) => {
  if (msg.user == userId) {
    msg.userName = "You";
    appendMessage(msg, "outgoing");
  } else {
    appendMessage(msg, "incoming");
  }
  message__area.scrollTop = message__area.scrollHeight;
});

let dates = [];
const appendMessage = (msg, type) => {
  let div1 = document.createElement("div");
  let h4 = document.createElement("h4");
  let p = document.createElement("p");
  let time = document.createElement("p");
  h4.classList.add("absolute", "-top-[20px]", "text-[#333]", "text-[12px]");
  div1.classList.add(
    "p-[5px]",
    "rounded-[4px]",
    "mb-[20px]",
    "max-w-[90%]",
    "w-fit",
    "relative"
  );
  p.classList.add("break-all", "text-xl");
  time.classList.add("text-xs", "text-black", "opacity-60");
  p.innerText = msg.message;
  time.innerText = new Date(msg.time).toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (type == "outgoing") {
    div1.classList.add("bg-[#e9eafd]", "text-[#787986]", "ml-auto");
    h4.classList.add("right-[0]");
  } else {
    div1.classList.add("bg-[#8F8BE8]", "text-[#fff]");
    h4.classList.add("left-[0]");
  }
  h4.innerText = msg.userName;
  div1.append(h4);
  div1.append(p);
  div1.append(time);
  let datediv = document.createElement("div");
  datediv.classList.add(
    "mb-6",
    "text-center",
    "text-sm",
    "flex",
    "justify-center"
  );
  datediv.innerHTML = `<p class="opacity-60">${new Date(
    msg.time
  ).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}</p>`;
  if (!dates.includes(new Date(msg.time).toLocaleDateString())) {
    message__area.append(datediv);
    dates.push(new Date(msg.time).toLocaleDateString());
  }
  message__area.append(div1);
};


const emojiPicker = document.querySelector("#emojiPicker")
const forHideEmojiPicker = document.querySelector("#forHideEmojiPicker");

document.querySelector("#emojiPickerBtn").addEventListener("click",(e)=>{
    e.preventDefault();
    emojiPicker.classList.toggle("hidden");
    forHideEmojiPicker.classList.remove("hidden")
  textarea.focus()
})

emojiPicker.addEventListener('emoji-click', (e) =>{
  textarea.value = textarea.value + `${e.detail.unicode}`;
  textarea.focus()
});


forHideEmojiPicker.addEventListener("click",(e)=>{
  e.preventDefault();
  emojiPicker.classList.add("hidden");
  forHideEmojiPicker.classList.add("hidden")
  textarea.focus()
})