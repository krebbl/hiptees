define(["js/data/Entity", "hip/model/Product", "hip/entity/Size"], function (Entity, Product, Size) {

    return Entity.inherit("hip.entity.BasketItem",{
        schema: {
            product: Product,
            quantity: Number,
            size: Size
        },
        defaults: {},

        getSize: function(){
            var sizes = this.get('product.productType.sizes');
            if(sizes){
                var sizeId = this.get('size.id');
                return sizes.find(function(s){
                    return s.get('id') == sizeId;
                })
            }
            return null;
        }
    })
});