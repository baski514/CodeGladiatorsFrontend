import React from "react";
import Navbar from "./navbar/Navbar";

const Base = (props) => {
    const { children, history, activeTabName, pathList } = props;

    return (
            <div className="antialiased text-gray-900 h-screen overflow-auto" style={{backgroundColor:"#f3f2ef"}}>
                <Navbar history={history} activeTabName={activeTabName} pathList={pathList}/>
                {children}
            </div>
    );
 
}

export default Base;