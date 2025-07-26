const ws = new WebSocket(url);
ws.addEventListener("open", () => {
  ws.addEventListener("message", (e) => {
    document.getElementById("body").innerHTML = e.data;
  });
});
