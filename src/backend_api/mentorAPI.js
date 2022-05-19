import { API } from "../backend";
const MENTOR_BASE_URL = API + "api/mentor/";

export const httpsGET = (tokens, resourceURL) => {
    return fetch(`${MENTOR_BASE_URL}${resourceURL}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokens ? tokens.idToken : ""}`,
            uid: `${tokens ? tokens.uid : ''}`,
        },
    })
        .then((response) => {
            return response.json();
        })
        .catch((err) => console.log(err));
};

export const httpsPOST = (tokens, resourceURL, body) => {
    console.log(body);
    return fetch(`${MENTOR_BASE_URL}${resourceURL}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${tokens ? tokens.idToken : ""}`,
            uid: `${tokens ? tokens.uid : ""}`,
        },
        body: JSON.stringify(body),
    })
        .then((response) => {
            return response.json();
        })
        .catch((err) => console.log(err));
};

export const httpsDELETE = (tokens, resourceURL) => {
    return fetch(`${MENTOR_BASE_URL}${resourceURL}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${tokens ? tokens.idToken : ""}`,
            uid: `${tokens ? tokens.uid : ""}`,
        },
    })
        .then((response) => {
            return response.json();
        })
        .catch((err) => console.log(err));
};