fetchie
=======

> enhanced fetch api

Author: Ash Zhang


基本用法
-------

```javascript
import fetchie from 'fetchie';
```


支持的方法：get、post、put、del（delete）、head

最后必须用`.then`才会正式发出请求

```javascript
fetchie
  .get('/gifts')
  .then(function (res) {
    console.log(this.toString(), res);
  });
```

### `.query(params)`

以下请求会转化成：`/gift?pageNum=1&pageSize=16`

```javascript
fetchie
  .get('/gifts')
  .query({
    pageNum: 1,
    pageSize: 16
  })
  .then(function (res) {
    console.log(this.toString(), res);
  });
```

### `.send(data)`

发送 json 数据

```javascript
fetchie
  .post('/gifts')
  .send({
    name: 'New Gift'
  })
  .then(function (res) {
    console.log(this.toString(), res);
  });
```

### `.append(name, file, fileName)`

添加文件，用在 then 之前，send 之后

```javascript
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
```

### `.set(header)`

添加 header

### `.setType(contentType)`

设置 Content-Type，支持`json`、`html`、`text`或`xml`

### `.accept(type)`

设置 Accept

### `.cors(needCors)`

是否需要跨域

### `.prefix(host)`

为 url 添加前缀，以下请求的 url 是：`//localhost:9090/gifts`

```javascript
fetchie
  .get('/gifts')
  .prefix('//localhost:9000')
  .then(function (res) {
    console.log(this.toString(), res);
  });
```

### `.timeout(ms)`

设置超时（毫秒）

### `.handleError(cb)`

处理请求的错误返回，必须在 then 之前

```javascript
fetchie
  .get('/gifts')
  .handleError(function (error) {
    console.error(error);
  })
  .then(function (res) {
    console.log(this.toString(), res);
  });
```

全局设置
-------

### `.use(middleware)`

用 use 添加全局的 middleware

```javascript
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
```

所有的请求都会添加前缀、跨域、并在 1 秒内 timeout

### `.success(cb)` 和 `.error(cb)`

全局性的成功和失败回调

```javascript
fetchie
  .success(function (res) {
    if (res && res.success === false) {
      throw res;
    }
  })
  .error(function (error) {
    console.error('Global Error:', this.toString(), error);
  });
```

Mock 数据
--------

可以添加本地 mock，配合 hot-loader 实现即时刷新的数据 mock，非常方便

```javascript
import fetchie, { fetchMock } from 'fetchie';
import mockData from './mock-data.json';

fetchie
  .use(fetchieMock(mockData))
```

mock-data.json 的格式如下：路径-请求方法-数据

路径的格式和 express 相同

```javascript
{
  "gifts/:id?": {
    "get": [
      {
        "id": 1,
        "name": "Gift 1"
      },
      {
        "id": 2,
        "name": "Gift 2"
      }
    ],
    "post": {
      "name": "$$name$$"
    },
    "put": {
      "id": 3
    },
    "error": {
      "error": true
    }
  }
}
```

注：`error` 下为请求错误时的返回数据，要 mock 一个错误回调，只需插入一个`.mockError()`：

```javascript
fetchie
  .get('/gifts')
  .query({
    pageNum: 1,
    pageSize: 16
  })
  .mockError()
  .then(function (res) {
    console.log(this.toString(), res);
  });
```
