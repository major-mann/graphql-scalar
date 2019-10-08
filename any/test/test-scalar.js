module.exports = runTest;

const VALUES = [
    1,
    1.2,
    true,
    `Hello world`
];

const assert = require(`assert`);
const { readFileSync } = require(`fs`);
const path = require(`path`);
const chalk = require(`chalk`);
const { graphql } = require(`graphql`);
const { makeExecutableSchema } = require(`graphql-tools`);
const AnyScalar = require(`../src/index.js`);
const typeDefs = readFileSync(path.join(__dirname, `test.graphql`), { encoding: `utf8` });

const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
        Any: AnyScalar,
        Query: {
            echo,
            test: testQuery
        },
        MyTestType: {
            value1: createStaticResolver(VALUES[0]),
            value2: createStaticResolver(VALUES[1]),
            value3: createStaticResolver(VALUES[2]),
            value4: createStaticResolver(VALUES[3])
        }
    }
});

if (!module.parent) {
    runTest()
        .then(
            () => console.log(chalk.bold.green(`✓ All tests passed ✓`)), // eslint-disable-line no-console
            err => console.error( // eslint-disable-line no-console
                chalk.red(`An error occured during test execution: ${err.stack}`)
            )
        );
}

async function runTest() {
    await echoTest(1);
    await echoTest(1.2);
    await echoTest(true);
    await echoTest(false);
    await echoTest(`Hello world`);
    await objectTest();
}

async function echoTest(value) {
    console.info(chalk.yellow(`Echo test of ${JSON.stringify(value)}`)); // eslint-disable-line no-console
    const result = await execQuery(`query { echo(value: ${JSON.stringify(value)}) } `); // eslint-disable-line no-console
    assert.strictEqual(result.echo, value);
    console.info(chalk.green(`Passed`)); // eslint-disable-line no-console
}

async function objectTest() {
    console.info(chalk.yellow(`Object test`)); // eslint-disable-line no-console
    const result = await execQuery(`query { test { value1, value2, value3, value4 } } `);
    assert.strictEqual(result.test.value1, VALUES[0]);
    assert.strictEqual(result.test.value2, VALUES[1]);
    assert.strictEqual(result.test.value3, VALUES[2]);
    assert.strictEqual(result.test.value4, VALUES[3]);
    console.info(chalk.green(`Passed`)); // eslint-disable-line no-console
}

async function execQuery(query, variables) {
    const result = await graphql(schema, query, {
        variables
    });
    if (result.errors) {
        throw result.errors[0];
    }
    return result.data;
}

function echo(source, args) {
    return args.value;
}

function testQuery() {
    return {
        value1: VALUES[0],
        value2: VALUES[1],
        value3: VALUES[2],
        value4: VALUES[3],
    };
}

function createStaticResolver(value) {
    return () => value;
}