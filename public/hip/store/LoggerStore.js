define(["hip/store/Store"], function(Store){

    return Store.inherit({
        handlesAction: function(ns, action){
            return true;
        },
        beforeAll: function(payload, action, ns){
            //console.log(payload, action, ns);
        }
    })

});