/*
Copyright (c) 2026 MongoDB Inc.

DISCLAIMER: THESE CODE SAMPLES ARE PROVIDED FOR EDUCATIONAL AND ILLUSTRATIVE PURPOSES ONLY,
TO DEMONSTRATE THE FUNCTIONALITY OF SPECIFIC MONGODB FEATURES. 
THEY ARE NOT PRODUCTION-READY AND MAY LACK THE SECURITY HARDENING, ERROR HANDLING, AND TESTING REQUIRED FOR A LIVE ENVIRONMENT.
YOU ARE RESPONSIBLE FOR TESTING, VALIDATING, AND SECURING THIS CODE WITHIN YOUR OWN ENVIRONMENT BEFORE IMPLEMENTATION. 
THIS MATERIAL IS PROVIDED "AS IS" WITHOUT WARRANTY OR LIABILITY.
*/
import prompts from 'prompts';
import chalk from 'chalk';
import { MongoClient } from 'mongodb';
import { demo_1, demo_2 } from './demo.js';

async function run() {
    // input connection string
    const connResp = await prompts({
        type: 'text',
        name: 'value',
        message: 'Please enter the database connection string:',
    });
    const connStr = connResp.value;

    // input database name
    const dbResp = await prompts({
        type: 'text',
        name: 'value',
        message: 'Please enter the database name:',
    });
    const dbName = dbResp.value;

    // input collection name
    const collResp = await prompts({
        type: 'text',
        name: 'value',
        message: 'Please enter the collection name:',
    });
    const collName = collResp.value;

    // input demo #
    const demoResp = await prompts({
        type: 'select',
        name: 'value',
        message: 'Please choose a demo to run:',
        choices: [
            { title: 'Create Search Index', value: '1' },
            { title: 'Query Search Index', value: '2' },
            { title: 'Exit', value: '3' }
        ]
    });
    const demoMode = demoResp.value;

    if (demoMode === '3') {
        console.log(chalk.blue('Exiting the application. Goodbye!'));
        process.exit(0);
    }

    console.log(chalk.green(`\n🚀 Attempting to connect to: ${connStr}`));

    let client = new MongoClient(connStr);
    try {
        await client.connect();
        let db = client.db(dbName);
        let coll = db.collection(collName);
        console.log(chalk.green('✅ Successfully connected to the database!'));

        if (demoMode === '1') {
            console.log(chalk.blue('\n🔧 Running Demo 1: Creating an Atlas Search Index...'));
            await demo_1(coll);
        } else if (demoMode === '2') {
            console.log(chalk.blue('\n🔍 Running Demo 2: Querying the Atlas Search Index...'));
            // NINO input
            let ninoResp = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the NINO value to search for:',
            });
            let nino = ninoResp.value;

            // status input
            let statusResp = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the currentStatus.value to search for (default SUBMITTED):',
            });
            let status = statusResp.value || 'SUBMITTED';

            // date range input
            let dateStartResp = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the createdAt date start (YYYY-MM-DD) to search for (default 2026-02-25):',
            });
            let dateStart = dateStartResp.value ? new Date(dateStartResp.value) : new Date("2026-02-25");
            let dateEndResp = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the createdAt date end (YYYY-MM-DD) to search for (default 2026-02-26):',
            });
            let dateEnd = dateEndResp.value ? new Date(dateEndResp.value) : new Date("2026-02-26");

            // valueInPence range input
            let valueInPenceStartResp = await prompts({
                type: 'number',
                name: 'value',
                message: 'Enter the valueInPence start to search for (default 0):',
            });
            let valueInPenceStart = valueInPenceStartResp.value || 0;
            let valueInPenceEndResp = await prompts({
                type: 'number',
                name: 'value',
                message: 'Enter the valueInPence end to search for (default 100):',
            });
            let valueInPenceEnd = valueInPenceEndResp.value || 100;

            // sorting
            let sortFieldResp = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the field to sort by (default createdAt):',
            });
            let sortField = sortFieldResp.value || 'createdAt';
            let sortOrderResp = await prompts({
                type: 'select',
                name: 'value',
                message: 'Select the sort order:',
                choices: [
                    { title: 'Ascending', value: 1 },
                    { title: 'Descending', value: -1 }
                ],
            });
            let sortOrder = sortOrderResp.value || 1;
            let limitResp = await prompts({
                type: 'number',
                name: 'value',
                message: 'Enter the number of results to return (default 10):',
            });
            let limit = limitResp.value || 10;
            await demo_2(coll, nino, status, dateStart, dateEnd, valueInPenceStart, valueInPenceEnd, sortField, sortOrder, limit);
        } else {
            console.log(chalk.red('Invalid demo mode selected. Please choose either 1 or 2.'));
        }
    } catch (error) {
        console.error(chalk.red(`Error details: ${error.message}`));
    } finally {
        await client.close();
        console.log(chalk.green('🔒 Database connection closed.'));
    }
}

await run();