# Imagex srcset

A Library for work with images from [Imagex](http://imagex.io/).
The script create srcset or update the src attribute in an img tag (or the background-image for other elements) when the browser was resized.

### Getting started with imagex srcset

#### Install via bower
`$ bower install imagex.srcset.js --save`

include script and run imagexSrcset when page was loaded.

By default imagexSrcset runs for all elements with the `data-srcset-id` attribute.

```html
<script src="imagex.srcset.js"></script>
<script>imagexSrcset()</script>
```

run for selected elements:

```html
<script>
    //select one element
    var element = document.querySelector('.responsive');
    imagexSrcset(element);
    //select many elements
    var elements = document.querySelectorAll('img');
    imagexSrcset(elements);
</script>
```

Use the `data-srcset-id` attribute for set id of the image:

```html
<img src="default.jpg"
    data-srcset-id="imagex-image-id"
    alt="">
```

```html
<div data-srcset-id="imagex-image-id"
     data-srcset-type="auto" >
</div>
```

###Properties

Use the `data-srcset-type` attribute for set type of the image

default: `original`

possible options:

* horizontal
* extra
* square
* vertical
* original
* auto (auto detect type by screen resolution)

###Mobile support

For mobile support it is crucial to set the viewport ``meta`` tag to ``device-width``

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```






