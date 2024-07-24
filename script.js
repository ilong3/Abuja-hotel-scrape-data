fetch("/hotelsData.json")
  .then((response) => response.json())
  .then((data) => {
    const tableBody = document
      .getElementById("hotelsTable")
      .querySelector("tbody");
    data.forEach((hotel) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td title="${hotel.name}">${hotel.name}</td>
        <td title="${hotel.location}">${hotel.location}</td>
        <td title="${hotel.ratings}">${hotel.ratings}</td>
        <td title="${hotel.starRating || "N/A"}">${
        hotel.starRating || "N/A"
      }</td>
        <td title="${hotel.reviews}">${hotel.reviews}</td>
        <td title="${hotel.descriptions}">${hotel.descriptions}</td>
      `;
      tableBody.appendChild(row);
    });
  })
  .catch((error) => console.error("Error fetching the data:", error));
