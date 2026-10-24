(function () {
  function loadRoomTypes() {
    const first = document.querySelector(".js-room-pref1");
    const second = document.querySelector(".js-room-pref2");
    const third = document.querySelector(".js-room-pref3");
    if (!first) return;

    fetch("/get-rooms", { credentials: "include", cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Room types request failed: " + response.status);
        return response.json();
      })
      .then((rooms) => {
        const options = rooms.map((room) => {
          const type = String(room.roomType || "");
          const capacity = room.capacity || 3;
          return `<option value="${type.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">${type} (${capacity} students)</option>`;
        }).join("");

        first.innerHTML = options || '<option value="">No room types available</option>';
        if (second) second.innerHTML = '<option value="">-- None --</option>' + options;
        if (third) third.innerHTML = '<option value="">-- None --</option>' + options;
      })
      .catch((error) => console.error("Unable to load room types:", error));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadRoomTypes);
  } else {
    loadRoomTypes();
  }
})();
