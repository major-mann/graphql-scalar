const { GraphQLScalarType } = require(`graphql`);
const { Kind } = require(`graphql/language`);

module.exports = new GraphQLScalarType({
    name: `Any`,
    description: `Allows the use of any scalar type except ID (String, Boolean, Int, Float)`,
    serialize(value) {
        return value;
    },
    parseValue(value) {
        return value;
    },
    parseLiteral(ast) {
        switch (ast.kind) {
            case Kind.INT:
            case Kind.FLOAT:
                return parseFloat(ast.value);
            case Kind.BOOLEAN:
                return ast.value === `true`;
            default:
                return ast.value;
        }
    }
});
