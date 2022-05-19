import React from "react";
import "../../styles/corousal.css";
//import bgbanner from "../../assets/blog-banner.png";

export default function Corousal({dailyUpdate}) {
    
    return (
        <div className="carousel hidden md:block">
            <div className="carousel-inner max-h-96">
                {dailyUpdate && dailyUpdate.map((update, index) => {
                    return (
                        <>
                            <input
                                className="carousel-open hidden"
                                type="radio"
                                id={`carousel-${index+1}`}
                                name="carousel"
                                aria-hidden="true"
                                checked="true"
                            />
                            <div className="carousel-item">
                                <img className="object-cover w-full" alt="" src={update.banner_url} />
                                {/* <div className="absolute inset-1/2">
                                    <p>this is message</p>
                                    <button
                                        type="button"
                                        className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 border border-pink-700"
                                    >
                                        Learn More
                                    </button>
                                </div> */}
                            </div>
                            
                        </>
                    )
                })}
                <label htmlFor="carousel-3" className="carousel-control prev control-1">‹</label>
                <label htmlFor="carousel-2" className="carousel-control next control-1">›</label>
                <label htmlFor="carousel-1" className="carousel-control prev control-2">‹</label>
                <label htmlFor="carousel-3" className="carousel-control next control-2">›</label>
                <label htmlFor="carousel-2" className="carousel-control prev control-3">‹</label>
                <label htmlFor="carousel-1" className="carousel-control next control-3">›</label>
                <ol className="carousel-indicators">
                    <li>
                        <label htmlFor="carousel-1" className="carousel-bullet">•</label>
                    </li>
                    <li>
                        <label htmlFor="carousel-2" className="carousel-bullet">•</label>
                    </li>
                    <li>
                        <label htmlFor="carousel-3" className="carousel-bullet">•</label>
                    </li>
                </ol>
            </div>
        </div>

        // <div className="carousel">
        //     <div className="carousel-inner max-h-96">
        //         <input className="carousel-open hidden" type="radio" id="carousel-1" name="carousel" aria-hidden="true" checked="checked"/>
        //         <div className="carousel-item">
        //             <img className="object-fill" src="http://fakeimg.pl/2000x800/0079D8/fff/?text=Without"/>
        //         </div>
        //         <input className="carousel-open hidden" type="radio" id="carousel-2" name="carousel" aria-hidden="true" />
        //         <div className="carousel-item">
        //             <img className="object-cover w-full" src="http://fakeimg.pl/2000x800/DA5930/fff/?text=JavaScript"/>
        //         </div>
        //         <input className="carousel-open hidden" type="radio" id="carousel-3" name="carousel" aria-hidden="true" />
        //         <div className="carousel-item">
        //             <img className="object-cover w-full" src="http://fakeimg.pl/2000x800/F90/fff/?text=Carousel"/>
        //         </div>
        //         <label htmlFor="carousel-3" className="carousel-control prev control-1">‹</label>
        //         <label htmlFor="carousel-2" className="carousel-control next control-1">›</label>
        //         <label htmlFor="carousel-1" className="carousel-control prev control-2">‹</label>
        //         <label htmlFor="carousel-3" className="carousel-control next control-2">›</label>
        //         <label htmlFor="carousel-2" className="carousel-control prev control-3">‹</label>
        //         <label htmlFor="carousel-1" className="carousel-control next control-3">›</label>
        //         <ol className="carousel-indicators">
        //             <li>
        //                 <label htmlFor="carousel-1" className="carousel-bullet">•</label>
        //             </li>
        //             <li>
        //                 <label htmlFor="carousel-2" className="carousel-bullet">•</label>
        //             </li>
        //             <li>
        //                 <label htmlFor="carousel-3" className="carousel-bullet">•</label>
        //             </li>
        //         </ol>
        //     </div>
        // </div>
    );
}
