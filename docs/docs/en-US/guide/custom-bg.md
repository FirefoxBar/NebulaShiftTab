---
title: Custom Background
---

## Custom Background

Under the "Custom Background", you can select a third-party web service to customize the background.

### API

Suitable for scenarios where you obtain an image address via an API interface and then download the image from that address.

For example, an API might return the following structure:

```json
{
  "height": 1540,
  "ratio": "2367:1540",
  "url": "https://example.com/img380.webp",
  "width": 2367
}
```

Simply enter `$.url` in the expression field.

For more expression syntax, please refer to [JSONata Expressions](./jsonata.mdx).

### Images

Suitable for scenarios where you directly request an image address (this address can be further automatically redirected using a 302 status code).

For example, accessing a certain address might result in the following response:

![img](https://img11.360buyimg.com/ddimg/jfs/t1/397754/39/9503/20844/69a3d91bF41dcbc61/001526e1c8f0f1ac.jpg)

In this case, you can directly enter the address of the image in the address field.
