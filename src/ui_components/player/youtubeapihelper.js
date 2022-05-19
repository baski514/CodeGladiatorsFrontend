import {YOUTUBE_API,YOUTUBE_TOKEN} from '../../backend'

export const getDuration = (videoId) => {
    console.log(
      `${YOUTUBE_API}${videoId}&part=contentDetails&key=${YOUTUBE_TOKEN}`
    );
    debugger;
    return fetch(`${YOUTUBE_API}${videoId}&part=contentDetails&key=${YOUTUBE_TOKEN}`, {
        method: "GET",
    })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const parseDurationHeler = (duration) => {
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    // Remove PT from string ref: https://developers.google.com/youtube/v3/docs/videos#contentDetails.duration
    duration = duration.replace("PT", "");

    // If the string contains hours parse it and remove it from our duration string
    if (duration.indexOf("H") > -1) {
      let hours_split = duration.split("H");
      hours = parseInt(hours_split[0]);
      duration = hours_split[1];
    }

    // If the string contains minutes parse it and remove it from our duration string
    if (duration.indexOf("M") > -1) {
      let minutes_split = duration.split("M");
      minutes = parseInt(minutes_split[0]);
      duration = minutes_split[1];
    }

    // If the string contains seconds parse it and remove it from our duration string
    if (duration.indexOf("S") > -1) {
      let seconds_split = duration.split("S");
      seconds = parseInt(seconds_split[0]);
    }

    // Math the values to return seconds
    //return hours * 60 * 60 + minutes * 60 + seconds;
    let retVal = "";
    if(hours) retVal = hours + " H: "
    if (minutes) retVal+= minutes + " Min: ";
    if (seconds) retVal += seconds + " Sec";
    return retVal;
}


export const getIdfromURL = (url) => {
  var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : false;
};