/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-continue */
/* eslint-disable camelcase */

export default class Transport {
  constructor(device, logger = console) {
    this.device = device;
    this.slip_reader_enabled = false;
    this.logger = logger;
  }

  get_info() {
    const info = this.device.getInfo();
    return `WebSerial VendorID 0x${info.usbVendorId.toString(16)} ProductID 0x${info.usbProductId.toString(16)}`;
  }

  slip_writer(data) {
    let count_esc = 0;
    let i = 0;
    let j = 0;

    for (i = 0; i < data.length; i++) {
      if (data[i] === 0xC0 || data[i] === 0xDB) {
        count_esc++;
      }
    }
    const out_data = new Uint8Array(2 + count_esc + data.length);
    out_data[0] = 0xC0;
    j = 1;
    for (i = 0; i < data.length; i++, j++) {
      if (data[i] === 0xC0) {
        out_data[j++] = 0xDB;
        out_data[j] = 0xDC;
        continue;
      }
      if (data[i] === 0xDB) {
        out_data[j++] = 0xDB;
        out_data[j] = 0xDD;
        continue;
      }

      out_data[j] = data[i];
    }
    out_data[j] = 0xC0;
    return out_data;
  }

    write = async (data) => {
      const writer = this.device.writable.getWriter();
      const out_data = this.slip_writer(data);
      await writer.write(out_data.buffer);
      writer.releaseLock();
    }

    _appendBuffer(buffer1, buffer2) {
      const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
      tmp.set(new Uint8Array(buffer1), 0);
      tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
      return tmp.buffer;
    }

    /* this function expects complete packet (hence reader reads for atleast 8 bytes. This function is
     * stateless and returns the first wellformed packet only after replacing escape sequence */
    slip_reader(data) {
      let i = 0;
      let data_start = 0;
      let data_end = 0;
      let state = 'init';
      while (i < data.length) {
        if (state === 'init' && data[i] === 0xC0 && data[i + 1] !== 0xC0) {
          data_start = i + 1;
          state = 'valid_data';
          i++;
          continue;
        }
        if (state === 'valid_data' && data[i] === 0xC0) {
          data_end = i - 1;
          state = 'packet_complete';
          break;
        }
        i++;
      }
      // console.log(state, data, data_start, data_end);
      if (state === 'valid_data' && data[data.length - 1] === 0) {
        data_end = data.length - 1;
        state = 'packet_complete';
      }
      if (state !== 'packet_complete') {
        return new Uint8Array(0);
      }

      const temp_pkt = new Uint8Array(data_end - data_start + 1);
      let j = 0;
      for (i = data_start; i <= data_end; i++, j++) {
        if (data[i] === 0xDB && data[i + 1] === 0xDC) {
          temp_pkt[j] = 0xC0;
          i++;
          continue;
        }
        if (data[i] === 0xDB && data[i + 1] === 0xDD) {
          temp_pkt[j] = 0xDB;
          i++;
          continue;
        }
        temp_pkt[j] = data[i];
      }
      const packet = temp_pkt.slice(0, j); /* Remove unused bytes due to escape seq */
      return packet;
    }

    read = async ({ timeout = 0, min_data = 12 } = {}) => {
      let t;
      let packet = null;
      let value;
      let done;
      // this.logger.log(`Read with timeout ${timeout}`);
      const reader = this.device.readable.getReader();
      if (timeout > 0) {
        t = setTimeout(() => {
          reader.cancel();
          reader.releaseLock();
        }, timeout);
      }

      do {
        this.reader = reader;
        // eslint-disable-next-line no-await-in-loop
        const o = await reader.read();
        this.reader = null;
        value = o.value;
        done = o.done;
        if (packet == null) {
          if (value) packet = value;
        } else {
          const p = new Uint8Array(this._appendBuffer(packet.buffer, value.buffer));
          packet = p;
        }
        if (done) {
          break;
        }
      } while (packet.length < min_data);

      if (done) {
        // console.log('timed out', packet);
        // eslint-disable-next-line no-throw-literal
        throw ('timeout');
      } else {
        if (timeout > 0) {
          clearTimeout(t);
        }
        reader.releaseLock();
        if (this.slip_reader_enabled) {
          const val_final = this.slip_reader(packet);
          return val_final;
        }
        return packet;
      }
    }

    rawRead = async () => {
      const reader = this.device.readable.getReader();

      this.reader = reader;
      const o = await reader.read();
      this.reader = null;
      reader.releaseLock();
      return o.value;
    }

    setRTS = async (state) => {
      await this.device.setSignals({ requestToSend: state });
    }

    setDTR = async (state) => {
      await this.device.setSignals({ dataTerminalReady: state });
    }

    connect = async () => {
      await this.device.open({ baudRate: 115200 });
      this.baudrate = 115200;
    }

    disconnect = async () => {
      if (this.reader !== null) {
        this.reader.cancel();
        this.reader.releaseLock();
      }
      await this.device.close();
    }
}
