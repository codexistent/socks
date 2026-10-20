import { connectToDatabase } from "../database/mongoose";

async function main() {
    try {
        await connectToDatabase();

        // If connectToDatabase resolves without throwing, connection is OK
        console.log("OK: DB connection succeeded.");
        process.exit(0);
    } catch (error) {
        console.log("ERROR: DB connection failed: " + error);
        process.exit(1);
    }
}

main();