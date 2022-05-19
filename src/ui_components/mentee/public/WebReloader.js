import { useBeforeunload } from "react-beforeunload";
import { useState,useRef,useEffect} from "react";

// let hidden, visibilityChange;

// if (document.hidden !== undefined) {
//     // Opera 12.10 and Firefox 18 and later support
//     hidden = "hidden";
//     visibilityChange = "visibilitychange";
// } 

const NEWFILE = () => {
  const [value, setValue] = useState("");

  useBeforeunload((event) => {
    debugger;
    showLog();
    event.preventDefault();
  });

  return (
    <>
    </>
  );

  function showLog(){
      alert("You eneterd",value);
      console.log("SSSSSS",value);
  }
};

export default NEWFILE;
