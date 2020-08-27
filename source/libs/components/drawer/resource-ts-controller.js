import _ from 'lodash';
import { xhr } from '../../utils';

class ResourceTSController {
  constructor() {
    this.isAborted = false;
  }

  loadTimestamps = (sources, callback) => {
    _.every(sources, async (source, index) => {
      const [ts, err] = await xhr(source, {
        method: 'HEAD',
        fetchResHeader: 'Memento-Datetime'
      });
      console.log('source', source, index);
      if (!this.isAborted) {
        callback(ts, err, index);
      }
      return !this.isAborted;
    });
  };

  reset() {
    this.isAborted = false;
  }

  abort = () => {
    this.isAborted = true;
  };
}

export const resourceTSController = new ResourceTSController();
