const fs = require('node:fs');
const path = require('path')
const parser = require("gherkin-parse");
const { v4: uuidv4 } = require('uuid');
const { platform } = process;
const locale = path[platform === `win32` ? `win32` : `posix`];

//TODO args, maybe env vars for paths
const featuresPath = './features/'.split(path.sep).join(locale.sep);
const collectionsPath = './collections/'.split(path.sep).join(locale.sep);;

featureFiles = fs.readdirSync(featuresPath).filter(
    featureFile => path.extname(featureFile) === '.feature'
);

// Main - Create collections from feature files
createCollections(featureFiles);

//TODO make a lib

function createCollections(featureFiles){
    featureFiles.forEach(function(featureFile){
        var gherkin = parser.convertFeatureFileToJSON(featuresPath + featureFile);
    
        var postmanFeature = {
            info: createCollectionInfo(gherkin.feature.name),
            item: createCollectionItems(gherkin)
        }
    
        var collectionFilename = collectionsPath + postmanFeature.info.name.replace(/\s/g, '-') + ".postman_collection.json";
        var output = JSON.stringify(postmanFeature);
    
        if (!fs.existsSync(collectionsPath)){
            fs.mkdirSync(collectionsPath);
        }

        fs.writeFileSync(collectionFilename, output);
    });
}

function createCollectionInfo(featureName){
    return {
        _postman_id: uuidv4(),
        name: "Feature " + featureName,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        //_exporter_id: 0 // Not sure what this is for...
    };
}

function createCollectionItems(gherkin){
    var collectionItems = [];

    gherkin.feature.children.forEach(function(scenario){
        if(scenario.keyword === "Background"){
            collectionItems.push(createBackground(scenario));
        }

        if(scenario.keyword === "Scenario"){
            collectionItems.push(createScenario(scenario));
        }
    });

    return collectionItems;
}

function createBackground(scenario){
    var testQueryItem = [];

    scenario.steps.forEach(function(step){
        var stepsScript = createStepsScript(" Add test function ");

        testQueryItem.push({
            name: step.keyword + step.text,
            event: createPostmanEvents(stepsScript),
            request: createTestRequestStub(),
            response: []
        });
    });

    var scenarioItem = {
        name: scenario.keyword,
        item: testQueryItem
    };

    return scenarioItem;
}

function createScenario(scenario){
    var stepsScript = [];

    scenario.steps.forEach(function(step){
        stepsScript = stepsScript.concat(createStepsScript(step.keyword + step.text));
    });

    var testQueryItem = {
        name: "Test Query",
        event: createPostmanEvents(stepsScript),
        request: createTestRequestStub(),
        response: []
    };

    var scenarioItem = {
        name: "Scenario: " + scenario.name,
        item: [testQueryItem]
    };

    return scenarioItem;
}

function createTestRequestStub(){
    return {
        method: "GET",
        header: [],
        url: {
            raw: "{{base_url}}/\<add test endpoint\>",
            protocol: "http",
            host: ["{{host}}"],
            port: "{{port}}"
        }
    };
}

function createStepsScript(stepDefinition){
    return [
        "pm.test(\"" + stepDefinition + "\", function () {",
        "  // Add test code",
        "});"
    ];
}

function createPostmanEvents(stepsScript){
    return [{
        listen: "test",
        script: {exec: stepsScript},
        type: "text/javascript"
    }];
}
