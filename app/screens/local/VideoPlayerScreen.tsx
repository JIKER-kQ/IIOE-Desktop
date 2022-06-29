import React from 'react';
import path from 'path';
import { useLocation, useParams } from 'react-router';
import routes from '../../constants/routes.json';

interface ParamsProps {
  filename: string;
  lessonId: string;
}

export default function VideoPlayerScreen() {
  const { filename, lessonId } = useParams<ParamsProps>();
  const location = useLocation();

  const app =  require('electron').remote.app

  let url = '';
  var urljoin = require('url-join');
  if (location.pathname.indexOf(routes.LOCALPLAYER) > -1) {
    url = urljoin(app.getAppPath(), 'download', filename);
  }
  else {
    url = urljoin(app.getAppPath(), 'offline', lessonId + '.mp4');
  }
  return (
    <div className="player-container">
      <video controls autoPlay disablePictureInPicture>
        <source src={url}/>
      </video>
    </div>
  )
}
