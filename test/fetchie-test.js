/**
 * Created by AshZhang on 15/12/25.
 */


import fetchie from '../src/fetchie';


describe('fetchie', () => {
  const URL = '/fetch';

  describe('http methods', () => {

    it('.get(url)', () => {
      const req = fetchie.get(URL);

      expect(req.url).toEqual(URL);
      expect(req.method.toLocaleLowerCase()).toEqual('get');
    });

    it('.post(url)', () => {
      const req = fetchie.post(URL);

      expect(req.url).toEqual(URL);
      expect(req.method.toLocaleLowerCase()).toEqual('post');
    });

    it('.put(url)', () => {
      const req = fetchie.put(URL);

      expect(req.url).toEqual(URL);
      expect(req.method.toLocaleLowerCase()).toEqual('put');
    });

    it('.del(url)', () => {
      const req = fetchie.del(URL);

      expect(req.url).toEqual(URL);
      expect(req.method.toLocaleLowerCase()).toEqual('delete');
    });

    it('.head(url)', () => {
      const req = fetchie.head(URL);

      expect(req.url).toEqual(URL);
      expect(req.method.toLocaleLowerCase()).toEqual('head');
    });
  });


  describe('.use(middleware)', () => {

    it('single middleware', () => {
      const prefix = '//localhost:9000';

      fetchie.use(function () {
        this.prefix(prefix);
      });

      const req = fetchie.get(URL);

      req.then(() => {});

      expect(req._urlPrefix).toEqual(prefix);
    });

    it('linked middleware', () => {
      const query_1 = {
          id: 1
        },
        query_2 = {
          type: 'json'
        },
        data = {
          name: 'Ash'
        };

      fetchie
        .use(function () {
          this.query(query_1);
        })
        .use(function () {
          this.send(data)
        });

      const req = fetchie.post(URL).query(query_2);

      req.then(() => {});

      expect(req._queries.id).toEqual(query_1.id);
      expect(req._queries.type).toEqual(query_2.type);
      expect(req.data).toEqual(data);
    });
  });


  describe('.success(cb)', () => {
    const cb = jasmine.createSpy();

    it('add a global success callback', () => {
      fetchie.success(cb);

      expect(fetchie._successHandlers[0]).toEqual(cb);

      fetchie.get(URL).then(() => {});
    });
  });


  describe('.error(cb)', () => {
    const cb = error => {
      console.log(error);
    };

    it('add a global error callback', () => {
      fetchie.error(cb);

      expect(fetchie._errorHandlers[0]).toEqual(cb);

      fetchie.get(URL).then(() => {});
    });
  });
});
