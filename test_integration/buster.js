var config = module.exports;

config["Integration tests"] = {
    environment: "node",
    rootPath: "../",
    tests: [
        "test_integration/**/*-test.js"
    ]
};
