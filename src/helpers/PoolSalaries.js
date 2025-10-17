// Steps to get draftkings data
    // Find a tournament on https://www.draftkings.com/lobby#/GOLF
        // Below table select "Export to CSV"
            // Upload to Google Drive
                // Open with Sheets
                    // Build object dfsSalaries in PoolSalaries.js

// Sample

// Does not need to be Object
// {
//     year: null,
//     tournamentId: null,
//     salaries: null
// } 

// Instead just pass array and useEffect [readyToCalculateDfsSalaries] will format entire object to be stored



// Need to account for 2 WD players

// [
//     {name: "abc", salary : 0}
// ]


export const dfsSalaries = [
    { name: "Scottie Scheffler", salary: 12800 },
];