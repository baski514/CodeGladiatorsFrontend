import React from 'react'
import YouTubeHelper from '../player/YoutubePlayer';
import Base from "../Base";

const VideoViewer = ({match, history,location}) => {
    console.log("Match",location)
    return (
        <Base history={history}>
            <div className="grid md:grid-cols-6 sm:grid-cols-1">
                <div className="md:col-span-5 h-full sm:col-span-1">
                    <YouTubeHelper videoId={match.params.videoId} />
                </div>
                <div className="col-span-1 flex flex-col">
                    <div className="bg-purple-500 p-2">
                        <h1 className="text-center text-white">{location.state.courseMaster.name}</h1>
                    </div>
                    <div className="bg-white p-2 flex flex-col rounded-lg m-3">
                    <div className="flex flex-row">
                            <h1 className="text-start text-gray-700 md:text-xl">Module:- </h1>
                            <h1 className="text-start text-gray-700 md:text-xl ml-3">{location.state.sessionDetails.CE_Module__r.Name}</h1>
                        </div>
                        <div className="flex flex-row">
                            <h1 className="text-start text-gray-700 md:text-xl">Session:- </h1>
                            <h1 className="text-center text-gray-700 md:text-xl ml-3">{location.state.sessionDetails.title}</h1>
                        </div>
                        <div className="flex flex-row">
                            <h1 className="text-start text-gray-700 md:text-xl">Agenda:- </h1>
                            <h1 className="text-start text-gray-700 md:text-xl ml-3">{location.state.sessionDetails.sessionAgenda}</h1>
                        </div>
                    </div>
                </div>
            </div>
        </Base>
    );
}
export default VideoViewer;