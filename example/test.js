/**
 * Created by AshZhang on 15/12/24.
 */


import fetchie from '../src/fetchie';
import fetchieMock from '../src/mock';
import mockData from './mock-data.json';


fetchie
  .use(function () {
    this.prefix('//localhost:9000');
  })
  .use(function () {
    this.timeout(1000);
  })
  .use(function () {
    this.cors(true);
  })
  .use(fetchieMock(mockData))
  .success(function (res) {
    console.log('Global Success:', this.toString(), res);
  })
  .success(function (res) {
    if (res && res.success === false) {
      throw res;
    }
  })
  .error(function (error) {
    console.error('Global Error:', this.toString(), error);
  });


fetchie
  .get('/gifts')
  .query({
    pageNum: 1,
    pageSize: 16
  })
  //.mockError()
  .then(function (res) {
    console.log(this.toString(), res);
  });

fetchie
  .post('/gifts')
  .send({
    name: 'New Gift'
  })
  .then(function (res) {
    console.log(this.toString(), res);
  });

fetchie
  .put('/gifts')
  .send({
    name: 'New Gift'
  })
  .then(function (res) {
    console.log(this.toString(), res);
  });

fetchie
  .del('/gifts')
  .send({
    name: 'New Gift'
  })
  .then(function (res) {
    console.log(this.toString(), res);
  });

fetchie
  .head('/gifts')
  .query({
    pageNum: 1,
    pageSize: 16
  })
  .accept('text')
  .then(function (res) {
    console.log(this.toString(), res);
  });


document.getElementById('file').addEventListener('change', function (e) {
  var file = e.target.files[0];

  fetchie
    .post('/post')
    .send({
      pageNum: 1,
      pageSize: 16
    })
    .append('file', file, file.name)
    .then(function (res) {
      console.log('File sent:', res);
    })
});
