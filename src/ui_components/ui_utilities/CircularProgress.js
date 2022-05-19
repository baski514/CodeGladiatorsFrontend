import { FaTrophy } from "react-icons/fa";

const CircularProgressBar = (props)=>{
    console.log("PropsHere",props)
    const sqSize = props.sqSize;
    // SVG centers the stroke width on the radius, subtract out so circle fits in square
    const radius = (props.sqSize -  props.strokeWidth) / 2;
    // Enclose cicle in a circumscribing square
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    // Arc length at 100% coverage is the circle circumference
    const dashArray = radius * Math.PI * 2;
    // Scale 100% coverage overlay with the actual percent
    const dashOffset = dashArray - dashArray *  props.percentage / 100;

    return (
        <svg

            width={ props.sqSize}
            height={ props.sqSize}
            viewBox={viewBox}>
            <circle
              style={{stroke: '#ddd', fill:'none'}}
              cx={ props.sqSize / 2}
              cy={ props.sqSize / 2}
              r={radius}
              strokeWidth={`${ props.strokeWidth}px`} />
              
            <circle
              style={{stroke:'red',strokeLinecap:'round',strokeLinejoin:'round',strokeDasharray:dashArray,strokeDashoffset:dashOffset,fill:'none'}}
              cx={props.sqSize / 2}
              cy={props.sqSize / 2}
              r={radius}
              
              strokeWidth={`${props.strokeWidth}px`}
              // Start progress marker at 12 O'Clock
              transform={`rotate(-90 ${props.sqSize / 2} ${props.sqSize / 2})`}
           >
               </circle>
               <FaTrophy size={18} className="text-white" x="32%" y="32%" dy=".3em" textAnchor="middle"/>
        </svg>
      );
}
  
export const CircularProgress =(props)=>{
    return (
        <div>
            <CircularProgressBar
              strokeWidth="4"
              sqSize="50"
              percentage={props.percentage}/>
          </div>
      );
  }