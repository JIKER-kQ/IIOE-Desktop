import React from 'react';
// import { useHistory } from 'react-router';

const { dialog } = require('electron').remote;

export default function PlayListScreen() {
  // const history = useHistory();
  return (
    <div className="playlist-container">
      <button
        type="button"
        onClick={() => {
          // history.goBack();
          dialog.showOpenDialog({
            properties: ['openDirectory'],
          });
        }}
      >
        ssssxxxssss
      </button>
      {/* <input type="file" multiple /> */}
    </div>
  );
}
