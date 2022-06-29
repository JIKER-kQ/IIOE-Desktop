import { app } from 'electron';
import { EOL } from "os"

export class LogManager {
  public static appLog(level, message) {
    const origMsg = message
    const fs = require('fs');
    const path = require('path');
    message += EOL;
    if (level === 'info') {
      console.log(origMsg)
      fs.appendFileSync(path.join(app.getAppPath(), 'app-info.log'), message)
    } else if (level === 'error') {
      console.error(origMsg)
      fs.appendFileSync(path.join(app.getAppPath(), 'app-error.log'), message)
    }
  }
}
