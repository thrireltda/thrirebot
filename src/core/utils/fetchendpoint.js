export default async function(endpoint, method = "GET", headers = null, body = null) {
    const options = { method }
    if (headers) options.headers = headers;
    if (body) options.body = body;
    return await fetch(endpoint, options).then(async response => {
        if (!response.ok)
        {
            const errText = await response.text();
            const error = new Error(errText);
            error.status = response.status;
            throw error;
        }
        return response.json();
    })
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error(error);
    })
}