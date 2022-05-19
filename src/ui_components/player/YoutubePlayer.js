import React from "react";
import YouTube from "react-youtube";
import "./player.css"
class YouTubeHelper extends React.Component {
    render() {
        const opts = {
            playerVars: {
                // https://developers.google.com/youtube/player_parameters
                autoplay: 1,
            },
        };

        return (
            <YouTube
                videoId={this.props.videoId}
                opts={opts}
                onReady={this._onReady}
                className="iframe-player"
                containerClassName="video-container"
            />
        );
    }

    _onReady(event) {
        // access to player in all event handlers via event.target
        event.target.playVideo();
    }
}
export default YouTubeHelper;
