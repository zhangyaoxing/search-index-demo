/*
Copyright (c) 2026 MongoDB Inc.

DISCLAIMER: THESE CODE SAMPLES ARE PROVIDED FOR EDUCATIONAL AND ILLUSTRATIVE PURPOSES ONLY,
TO DEMONSTRATE THE FUNCTIONALITY OF SPECIFIC MONGODB FEATURES. 
THEY ARE NOT PRODUCTION-READY AND MAY LACK THE SECURITY HARDENING, ERROR HANDLING, AND TESTING REQUIRED FOR A LIVE ENVIRONMENT.
YOU ARE RESPONSIBLE FOR TESTING, VALIDATING, AND SECURING THIS CODE WITHIN YOUR OWN ENVIRONMENT BEFORE IMPLEMENTATION. 
THIS MATERIAL IS PROVIDED "AS IS" WITHOUT WARRANTY OR LIABILITY.
*/
import chalk from 'chalk';

export const demo_1 = async function demo_1(coll) {
    const indexExists = await coll.listSearchIndexes().toArray();
    const def = {
        "mappings": {
            "dynamic": false,
            "fields": {
                "createdAt": {
                    "type": "date"
                },
                "currentStatus": {
                    "fields": {
                        "value": {
                            "analyzer": "lucene.keyword",
                            "searchAnalyzer": "lucene.keyword",
                            "type": "string"
                        }
                    },
                    "type": "document"
                },
                "nino": {
                    "analyzer": "lucene.keyword",
                    "searchAnalyzer": "lucene.keyword",
                    "type": "string"
                },
                "valueInPence": {
                    "type": "number"
                }
            }
        }
    };
    if (indexExists.some(idx => idx.name === 'demo_index')) {
        console.log(chalk.yellow('⚠️  Index "demo_index" already exists. Updating the index definition...'));
        await coll.updateSearchIndex('demo_index', def);
    } else {
        console.log(chalk.blue('🔧 Creating a new Atlas Search Index named "demo_index"...'));
        await coll.createSearchIndex({
            name: 'demo_index',
            definition: def
        });
    }
}

export const demo_2 = async function demo_2(coll, nino, status, dateStart, dateEnd, valueInPenceStart, valueInPenceEnd, sortField, sortOrder) {
    let musts = [];
    if (nino) {
        musts.push({
            'text': {
                'query': nino,
                'path': 'nino'
            }
        });
    }
    if (status) {
        musts.push({
            'text': {
                'query': status,
                'path': 'currentStatus.value'
            }
        });
    }
    if (dateStart && dateEnd) {
        musts.push({
            'range': {
                'path': 'createdAt',
                'gte': dateStart,
                'lte': dateEnd
            }
        });
    }
    if (valueInPenceStart >= 0 && valueInPenceEnd >= 0) {
        musts.push({
            'range': {
                'path': 'valueInPence',
                'gte': valueInPenceStart,
                'lte': valueInPenceEnd
            }
        });
    }
    const searchPipeline = [
        {
            '$search': {
                'index': 'demo_index',
                'compound': {
                    'must': musts
                }
            }
        }
    ];
    if (sortField && sortOrder) {
        searchPipeline.push({
            '$sort': {
                [sortField]: sortOrder
            }
        });
    }
    const results = await coll.aggregate(searchPipeline).toArray();
    console.log(chalk.green(`✅ Found ${results.length} matching documents:`));
    console.log(results);
}