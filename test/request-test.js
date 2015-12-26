/**
 * Created by AshZhang on 15/12/25.
 */


import fetchie from '../src/fetchie';


describe('Request', () => {
  const URL = '/request';

  describe('.query(params)', () => {

    it('single query', () => {
      const params = {
          id: 1,
          name: 'Ash'
        },
        req = fetchie.get(URL).query(params);

      expect(req._queries).toEqual(params);
    });

    it('linked queries', () => {
      const param_1 = {
          id: 1
        },
        param_2 = {
          name: 'Ash'
        },
        req = fetchie.get(URL).query(param_1).query(param_2);

      expect(req._queries.id).toEqual(param_1.id);
      expect(req._queries.name).toEqual(param_2.name);
    });
  });

  describe('.send(data)', () => {

    it('single data', () => {
      const data = {
          id: 1,
          name: 'Ash'
        },
        req = fetchie.post(URL).send(data);

      expect(req.data).toEqual(data);
    });

    it('linked data', () => {
      const data_1 = {
          id: 1
        },
        data_2 = {
          name: 'Ash'
        },
        req = fetchie.post(URL).send(data_1).send(data_2);

      expect(req.data.id).toEqual(data_1.id);
      expect(req.data.name).toEqual(data_2.name);
    });
  });

  describe('.append(name, file, fileName)', () => {

    it('single file', () => {
      const req = fetchie.post(URL).append('file', 'fileContent');

      expect(req.formData instanceof FormData).toBeTruthy();
      expect(req.data).toEqual({});
    });

    it('linked files', () => {
      const req = fetchie.post(URL).append('file_1', 'fileContent').append('file_2', 'fileContent');

      expect(req.formData instanceof FormData).toBeTruthy();
      expect(req.data).toEqual({});
    });
  });

  describe('.set(header)', () => {

    it('single header', () => {
      const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        req = fetchie.get(URL).set(headers);

      expect(req.headers.get('accept')).toEqual(headers['Accept']);
      expect(req.headers.get('content-type')).toEqual(headers['Content-Type']);
    });

    it('linked headers', () => {
      const header_1 = {
          'Accept': 'application/json'
        },
        header_2 = {
          'Content-Type': 'application/json'
        },
        req = fetchie.get(URL).set(header_1).set(header_2);

      expect(req.headers.get('accept')).toEqual(header_1['Accept']);
      expect(req.headers.get('content-type')).toEqual(header_2['Content-Type']);
    });
  });

  describe('.setType(type)', () => {
    const type = 'json';

    it('sets `Content-Type`', () => {
      const req = fetchie.get(URL).setType(type);

      expect(req._type).toEqual(type);
    });
  });

  describe('.accept(type)', () => {
    const type = 'json';

    it('sets `Accept`', () => {
      const req = fetchie.get(URL).accept(type);

      expect(req._accept).toEqual(type);
    });
  });

  describe('.cors(needCors)', () => {

    it('CORS mode', () => {
      const req = fetchie.get(URL).cors(true);

      expect(req._cors).toBeTruthy();
    });
  });

  describe('.prefix(prefix)', () => {
    const prefix = '//localhost:9000';

    it('adds a prefix before url', () => {
      const req = fetchie.get(URL).prefix(prefix);

      expect(req._urlPrefix).toEqual(prefix);
    });
  });

  describe('.timeout(ms)', () => {
    const ms = 1000;

    it('the request will abort after some time if no response is received from the server', () => {
      const req = fetchie.get(URL).timeout(ms);

      expect(req._timeout).toEqual(ms);
    });
  });

  describe('.handleError(cb)', () => {
    const cb = () => {};

    it('handles error message with callback(error)', () => {
      const req = fetchie.get(URL).handleError(cb);

      expect(req._errorHandler).toEqual(cb);
    });
  });
});
