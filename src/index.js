import '../node_modules/font-awesome/css/font-awesome.min.css';
import './custom.scss';

import $ from "jquery";
window.$ = window.jQuery = $;  // make jQuery globally available

const channels = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "habathcx", "RobotCaleb", "noobs2ninjas"];

let cachedData;

$(() => {
    setupNameFilter();
    setupStatusFilter();
    getData().then((data) => {
        cachedData = data;
        displayData(data);
    });
});


function setupNameFilter() {
    $("#name-filter input").on("change keyup paste",() => {
        displayData(cachedData);
    })
}

function setupStatusFilter() {
    $("#status-filter input[name=status-filter-radio]").change(() => {
        displayData(cachedData);
    })
}


function getData() {
    let baseUrl = "https://wind-bow.gomix.me/twitch-api/";
    var data = {};
    var deferredCalls = [];

    channels.forEach((channel) => {

        data[channel] = {}

        let userCall = $.get(baseUrl + "users/" + channel, function () { }, "jsonp").done((result) => {
            data[channel].name = channel;
            data[channel].displayName = result.display_name;
            data[channel].image = result.logo;
            data[channel].url = `https://www.twitch.tv/${channel}`;
        });
        deferredCalls.push(userCall);

        let streamCall = $.get(baseUrl + "streams/" + channel, function () { }, "jsonp").then((result) => {
            
            if (result.stream) { // streamer is online
                data[channel].status = "online";
            }
            else {
                data[channel].status = "offline";
            }
        });
        deferredCalls.push(streamCall);
    });


    // we have to return our data within a then() function and NOT a done() function. reason: http://stackoverflow.com/questions/26530282/chaining-multiple-done-callbacks-to-the-same-deferred-promise
    // "Basically, done adds a handler and returns the same promise and .then returns a new promise chained from the last one. In general I'd only use .done to terminate chains and if you want to keep the return value (the argument of the function(){)"

    return $.when.apply($, deferredCalls).then(() => {
        return data;
    });

}

function displayData(data) {

    $("#channels").empty();

    let nameFilter = $("#name-input").val();
    let statusFilter = $("#status-filter input[name=status-filter-radio]:checked").val();

    Object.values(data).filter((channel) => {
        if ((channel.status === statusFilter || statusFilter === "all") && 
            ((!nameFilter) || (nameFilter && channel.displayName.match(new RegExp(nameFilter, "i")))))
            return true;
        else
            return false;
    }).forEach((channel) => {
        displayChannel(channel)
    })

}

function displayChannel(channel) {
    $("#channels").append(`
        <div class="channel">
            <h3>${channel.displayName}</h3>
        </div>
    `);
}