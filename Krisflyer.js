function Model() {
    var self = this;
    self.UpcomingFlights = ko.observableArray();
    self.PastFlights = ko.observableArray();
}

function Booking(from, to, traveldate, points, ticketno) {
    var bk = this;
    bk.From = from;
    bk.To = to;
    bk.Date = traveldate;
    bk.Points = points;
    bk.ETicketNo = ticketno;
}

var xrmContext = GetGlobalContext();
///Deserialize JqueryPlugin/
(function ($) {
    $.deserialize = function (str, options) {
        var pairs = str.split(/&amp;|&/i),
            h = {},
            options = options || {};
        for (var i = 0; i < pairs.length; i++) {
            var kv = pairs[i].split('=');
            kv[0] = decodeURIComponent(kv[0]);
            if (!options.except || options.except.indexOf(kv[0]) == -1) {
                if ((/^\w+\[\w+\]$/).test(kv[0])) {
                    var matches = kv[0].match(/^(\w+)\[(\w+)\]$/);
                    if (typeof h[matches[1]] === 'undefined') {
                        h[matches[1]] = {};
                    }
                    h[matches[1]][matches[2]] = decodeURIComponent(kv[1]);
                } else {
                    h[kv[0]] = decodeURIComponent(kv[1]);
                }
            }
        }
        return h;
    };

    $.fn.deserialize = function (options) {
        return $.deserialize($(this).serialize(), options);
    };
})(jQuery);


$(function () {
    debugger;
    
    if (xrmContext != null && xrmContext.getQueryStringParameters() != null && xrmContext.getQueryStringParameters().data != null) {
        var data = $.deserialize(xrmContext.getQueryStringParameters().data);
        var dataModel = new Model();

        SDK.REST.retrieveMultipleRecords("new_membershipdetails", "$filter=new_KrisflyerNo eq '" + data.kfNo + "'", function (results) {
            if (results.length > 0) {
                $("#hdrKFNo").text(results[0].new_KrisflyerNo);
                $("#hdrKFMiles").text(results[0].new_Points + " KrisFlyer miles");
                $("#hdrCInfo").text(results[0].new_name);

                var bar = new ProgressBar.Circle('#divChart', {
                    strokeWidth: 4.5,
                    easing: 'easeInOut',
                    duration: 1400,
                    color: 'rgb(198, 198, 198)',
                    trailColor: '#fff',
                    trailWidth: 4.5,
                    svgStyle: null,
                    text: {
                        value: ((results[0].new_Points / 20000) < 1 ? "Elite Silver" : ((results[0].new_Points / 20000) < 2 ? "Elite Gold" : "Elite Platinum")),
                        style: {
                            color: "#00266b",
                            fontSize: "39px",
                            display: "block",
                            left: "50%",
                            position: "absolute",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center"
                        }
                    }
                });

                bar.animate((results[0].new_Points % 20000) / 20000);

                $(bar.text).append($('<p style="font-size:19px; color: black;">' + (20000 - (results[0].new_Points % 20000)).toString() + " for next level</p>"));
               
                debugger;
                var ucFlights = [];
                var pFlights = [];
                SDK.REST.retrieveMultipleRecords("new_booking", "$filter=new_KrisFlyer/Id eq guid'" + results[0].new_membershipdetailsId + "'", function (results2) {
                    if (results2.length > 0) {
                       
                        for (var i = 0; i < results2.length; i++) {
                            if (results2[i].new_TravelDate > (new Date())) {
                                ucFlights.push(new Booking(results2[i].new_From, results2[i].new_To, results2[i].new_TravelDate.toDateString(), results2[i].new_Points, results2[i].new_ETicketNo));
                            }
                            else {
                                pFlights.push(new Booking(results2[i].new_From, results2[i].new_To, results2[i].new_TravelDate.toDateString(), results2[i].new_Points, results2[i].new_ETicketNo));
                            }
                        }

                    }
                }, function () {
                }, function () {
                    dataModel.UpcomingFlights(ucFlights);
                    dataModel.PastFlights(pFlights);

                    ko.applyBindings(dataModel);
                })

            }
        }, function () {
        }, function () {
        })

       

       

    }
});