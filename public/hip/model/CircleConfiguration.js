define(["hip/model/ImageConfiguration"], function (ImageConfiguration) {
    return ImageConfiguration.inherit({

        defaults: {
            options: {
                outerRadius: 0.4,
                innerRadius: 0.35,
                center: 0.42
            }
        },

        draw: function (context, canvas) {

            this.callBase();


            if (this.$.image) {
                var width = canvas.width,
                    height = canvas.height,
                    options = this.$.options,
                    center = options.center;


                context.save();
                context.beginPath();
                context.arc(width * 0.5, height * center, width * options.outerRadius, 0, 2 * Math.PI, false);
                //        context.closePath();
                context.arc(width * 0.5, height * center, width * options.innerRadius, 0, 2 * Math.PI, true);

                context.arc(width * 0.5, height * center, width * options.outerRadius * 0.5, 0, 2 * Math.PI, false);
//                context.arc(width * 0.5, height * 0.5, width * options.innerRadius * 0.5, 0, 2 * Math.PI, true);


                context.clip();

                context.rotate(Math.PI);
                var ratio = this.$.image.width / this.$.image.height,
                    fullImageHeight = canvas.height * this.$.scale.y,
                    fullImageWidth = ratio * fullImageHeight;

                context.drawImage(this.$.image, -fullImageWidth * (this.$.offset.x + 1), -fullImageHeight * (this.$.offset.y + 1), fullImageWidth, fullImageHeight);
//                context.rotate(-Math.PI);

                context.restore();

            }

        }

    })
});