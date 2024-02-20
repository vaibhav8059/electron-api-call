const { parseString } = require("xml2js");
const axios = require("axios");
let intervalId;
document.addEventListener("DOMContentLoaded", () => {
	const button = document.getElementById("submit");
	const stopButton = document.getElementById("stop");
	button.addEventListener("click", () => {
		intervalId = setInterval(function () {
			makePostRequest();
			// Add your interval logic here
		}, 5000);
		button.style.display = "none";
		stopButton.style.display = "block";
	});
	stopButton.addEventListener("click", () => {
		clearInterval(intervalId);
		button.style.display = "block";
		stopButton.style.display = "none";
	});
});


async function makePostRequest() {
	try {
		// Replace 'your-api-endpoint' with the actual endpoint
		const url =
			"https://2f4c-2401-4900-1f24-7473-2522-f592-469-a75d.ngrok-free.app";

		// Replace 'your-data' with the data you want to send
		const postData = `<ENVELOPE>
		<HEADER>
			<VERSION>1</VERSION>
			<TALLYREQUEST>Export</TALLYREQUEST>
			<TYPE>Collection</TYPE>
			<ID>Ledger</ID>
		</HEADER>
		<BODY>
			<DESC>
				<STATICVARIABLES>
					 <!-- * Static variables like scfrom,svto,svexport format will not work -->
				 
				</STATICVARIABLES>
			</DESC>
		</BODY>
	</ENVELOPE>`;

		// Make the POST request
		const response = await axios.post(url, postData, {
			headers: {
				"Content-Type": "application/xml",
			},
		});

		// Parse the XML response to JSON
		parseString(
			response.data,
			{ explicitArray: false, ignoreAttrs: true },
			(err, result) => {
				if (err) {
					console.error("Error parsing XML:", err);
				} else {
					// Result is the parsed JSON object
					//   result.ENVELOPE.BODY.DATA.COLLECTION.COMPANY.map(item => console.log(item))
					console.log(result);
					const newData = result.ENVELOPE.BODY.DATA.COLLECTION.LEDGER.map(
						(item, id) => {
							return {
								name: Array.isArray(item["LANGUAGENAME.LIST"]["NAME.LIST"].NAME)
									? item["LANGUAGENAME.LIST"]["NAME.LIST"].NAME[0]
									: item["LANGUAGENAME.LIST"]["NAME.LIST"].NAME,
								type: item.PARENT,
								amount: item.ONACCOUNTVALUE === "" ? 0 : item.ONACCOUNTVALUE,
							};
						}
					);
					// console.log(newData);
					// Post data to database
					function postData(data) {
						const url = "http://localhost:3000/ledger-data";

						fetch(url, {
							method: "POST",
							headers: {
								"Content-Type": "application/json", // Specify the content type as JSON
								// Add any additional headers if needed
							},
							body: JSON.stringify(data), // Convert the data to JSON format
						})
							.then((response) => {
								if (!response.ok) {
									throw new Error(`HTTP error! Status: ${response.status}`);
								}
								return response.json(); // Parse the response body as JSON
							})
							.then((data) => {
								console.log("POST request successful:", data);
							})
							.catch((error) => {
								console.error("Error:", error);
							});
					}
					//call postData function
					postData(newData);
				}
			}
		);
	} catch (error) {
		// Handle errors
		console.error("Error:", error.message);
	}
}
