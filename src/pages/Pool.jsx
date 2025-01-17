import React, {useState, useEffect, useRef } from "react";
import {
    CircularProgress,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PushPin from '@mui/icons-material/PushPin';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import axios from 'axios';
import * as moment from 'moment'
import "../pool.css"
import { dfsSalaries } from "../helpers/PoolSalaries";


// Link to monitor Rapid API requests (60 starting 1/14/2025)
// https://rapidapi.com/developer/analytics/default-application_10075500


// After tournament wraps, could begin savings player scoring averages
    // Could fetch some legacy rounds if I still have fetches left for month
        // 1 needed for year schedule, 2 more for each tournament to pull tournamentData and leaderboardData
    // "Cut % made since X data" (5/6)
    // EV = salary / strokes under par (can't use old DFS salaries for these calulations)
        // Is there strenth of schedule


// Pricing $25 for first tournament, $20 after - tries to retain players
    // Helps keep the lights on (tooltip: server cost to host site, rapid API call pricing)


// Steps to get tournament ready
// Need to pull in DFS data first
    // Find a tournament on https://www.draftkings.com/lobby#/GOLF
        // Below table select "Export to CSV"
            // Upload to Google Drive
                // Open with Sheets
                    // Build object dfsSalaries in PoolSalaries.js
                        // *Manually input year and tournamentId OR calculate in Pool.jsx file with exceljs?
                            // Could manually upload to Mongo
// Identify if allPlayers contains list of players for year/tournament
    // If not, fetch from rapid API
        // Should automatically store to mongo
// Frontend should automatically display form when DFS data is available (should already have players from above section)


// Need to print list of players not yet found - should be excluded from form?




// CRON job for fetching new data?
    // first need to query /tournament endpoint (contains players)
        // Once tournament starts, pull from /leaderboards endpoint




// 500 is limit for month
// most tournament days in a month in 19
// Assuming I can calculate exact start time (and one final pull at 9pm EST to account for all update),
// could have 1 request every 20 minutes

// 500/20 = 25

// 1 data pull per year for schedule
// 10 data pulls per month for players
// 10 data pull per


// Can begin also pulling in other data from rapidapi (points/earnings/fedex rankings/world ranking - display table to arrange?)



// Allow for excel file upload - make google form first
// Then save to mongo
// Then pull in to page - accommodate for when "data is not available"



// Order of events - starting with first useEffect to identify configuration

// CONFIGURATION === "rapidApi"
    // Initialization calls retrieveScheduleDataRapid() - gets PGA tour season schedule
        // Saves response to scheduleResponse
            // Triggers useEffect [scheduleResponse]
                // Calls calculateScheduleData()
                    // Calls setSchedule() in local state
                    // Calls setActiveTournamentId() and highlightedTournamentId()
                    // Saves schedule to mongo
                        // Once schedule is saved to mongo
                            // Triggers useEffect [schedule]
                                // Calls retrieveTournamentDataRapid() - gets current tournament data
                                    // Saves response to tournamentResponse
                                        // Triggers useEffect [tournamentResponse]
                                            // Calls calculatePlayerData() and saves players to mongo
                                            // Calls calculateCourseData() and saves courses to mongo
                                            // Calls retrieveLeaderboardDataRapid() - gets current tournaments leaderboard
                                                // Saves response to leaderboardResponse
                                                    // Triggers useEffect [leaderboardResponse]
                                                        // Calls calculateLeaderboardData()
                                                            // Saves leaderboard to mongo

// CONFIGURATION === "mongo"
    // Initialization calls fetchMongoData()
        // Calls setSchedule() in local state
            // Identifies closest active tournament and calls setActiveTournamentId() and setHighlightedTournamentId() in local state
            // Calls fetchMongoCourses() - sets courses in local state
            // Calls fetchMongoPlayers() - sets courses in local state
            // Calls fetchMongoLeaderboard() - sets leaderboard in local state
            // If date permits, calls setReadyToFetchNewTournamentInfo() automatically (actualDate in place to prevent when not ready in de mode)

const getActualDate = () => {
    const tempDate = new Date();
    const formattedTempDate = moment(tempDate).utc().format('MM/DD/YY');
    return formattedTempDate;
}

const getActualYear = () => {
    const tempDate = new Date();
    const formattedTempDate = moment(tempDate).utc().format('MM/DD/YYYY');
    const formattedTempDateArray = formattedTempDate.split("/");
    return parseInt(formattedTempDateArray[2]);
}

const Pool = () => {
    // Config & dates
    const configuration = "mongo"; // String - Use "mongo" to fetch saved data, "rapidApi" to query new tournament info
    const actualDate = getActualDate();
    const actualYear = getActualYear();
    const hardCodeDate = "01/14/25"; // String - Set to null when not in use
    const [currentDate, setCurrentDate] = useState(null); // String
    const [currentYear, setCurrentYear] = useState(null); // String
    const displayPreviousTournamentForOneDay = true; // Boolean - Ability to (TRUE) show previous tournament for one day after or (FALSE) until next tournament is closer // TODO: Need to determine when Rapid API tournament info is available, same with DFS data

    // Initial state to trigger fetching data
    const [hasStartedFetch, setHasStartedFetch] = useState(false); // Boolean

    // Loading state
    const [isLoading, setIsLoading] = useState(true); // Boolean
    const [isScheduleLoading, setIsScheduleLoading] = useState(false); // Boolean
    const [isCoursesLoading, setIsCoursesLoading] = useState(false); // Boolean
    const [isAllPlayersLoading, setIsAllPlayersLoading] = useState(false); // Boolean
    const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false); // Boolean
    const [isDfsLoading, setIsDfsLoading] = useState(false); // Boolean

    // API responses - can simply use rapidApi front end to get desired results and directly set to null state here
    const [scheduleResponse, setScheduleResponse] = useState(
        // NOT HARDCODING
        null

        // HARDCODING OBJECT FROM RAPID API
        // JSON.parse(JSON.stringify(
            
        // ))
    ); // Object
    const [tournamentResponse, setTournamentResponse] = useState(
        // NOT HARDCODING
        null

        // HARDCODING OBJECT FROM RAPID API
        // JSON.parse(JSON.stringify(
           
        // ))
    ); // Object
    const [leaderboardResponse, setLeaderboardResponse] = useState(
        // NOT HARDCODING
        null

        // HARDCODING OBJECT FROM RAPID API
        // JSON.parse(JSON.stringify(
            
        // ))
    ); // Object

    // Mongo/Rapid API data
    const [schedule, setSchedule] = useState(null); // Object
    const [allPlayers, setAllPlayers] = useState(null); // Object
    const [courses, setCourses] = useState(null); // Object
    const [leaderboard, setLeaderboard] = useState(null); // Object
    const [dfs, setDfs] = useState(null); // Object

    // Pool data
    const [pool, setPool] = useState(null); // Object

    // UI interaction states
    const [highlightedTournamentId, setHighlightedTournamentId] = useState(null); // String
    const [activeTournamentId, setActiveTournamentId] = useState(null); // String
    const [snackbarMessages, setSnackbarMessages] = useState([]); // String
    
    // Controls for display pool entry form
    const [readyToFetchNewTournamentInfo, setReadyToFetchNewTournamentInfo] = useState(false); // Boolean - if date range allows for next tournament data to be pulled, pull it automatically
    const [readyToCalculateDfsSalaries, setReadyToCalculateDfsSalaries] = useState(false); // Boolean - if players are available and DFS salaries have not already been stored to mongo, begin calculations 

    console.log("\n\nschedule",schedule)
    console.log("allPlayers",allPlayers)
    console.log("courses",courses)
    console.log("leaderboard",leaderboard)

    console.log("highlightedTournamentId",highlightedTournamentId)

    
    // END USESTATES

    
    // START USEEFFECTS

    
    // Onload, get schedule, tournament data (players, course info, event info), and scoreboard
    useEffect(() => {
        if (!hasStartedFetch){
            // Set current date
            const date = new Date();            
            const tempDate = hardCodeDate ? hardCodeDate : moment(date).utc().format('MM/DD/YY');
            const fullYear = date.getFullYear();
            setCurrentDate(tempDate);
            setCurrentYear(fullYear);

            // START HARDCODED BLOCK
            
            // Hardcode actions with scheduleResponse/tournamentResponse/leaderboardResponse in useState() and save to mongo
            
            // --HARDCODE scheduleResponse
            // calculateScheduleData()
            
            // --HARDCODE tournamentResponse
            // calculateCourseData();
            // calculatePlayerData();
            
            // --HARDCODE leaderboardReponse
            // calculateLeaderboardData();

            // END HARDCODED BLOCK
            
            // When working locally, can comment below
            if (configuration === "rapidApi") retrieveScheduleDataRapid();
            if (configuration === "mongo") fetchMongoSchedule(fullYear);

            // Prevent multiple rapidApi function calls
            setHasStartedFetch(true);
        }
    });

    // After scheduleResponse is returned, calculate schedule data
    useEffect(() => {
        calculateScheduleData();
    }, [scheduleResponse]);
    
    // After scheduleResponse is returned, fetch tournament data (players, course info, event info)
    useEffect(() => {
        if (configuration === "rapidApi") retrieveTournamentDataRapid();
        // Identify current tournament
        if (schedule && schedule.schedule) {
            const current = new Date(hardCodeDate || currentDate);
            const currentFormattedDate = current.getFullYear();
            let tempActiveTournamentId = null;
            let isReadyToFetchNewTournamentInfo = false;
            for (let i = 0; i < schedule.schedule.length; i++) {
                const currentTournament = schedule.schedule[i];
                const start = new Date(currentTournament.startDate);
                const end = new Date(currentTournament.endDate);
                // Date matches start or end date
                if ((current - start == 0) || (current - end == 0) || (i == schedule.schedule.length - 1)) {
                    tempActiveTournamentId = currentTournament.tournamentId;
                    break;
                }
                // Current date is before end date
                if (current < end) {
                    if (current > start) {
                        // Current date is after start date (tournament in progress)
                        tempActiveTournamentId = currentTournament.tournamentId;
                        break;
                    } else if (i > 0) {
                        const previousTournament = i > 0 ? schedule.schedule[i - 1] : null;
                        const previousEndDate = new Date(previousTournament.endDate);
                        if (current > previousEndDate) {
                            // Config variable - (TRUE) show previous tournament for one day after or (FALSE) until next tournament is closer
                            if (displayPreviousTournamentForOneDay) {
                                if ((current - previousEndDate) > 86400000) {
                                    // If beyond 1 day from previous tournament, begin showing next
                                    tempActiveTournamentId = currentTournament.tournamentId;
                                    // Display pool entry form when next tournament is approaching
                                    isReadyToFetchNewTournamentInfo = true;
                                    break;
                                } else {
                                    // If still within 1 day of previous tournament, continue showing previous  
                                    tempActiveTournamentId = previousTournament.tournamentId;
                                    break;
                                }
                            } else {
                                // Set to which ever date is closer
                                if ((current - previousEndDate) > (start - current)) {
                                    // If closer to next tournament, begin showing next
                                    tempActiveTournamentId = currentTournament.tournamentId;
                                    // Display pool entry form when next tournament is approaching
                                    isReadyToFetchNewTournamentInfo = true;
                                    break;
                                } else {
                                    // If closer in time to last tournaments end, keep active
                                    tempActiveTournamentId = previousTournament.tournamentId;
                                    break;
                                }
                            }
                        }
                    } else {
                        // Before first tournament of year
                        tempActiveTournamentId = currentTournament.tournamentId;
                        break
                    }
                }
            }
            setActiveTournamentId(tempActiveTournamentId);
            setHighlightedTournamentId(tempActiveTournamentId);
            fetchMongoCourses(currentFormattedDate, tempActiveTournamentId);
            fetchMongoPlayers(currentFormattedDate, tempActiveTournamentId);
            fetchMongoLeaderboard(currentFormattedDate, tempActiveTournamentId);
            if (isReadyToFetchNewTournamentInfo && dfsSalaries.length > 0) setReadyToFetchNewTournamentInfo(true);
        }
    }, [schedule]);

    // After tournamentResponse is returned, set tournament data in mongo (players, course info, event info)
    useEffect(() => {
        if (configuration === "rapidApi") {
            calculateCourseData();
            calculatePlayerData();
            retrieveLeaderboardDataRapid();
        }
    }, [tournamentResponse]);

    // After leaderboardResponse is returned, set leaderboard data in mongo
    useEffect(() => {
        calculateLeaderboardData();
    }, [leaderboardResponse]);

    // If between tournaments and tournament data is ready to be fetched, first determine if data is already in mongo otherwise fetched from mongo 
    useEffect(() => {
        if (readyToFetchNewTournamentInfo) {
            // Determine if the data already exists in mongo before fetching
            // Last parameter retrieveTournamentDataWhenReadyAndSavedPlayersNotFound allows fetching new tournament data when if ready and not found in mongo
            fetchMongoPlayers(actualYear, highlightedTournamentId, true);
        }
    }, [readyToFetchNewTournamentInfo])

    // After players have been set for current tournament
    useEffect(() => {
        if (readyToFetchNewTournamentInfo) {
            fetchMongoDfs(actualYear, highlightedTournamentId, true)
        }
    }, [allPlayers])

    // If players already fetched and DFS salaries are not already in mongo, begin to store all data
    useEffect(() => {
        if (allPlayers && dfsSalaries) {
            console.log("allPlayers",allPlayers)
            let tempPlayerSalaries = [];
    
            let allPlayersNameWithoutSpaces = []
            let tempAllPlayersWithoutSpaces = [];
            for (let i = 0; i < allPlayers.players.length; i++) {
                const currentPlayer = allPlayers.players[i];
                const playerNameWithoutSpaces = `${(currentPlayer.firstName).replace(" ", "")}${(currentPlayer.lastName).replace(" ", "")}`;
                allPlayersNameWithoutSpaces.push(playerNameWithoutSpaces)
                tempAllPlayersWithoutSpaces.push({
                    ...currentPlayer,
                    playerNameWithoutSpaces
                });
            }

            console.log("tempAllPlayersWithoutSpaces",tempAllPlayersWithoutSpaces)
    
            let salaryNamesWithoutSpaces = []
            let salaryPlayersNotFoundInPlayersListFromMongo = [];
            for (let i = 0; i < dfsSalaries.length; i++) {
                const currentDfsPlayer = dfsSalaries[i];
                const currentDfsPlayerWithoutSpaces = (currentDfsPlayer.name).replace(" ", "");
                // console.log("currentDfsPlayerWithoutSpaces",currentDfsPlayerWithoutSpaces)
                salaryNamesWithoutSpaces.push(currentDfsPlayerWithoutSpaces)
                const playerFoundIndex = tempAllPlayersWithoutSpaces.findIndex(player => player.playerNameWithoutSpaces === currentDfsPlayerWithoutSpaces);
                if (playerFoundIndex >= 0) {
                    tempPlayerSalaries.push({
                        ...tempAllPlayersWithoutSpaces[playerFoundIndex],
                        salary: currentDfsPlayer.salary
                    });
                } else {
                    salaryPlayersNotFoundInPlayersListFromMongo.push(currentDfsPlayer);
                }
            }
            console.log("salaryNamesWithoutSpaces",salaryNamesWithoutSpaces)

            console.log("salaryNamesWithoutSpaces filtering out allPlayersNameWithoutSpaces", salaryNamesWithoutSpaces.filter(item => !allPlayersNameWithoutSpaces.includes(item)))
            console.log("allPlayersNameWithoutSpaces filtering out salaryNamesWithoutSpaces", allPlayersNameWithoutSpaces.filter(item => !salaryNamesWithoutSpaces.includes(item)))
    
            console.log("salaryPlayersNotFoundInPlayersListFromMongo",salaryPlayersNotFoundInPlayersListFromMongo)
    
            const tempDfsObj = {
                year: actualYear,
                tournamenId: highlightedTournamentId,
                salaries: tempPlayerSalaries
            }
    
            saveDfs(tempDfsObj);
        }
    }, [readyToCalculateDfsSalaries])

    // Once 
    useEffect(() => {
        if (!(isScheduleLoading || isCoursesLoading || isAllPlayersLoading || isLeaderboardLoading || isDfsLoading)) {
            setIsLoading(false);
        }
    }, [isScheduleLoading, isCoursesLoading, isAllPlayersLoading, isLeaderboardLoading, isDfsLoading]);
    

    // END USEEFFECTS


    // START MONGO SAVES


    // Store schedule in mongo
    const saveSchedule = (obj) => {
        setIsScheduleLoading(true);
        axios.put('http://localhost:10000/add-schedule', obj)
            .then((response) => {
                setSnackbarMessages([...snackbarMessages, "Schedule saved"]);
                setIsScheduleLoading(false);
            })
            .catch((error) => {
                setSnackbarMessages([...snackbarMessages, "Error saving schedule"]);
                console.error('Error saving schedule:', error);
                setIsScheduleLoading(false);
            });
    }

    // Store score info in mongo
    const saveCourses = (obj) => {
        setIsCoursesLoading(true);
        axios.put('http://localhost:10000/add-courses', obj)
        .then((response) => {
            setSnackbarMessages([...snackbarMessages, "Courses saved"]);
            setIsCoursesLoading(false);
        })
        .catch((error) => {
            setSnackbarMessages([...snackbarMessages, "Error saving courses"]);
            console.error('Error saving courses:', error);
            setIsCoursesLoading(false);
        });
    }

    // Store tournament data in mongo (players, course info, event info)
    const savePlayers = (obj) => {
        setIsAllPlayersLoading(true);
        axios.put('http://localhost:10000/add-players', obj)
            .then((response) => {
                setSnackbarMessages([...snackbarMessages, "Players saved"]);
                setIsAllPlayersLoading(false);
            })
            .catch((error) => {
                setSnackbarMessages([...snackbarMessages, "Error saving players"]);
                console.error('Error saving players:', error);
                setIsAllPlayersLoading(false);
            });
    }

    // Store leaerboard info in mongo
    const saveLeaderboard = (obj) => {
        setIsLeaderboardLoading(true);
        axios.put('http://localhost:10000/add-leaderboard', obj)
            .then((response) => {
                setSnackbarMessages([...snackbarMessages, "Leaderboard saved"]);
                setIsLeaderboardLoading(false);
            })
            .catch((error) => {
                setSnackbarMessages([...snackbarMessages, "Error saving leaderboard"]);
                console.error('Error saving leaderboard:', error);
                setIsLeaderboardLoading(false);
            });
    }

    // Store leaerboard info in mongo
    const saveDfs = (obj) => {
        setIsDfsLoading(true);
        axios.put('http://localhost:10000/add-dfs', obj)
            .then((response) => {
                setSnackbarMessages([...snackbarMessages, "DFS salaries saved"]);
                setIsDfsLoading(false);
            })
            .catch((error) => {
                setSnackbarMessages([...snackbarMessages, "Error saving DFS salaries"]);
                console.error('Error saving DFS salaries:', error);
                setIsDfsLoading(false);
            });
    }


    // END MONGO SAVES


    // START MONGO GETS


    const fetchMongoSchedule = async (currentYear) => {
        setIsScheduleLoading(true);
        try {
            await axios.get("http://localhost:10000/get-schedule", { params: { year: currentYear }})
                .then((response) => {
                    setSchedule(response.data);
                    setIsScheduleLoading(false);
                })
        } catch (err) {
            console.error('Error fetching saved schedule');
            setIsScheduleLoading(false);
        }
    }

    const fetchMongoCourses = async (currentYear, tournamentId) => {
        setIsCoursesLoading(true);
        try {
            await axios.get("http://localhost:10000/get-courses", { params: { year: currentYear, tournamentId: tournamentId }})
                .then((response) => {
                    setCourses(response.data);
                    setIsCoursesLoading(false);
                })
        } catch (err) {
            console.error('Error fetching saved courses');
            setIsCoursesLoading(false);
        }
    }

    const fetchMongoPlayers = async (currentYear, tournamentId, retrieveTournamentDataWhenReadyAndSavedPlayersNotFound) => {
        setIsAllPlayersLoading(true);
        try {
            await axios.get("http://localhost:10000/get-players", { params: { year: currentYear, tournamentId: tournamentId }})
                .then((response) => {
                    setAllPlayers(response.data);
                    setIsAllPlayersLoading(false);
                })
        } catch (err) {
            console.error('Error fetching saved players');
            setIsAllPlayersLoading(false);
            if (retrieveTournamentDataWhenReadyAndSavedPlayersNotFound) {
                retrieveTournamentDataRapid();
            }
        }
    }

    const fetchMongoLeaderboard = async (currentYear, tournamentId) => {
        setIsLeaderboardLoading(true);
        try {
            await axios.get("http://localhost:10000/get-leaderboard", { params: { year: currentYear, tournamentId: tournamentId }})
                .then((response) => {
                    setLeaderboard(response.data);
                    setIsLeaderboardLoading(false);
                })
        } catch (err) {
            console.error('Error fetching saved players');
            setIsLeaderboardLoading(false);
        }
    }

    const fetchMongoDfs = async (currentYear, tournamentId, beginDfsCalculations) => {
        setIsDfsLoading(true);
        try {
            await axios.get("http://localhost:10000/get-dfs", { params: { year: currentYear, tournamentId: tournamentId }})
                .then((response) => {
                    setDfs(response.data);
                    setIsDfsLoading(false);
                })
        } catch (err) {
            console.error('Error fetching saved DFS');
            setIsDfsLoading(false);
            if (beginDfsCalculations) setReadyToCalculateDfsSalaries(true);
        }
    }


    // END MONGO GETS
    
    
    // START CALCULATIONS


    const calculateScheduleData = () => {
        if (scheduleResponse) {
            // Set tournament schedule
            let tempSchedule = [];
            for (let i = 0; i < scheduleResponse.schedule.length; i++) {
                const currentTournament = scheduleResponse.schedule[i];
                // In 2026, this might not work as expected, due to date formats
                const rawStartDate = currentTournament.date.start;
                const rawEndDate = currentTournament.date.end;
                const formattedStartDate = moment(rawStartDate).utc().format('MM/DD/YY');
                const formattedEndDate = moment(rawEndDate).utc().format('MM/DD/YY');
                tempSchedule.push({
                    tournamentId: currentTournament.tournId,
                    name: currentTournament.name,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    weekNumber: parseInt(currentTournament.date.weekNumber)
                });
            }
            tempSchedule = tempSchedule.sort((a, b) => a.weekNumber - b.weekNumber)
            
            const tempScheduleObj = {
                year: scheduleResponse.year,
                schedule: tempSchedule
            };

            setSchedule(tempScheduleObj);
            saveSchedule(tempScheduleObj);
        }
    }

    const calculateCourseData = () => {
        if (tournamentResponse && tournamentResponse.courses) {
            // Set course(s)
            const responseCourses = tournamentResponse.courses;
            const tempCourses = []
            for (let i = 0; i < responseCourses.length; i++) {
                const currentCourse = responseCourses[i];
                tempCourses.push({
                    tournamentId: tournamentResponse.tournId,
                    courseId: currentCourse.courseId,
                    courseName: currentCourse.courseName,
                    holes: currentCourse.hole,
                    location: currentCourse.location,
                    parTotal: currentCourse.parTotal
                });
            }

            const tempCoursesObj = {
                year: tournamentResponse.year,
                tournamentId: tournamentResponse.tournId,
                courses: tempCourses
            };

            setCourses(tempCoursesObj);
            saveCourses(tempCoursesObj);
        }
    }

    const calculatePlayerData = () => {
        if (tournamentResponse && tournamentResponse.players) {
            // Set players
            const responsePlayers = tournamentResponse.players;
            const tempPlayers = []
            for (let i = 0; i < responsePlayers.length; i++) {
                const currentPlayer = responsePlayers[i];
                tempPlayers.push({
                    firstName: currentPlayer.firstName,
                    lastName: currentPlayer.lastName,
                    playerId: currentPlayer.playerId,
                    isAmateur: currentPlayer.isAmateur,
                    teeTimes: currentPlayer.teeTimes
                });
            }
            const tempAllPlayersObj = {
                year: tournamentResponse.year,
                tournamentId: tournamentResponse.tournId,
                players: tempPlayers,
            };

            setAllPlayers(tempAllPlayersObj);
            savePlayers(tempAllPlayersObj);
        } else {
            setSnackbarMessages([...snackbarMessages, "Player information for this tournament is not available yet."]);
            setAllPlayers(null);
        }
    }

    const calculateLeaderboardData = () => {
        if (leaderboardResponse && leaderboardResponse.leaderboardRows) {
            // Set leaderboard
            const responseLeaderboard = leaderboardResponse.leaderboardRows;
            const tempLeaderboard = []
            for (let i = 0; i < responseLeaderboard.length; i++) {
                const currentPlayer = responseLeaderboard[i];
                tempLeaderboard.push({
                    playerDemographics: {
                        firstName: currentPlayer.firstName || null,
                        lastName: currentPlayer.lastName || null,
                        playerId: currentPlayer.playerId || null,
                        isAmateur: currentPlayer.isAmateur || null,
                    },
                    tournamentInfo: {
                        teeTimes: currentPlayer.teeTimes || null,
                        courseId: currentPlayer.courseId || null,
                    },
                    scoring: {
                        position: currentPlayer.position || null, // Number - determines standings
                        rounds: currentPlayer.rounds || null,
                    },
                    progress: {
                        status: currentPlayer.status || null, // String - can be set to "cut", "wd" - need to use as null checks/sort method for players in leaderboard
                        currentRound: currentPlayer.currentRound || null, // Number - indicated 1-4 which round is being played currently
                        thru: currentPlayer.thru || null, // Appears as string "F" right now, could this be a number?
                        startingHole: currentPlayer.startingHole || null,
                        currentHole: currentPlayer.currentHole || null,
                    },
                });
            }

            const tempLeaderboardObj = {
                year: leaderboardResponse.year,
                tournamentId: leaderboardResponse.tournId,
                leaderboard: tempLeaderboard,
            };

            setLeaderboard(tempLeaderboardObj);
            saveLeaderboard(tempLeaderboardObj);
        }
    }


    // END CALCULATIONS


    // START RAPID API OPERATIONS


    // Retrieve schedule data (entire PGA season data)
    const retrieveScheduleDataRapid = async () => {
        // Link
        // https://rapidapi.com/slashgolf/api/live-golf-data/playground/apiendpoint_93236d46-7a6c-4406-aa79-d333d08b717e
        
        setIsScheduleLoading(true);

        const options = {
            method: 'GET',
            url: 'https://live-golf-data.p.rapidapi.com/schedule',
            params: {
                orgId: '1',
                year: '2025'
            },
            headers: {
                'x-rapidapi-host': 'live-golf-data.p.rapidapi.com',
                // 'x-rapidapi-key': '0598eb6b02msh5b4a6094ffc4e05p1c4f7djsnb241d4f5f1fe' // jackgils.n@gmail.com
                'x-rapidapi-key': '61ed57e536msh30168bd1f1e8ffep126523jsnfd01ffcdc1bf' // jgilson1997@yahoo.com
            }
        };
        
        try {
            const response = await axios.request(options);
            setScheduleResponse(response.data);
            setIsScheduleLoading(false);
        } catch (error) {
            console.error(error);
            setIsScheduleLoading(false);
        }
    }

    // Retrieve tournament data (players, course info, event info)
    const retrieveTournamentDataRapid = async () => {
        // Link
        // https://rapidapi.com/slashgolf/api/live-golf-data/playground/apiendpoint_8a041a6a-98bc-4ed2-95af-4dcdb76f7c66

        if (highlightedTournamentId) {
            setIsCoursesLoading(true);
            setIsAllPlayersLoading(true);
    
            const options = {
                method: 'GET',
                url: 'https://live-golf-data.p.rapidapi.com/tournament',
                params: {
                    orgId: '1',
                    tournId: highlightedTournamentId,
                    year: '2025'
                },
                headers: {
                    'x-rapidapi-host': 'live-golf-data.p.rapidapi.com',
                    // 'x-rapidapi-key': '0598eb6b02msh5b4a6094ffc4e05p1c4f7djsnb241d4f5f1fe' // jackgils.n@gmail.com
                    'x-rapidapi-key': '61ed57e536msh30168bd1f1e8ffep126523jsnfd01ffcdc1bf' // jgilson1997@yahoo.com
                }
            };
        
            try {
                const response = await axios.request(options);
                setTournamentResponse(response.data);
                setIsCoursesLoading(false);
                setIsAllPlayersLoading(false);
            } catch (error) {
                console.error(error);
                setIsCoursesLoading(false);
                setIsAllPlayersLoading(false);
            }
        } else {
            console.log("Did not attempt to get tournament info because highlightedTournamentId is missing")
        }
    }

    const retrieveLeaderboardDataRapid = async () => {
        // Link
        // https://rapidapi.com/slashgolf/api/live-golf-data/playground/apiendpoint_a6e32f80-75c7-4c35-ab1b-bbd685ee82f3

        if (highlightedTournamentId) {
            setIsLeaderboardLoading(true);
    
            const options = {
                method: 'GET',
                url: 'https://live-golf-data.p.rapidapi.com/leaderboard',
                params: {
                    orgId: '1',
                    tournId: highlightedTournamentId,
                    year: '2025'
                },
                headers: {
                    'x-rapidapi-host': 'live-golf-data.p.rapidapi.com',
                    // 'x-rapidapi-key': '0598eb6b02msh5b4a6094ffc4e05p1c4f7djsnb241d4f5f1fe' // jackgils.n@gmail.com
                    'x-rapidapi-key': '61ed57e536msh30168bd1f1e8ffep126523jsnfd01ffcdc1bf' // jgilson1997@yahoo.com
                }
            };
              
            try {
                const response = await axios.request(options);
                setLeaderboardResponse(response.data);
                setIsLeaderboardLoading(false);
            } catch (error) {
                console.error(error);
                setIsLeaderboardLoading(false);
            }
        } else {
            console.log("Did not attempt to get leaderboard info because highlightedTournamentId is missing")
        }
    }


    // END RAPID API OPERATIONS


    // START VALIDATIONS






    // END VALIDATIONS


    // START UI FUNCTIONS


    const handleRemoveSnackbarMessage = (messageToBeRemoved) => {
        let currentSnackbarMessages = snackbarMessages;
        let tempSnackbarMessages = [];
        for (let i; i < currentSnackbarMessages.length; i++) {
            if (currentSnackbarMessages[i] !== messageToBeRemoved) tempSnackbarMessages.push(currentSnackbarMessages[i]);
        }
        setSnackbarMessages(tempSnackbarMessages);
    }

    const getSortedSchedule = () => {
        let tempSortedSchedule = [];
        const tempSchedule = schedule.schedule;
        const highlightedTournamentIndex = tempSchedule.findIndex(tournament => tournament.tournamentId === highlightedTournamentId);
        tempSortedSchedule.push(tempSchedule[highlightedTournamentIndex]);
        for (let i = 0; i < tempSchedule.length; i++) {
            if (i !== highlightedTournamentIndex) tempSortedSchedule.push(tempSchedule[i]);
            const majorTournamentNames = [
                "Masters Tournament",
                "PGA Championship",
                "U.S. Open",
                "The Open Championship"
            ];
            if (majorTournamentNames.includes(tempSchedule[i].name)) {
                const majorTournamentIndex = tempSortedSchedule.findIndex(tournament => tournament.tournamentId === tempSchedule[i].tournamentId)
                tempSortedSchedule[majorTournamentIndex] = {
                    ...tempSortedSchedule[majorTournamentIndex],
                    majorTournament: true
                }
            }
        }
        return tempSortedSchedule;
    }

    const sortedSchedule = schedule && schedule.schedule ? highlightedTournamentId ? getSortedSchedule() : schedule.schedule : [];

    const getTournamentDatesFormattedWithoutYear = (tournament) => {
        const startDateArray = tournament.startDate.split("/");
        const endDateArray = tournament.endDate.split("/");
        return `${startDateArray[0]}/${startDateArray[1]} - ${endDateArray[0]}/${endDateArray[1]}`;
    }


    // END UI FUNCTIONS


    // START RENDER FUNCTION


    return (
        <div className="flexColumn alignCenter paddingBottomMassive golf pool">
            {/* Display loader when fetching data */}
            {isLoading && <div className="alignCenter" style={{ marginTop: "40vh" }}><CircularProgress /></div>}
            {!isLoading && 
                <div className="">
                    {/* Tournament selection dropdown */}
                    {schedule &&
                        <FormControl sx={{ m: 1 }} variant="filled">
                            <Select
                                labelId="demo-multiple-checkbox-label"
                                id="demo-multiple-checkbox"
                                deafultValue={highlightedTournamentId}
                                value={activeTournamentId}
                                onChange={(e) => setActiveTournamentId(e.target.value)}
                            >
                                {sortedSchedule.map((tournament, i) => (
                                    <MenuItem key={tournament.tournamentId} value={tournament.tournamentId}>
                                        <div className={`width100Percent justifySpaceBetween ${highlightedTournamentId === tournament.tournamentId ? " hidePushPin" : ""}`}>
                                            <div className="flexRow marginRightMedium">
                                                <span className="marginRightMedium">{getTournamentDatesFormattedWithoutYear(tournament)}</span>
                                                {tournament.majorTournament && <SportsGolfIcon />}
                                                <b>{tournament.name}</b>
                                            </div>
                                            {i == 0 &&
                                                <PushPin />
                                            }
                                        </div>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    }

                    {/* Can likely remove */}
                    {/* Player display */}
                    {allPlayers && allPlayers.players.map(player => {
                        return (<p>{player.isAmateur && '(A) '}{player.firstName} {player.lastName}</p>)
                    })}


                    {/* Pool entry form */}
                    {/* 

                    Only display when current tournament is selected?
                        If future tournament is selected, display messaging "There is nothing to display right now"
                            Or just display future tournaments?


                    Static
                        tournament name
                        dates
                        Course

                    SCORING RULES modal
                    
                    Links for datagolf? as modal?
                    
                    Validations atop page
                    - Salary

                    Full Name
                    Email - field validation
                    List of players - multiple columns if there's room?

                    Radio button "I have submitted payment via Venmo or Apple Pay" <b>WITH THE TOURNAMENT NAME IN THE DESCRIPTION</b>
                    (optional) share venmo name if it's weird
                    (optional) phone number - in case one of your golfers has WD prior to tournament, I can text you (instead of email), otherwise I will choose a player for you with the next closest salary with highest PPG on DraftKings

                    if desktop, can display L/R section
                        Large text box for "suggestions"


                    Enable submit button once everything is valid
                    
                    */}
                </div>
            }

            {/* Snackbar */}
            {snackbarMessages && snackbarMessages.map(snackbarMessage => {
                return (
                    <Snackbar
                        open={snackbarMessage}
                        autoHideDuration={6000}
                        onClose={() => handleRemoveSnackbarMessage(snackbarMessage)}
                        message={snackbarMessage}
                        action={<IconButton size="small" aria-label="close" style={{ color: "white" }} onClick={() => handleRemoveSnackbarMessage(snackbarMessage)}><CloseIcon color="white" /></IconButton>}
                    />
                )
            })}
        </div>
    );


    // END RENDER


}

export default Pool;