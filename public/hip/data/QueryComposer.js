define(["js/data/Query", "underscore"], function (Query, _) {

    var undefined;

    return {

        compose: function (query) {

            query = query.query;

            var ret = query.where ? this.translateOperator(query.where) : {};

            if (query.sort && query.sort.length) {
                var sort = query.sort[0];
                if (sort) {
                    ret.sortFields = sort.field;
                    ret.sortDirection = sort.direction == 1 ? "ASC" : "DESC";
                }
            }

            return ret;
        },

        translateOperator: function (operator, depth) {
            depth = depth === undefined ? 0 : depth;
            var name = operator.operator;
            if (operator instanceof Query.Where) {
                return this.translateExpressions(operator.expressions, depth + 1);
            } else if (operator instanceof Query.Comparator) {
                if (name === "eql") {
                    var ret = {};
                    ret[operator.field] = operator.value;
                    return ret;
                }
            }

            return {};
        },

        translateExpressions: function (expressions, depth) {
            var ret = {};
            for (var i = 0; i < expressions.length; i++) {
                _.extend(ret, this.translateOperator(expressions[i], depth));
            }
            return ret;
        }

    };

});