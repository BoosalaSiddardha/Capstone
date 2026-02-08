document.addEventListener("DOMContentLoaded", () => {

    const searchBtn = document.getElementById("searchBtn");
    const searchType = document.getElementById("searchType");
    const searchInput = document.getElementById("searchInput");
    const resultsBody = document.getElementById("resultsBody");

    searchBtn.addEventListener("click", performSearch);

    // Allow Enter key to search
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            performSearch();
        }
    });

    function performSearch() {
        const type = searchType.value;
        const value = searchInput.value.trim();

        if (value === "") {
            alert("Please enter a value to search");
            return;
        }

        fetch(`/search?type=${type}&value=${encodeURIComponent(value)}`)
            .then(response => response.json())
            .then(data => {
                resultsBody.innerHTML = "";

                if (data.length === 0) {
                    resultsBody.innerHTML = `
                        <tr>
                            <td colspan="4">No results found</td>
                        </tr>
                    `;
                    return;
                }

                data.forEach(row => {
                    const tr = document.createElement("tr");

                    tr.innerHTML = `
                        <td>${row.crop}</td>
                        <td>${row.pesticide}</td>
                        <td>${row.health_effect}</td>
                        <td>${row.reason}</td>
                    `;

                    resultsBody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error fetching results");
            });
    }
});
