// window.addEventListener("load",async (event) => {
// async function dashboard(id) {
 
 
//   let insightDashbord = await fetch(`/insight/insightDashbord`, {
//     method: "post",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ postId: id }),
//   });
//   insightDashbord = await insightDashbord.json();

//   document.getElementById("likesCount").innerHTML =
//     insightDashbord["result"][0].like_count;
//   document.getElementById("commentsCount").innerHTML =
//     insightDashbord["result"][0].comment_count;
  
// }

function openForm(name, title, id) {
  document.getElementById("setContent").innerHTML = title;
  document.getElementById("myForm").style.display = "block";
  document.getElementById(
    "content"
  ).style = `-webkit-filter: blur(52px);-moz-filter: blur(152px);-o-filter: blur(152px);-ms-filter: blur(152px);filter: blur(152px);`;
 
  fetchUsername(name, id);
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
  document.getElementById("content").style = ``;
}

async function fetchUsername(url, id) {
  let fetchUsername = await fetch(`/insight/${url}`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId: id }),
  });
  fetchUsername = await fetchUsername.json();

  let htmlUserData = ``;
  for (let i in fetchUsername["result"]) {
    htmlUserData += `<tr><td class="py-2 px-4 border-b  flex">`;

    let data_user = "";
    if (url == "commentUserName") {
      data_user = fetchUsername["result"][i].comments;
    } else {
      data_user = fetchUsername["result"][i].name;
    }
    htmlUserData += `
          <a href="#">
          <div class="flex" style="height:70px">
              <div class="rounded-t-lg  overflow-hidden flex center">
                  <img src='${fetchUsername["result"][i].profile_image}' alt='Mountain' width="50px" height="50px">
              </div>
              <div class="ml-5" style="margin-left:20px;">
                  <div class="flex items-center">
                      <h2 class="font-semibold ">${fetchUsername["result"][i].username}</h2>
                  </div>
                  <div class="flex items-center">
                 
                  <p class="inline-block " >${data_user}</p>
                  </div>
              </div>
          </div>
            </a>
            `;

    // });

    htmlUserData += `</td></tr>`;
  }

  document.getElementById("setUserName").innerHTML = htmlUserData;
}
