if (window.location.pathname == "/userProfile/posts") {
  window.onload = scrolling;
  function scrolling() {
    const searchParams = new URLSearchParams(window.location.search);
    const postId = searchParams.get("post_id");
    const element = document.querySelector(`.post${postId}`);
    console.log(element);
    element.scrollIntoView();
  }
}
