self.onmessage = function (e) {
    var data = e.data;

    if (data.filter && data.imageSrc) {

        var image = new Image();

        var s = self;
        image.onload = function () {

            s.$canvas = s.$canvas || fx.canvas();

            // convert the image to a texture
            s.$texture = s.$canvas.texture(image);

            s.$canvas.draw(s.$texture, image.width, image.height);

            s.postMessage(s.$canvas.toDataURL());
        };

        image.src = data.imageSrc;

    }
}