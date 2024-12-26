/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    console.log(url);
    setTimeout(() => reject(new Error(
      { status: 501, statusText: "Not Implemented" })), 
      300
    );
    fetch(url)
    .then(response => {
      if (!response.ok) {
        // Reject if response is not ok
        return reject(new Error(
          { status: response.status, statusText: response.statusText }
        ));
      }
      return response.json(); // Parsing data
    })
    .then(data => {
      resolve({ data });
    })
    .catch(error => {
      // other issues
      reject(new Error(
        { status: error.status || 500, statusText: error.message || "Network Error" }
      ));
    });
    // On Success return:
    // resolve({data: getResponseObject});
  });
}

export default fetchModel;
