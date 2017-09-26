# Yet Another Modal Dialog

## Description

A simple modal dialog using jQuery.

## Usage

Show text in a modal dialog:

```javascript
$.modal().open('Lorem ipsum dolor sit amet, tale sadipscing qui ne, te dicat antiopam torquatos nam.');
```

Open a modal dialog containing the response of an Ajax request:

```javascript
$.modal().ajax('/legal/terms');
```

Show the contents of a DOM element in a modal dialog:

```javascript
$('#form').modal();
```

Open a modal dialog on click:

```javascript
$('.edit').click(function (event) {
    $.modal().ajax('/user/edit', $(event.target).data());
    event.preventDefault();
});
```
