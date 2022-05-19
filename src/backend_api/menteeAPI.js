import { API } from "../backend";
const MENTEE_BASE_URL = API + "api/mentee/";

export const httpsGET = (tokens, resourceURL) => {
    console.log("ResourceURL",resourceURL)
    return fetch(`${MENTEE_BASE_URL}${resourceURL}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokens ? tokens.idToken : ""}`,
            uid: `${tokens ? tokens.uid : ""}`,
        },
    })
        .then((response) => {
            return response.json();
        })
        .catch((err) => console.log(err));
};

export const httpsPOST = (tokens, resourceURL, body) => { 
    return fetch(`${MENTEE_BASE_URL}${resourceURL}`, {
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
    return fetch(`${MENTEE_BASE_URL}${resourceURL}`, {
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